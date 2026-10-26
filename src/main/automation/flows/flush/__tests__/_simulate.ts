import { fakeFlow } from '@main/automation/flows/__tests__/_fake-flow'
import {
  decideFlush,
  type FlushAction,
  type FlushMem,
  type FlushObs
} from '@main/automation/flows/flush'
import { toFlushTableRow } from '@main/automation/flows/flush/helpers'
import { reconcile } from '@main/automation/flows/reconcile'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'

export type Flush = TFileRow<'flush'>

export type World = {
  flushes: Flush[] // what the site has stored
  dropsWrites?: boolean // site accepts the submit but saves nothing
  corrupts?: 'comments' | 'frozen' // site saves a wrong value in this field
}

/** mirrors checkIfExistingMatches: only fields the row defines are compared */
export const sameDetails = (row: Flush, stored: Flush) =>
  (Object.keys(row) as (keyof Flush)[]).every((k) => row[k] === undefined || row[k] === stored[k])

const corrupt = (row: Flush, field?: World['corrupts']): Flush =>
  field === 'frozen' ? { ...row, frozen: (row.frozen || 0) + 1 }
  : field === 'comments' ? { ...row, comments: `${row.comments ?? ''}x` }
  : row

export function simulate(row: Flush, world: World, failAt?: number) {
  let tick = 0
  let writes = 0
  const maybeFail = () => {
    if (tick++ === failAt) throw new Error('injected')
  }

  const flow = reconcile<FlushObs, FlushMem, FlushAction, string>({
    init: { submitted: false, checks: {} },

    // eslint-disable-next-line require-yield
    observe: function* () {
      maybeFail()
      return { rows: world.flushes.map(toFlushTableRow) }
    },

    decide: (obs, mem) => decideFlush(row, obs, mem),

    // eslint-disable-next-line require-yield
    execute: function* (action, mem) {
      maybeFail() // crash before the write
      if (action.do === 'fill') {
        writes++
        if (!world.dropsWrites) world.flushes.push(corrupt(row, world.corrupts))
        maybeFail() // crash after submit, before verify
        return { submitted: true, checks: {} }
      }
      const stored = world.flushes[action.rowIdx]
      return {
        ...mem,
        checks: {
          ...mem.checks,
          [action.rowIdx]: { valid: sameDetails(row, stored), screenshot: 'shot' }
        }
      }
    }
  })

  try {
    const { result } = fakeFlow(flow, () => {
      throw new Error('sim: no page')
    })
    return { outcome: 'done' as const, result, writes }
  } catch (err) {
    return {
      outcome: err instanceof RowIssue ? ('issue' as const) : ('error' as const),
      err,
      writes
    }
  }
}
