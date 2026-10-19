import { flows } from '@main/automation/flows'
import type { Flow, Handlers } from '@main/automation/types'
import { sel } from '@shared/automation'
import { AbortedError, RowIssue } from '@shared/automation/errors'
import type { TFileRow, TProcessId } from '@shared/schemas/jobs'

async function drive<T>(gen: Flow<T>, h: Handlers): Promise<T> {
  let step = gen.next()

  while (!step.done) {
    if (h.signal.aborted) {
      // runs finally blocks, skips catch blocks
      gen.return(undefined as never)
      throw new AbortedError()
    }

    const directive = step.value
    let result: unknown = undefined

    switch (directive.kind) {
      case 'dispatch': {
        try {
          result = await h.request(directive.action)
        } catch (e) {
          if (h.signal.aborted) throw new AbortedError()
          step = gen.throw(e)
        }
        break
      }
      case 'narrate': {
        await h.onNarration(directive.narration)
        break
      }
      case 'warn': {
        await h.onWarn(directive.warning)
        break
      }
      default:
        throw new Error(`Impossible case: ${directive satisfies never}`)
    }

    step = gen.next(result)
  }

  return step.value
}

export async function runFlow<K extends TProcessId>(
  processId: TProcessId,
  rows: TFileRow<K>[],
  h: Handlers
) {
  const flow = flows[processId]
  await drive(flow.setup(), h)

  for (const [index, row] of rows.entries()) {
    try {
      await h.onStart(index)
      const { screenshot } = await drive(flow.row(row, index), h)
      await h.onCommit(index, screenshot)
    } catch (e) {
      // We aborted, let AutomationService deal with it
      if (e instanceof AbortedError) throw e

      // Don't throw. Just make note and skip to next
      if (e instanceof RowIssue) {
        console.error('ENCOUNTERED ISSUE', String(e))
        const screenshot = await h.request({
          type: 'screenshot',
          target: e.target ?? [sel.css('body')],
          input: undefined
        })
        await h.onIssue(index, e, screenshot)
      } else {
        // ToDo: A flow can still throw. This is more of a dev-time Band-Aid.
        if (e instanceof Error) throw e
      }

      if (flow.recover) await drive(flow.recover(), h)
    }
  }
}
