import type { Flow } from '@main/automation/types'
import { type AnyAction, type TAction } from '@shared/automation/act'
import type { TSelector } from '@shared/automation/sel'

/** Answers actions by looking up the target selector.
 *  In the map = visible with that text. Not in the map = not visible. */
export const fakePage =
  (texts?: Map<TSelector, string | undefined>) => (_stepIdx: number, action: TAction) => {
    const target = action.target?.[0]
    switch (action.type) {
      case 'getIsVisible':
        return texts!.has(target!) && texts?.get(target!) !== undefined
      case 'getText':
        return texts!.get(target!) ?? null
      case 'screenshot':
        return 'screenshot.png'
      default:
        return undefined // waitForVisible, click, ...
    }
  }

export const fakePages = (
  before: Map<TSelector, string>,
  after: Map<TSelector, string>,
  submit: TSelector
) => {
  let submitted = false
  return (i: number, action: TAction) => {
    const res = fakePage(submitted ? after : before)(i, action)
    if (action.type === 'click' && action.target?.[0] === submit) submitted = true
    return res
  }
}

export function fakeFlow<R>(flow: Flow<R>, handle: (stepIdx: number, action: TAction) => unknown) {
  const actions: TAction[] = []
  let step = flow.next()
  let stepIdx = 0

  while (!step.done) {
    const directive = step.value
    if (directive.kind !== 'dispatch') {
      step = flow.next() // discard non-actions
      continue
    }
    actions.push(directive.action)
    let response: unknown
    try {
      response = handle(stepIdx, directive.action)
    } catch (err) {
      step = flow.throw(err) // simulate action failing
      stepIdx++
      continue
    }
    step = flow.next(response)
    stepIdx++
  }

  return { result: step.value, actions }
}

export const respond =
  (responses: Array<Partial<Record<AnyAction['type'], unknown>> | Error>) =>
  (stepIdx: number, action: TAction) => {
    const r = responses[stepIdx]
    if (r instanceof Error) throw r
    if (!r || !(action.type in r)) {
      throw new Error(
        `fakeFlow: step ${stepIdx} dispatched "${action.type}" but no response was provided for it`
      )
    }
    const value = r[action.type as keyof typeof r]
    if (value instanceof Error) throw value // simulate this action failing
    return value
  }
