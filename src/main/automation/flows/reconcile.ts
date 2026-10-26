import type { Flow } from '@main/automation/types'
import { RowIssue } from '@shared/automation/errors'

/** What decide() returns: take an action, finish with a result, or stop with an error. */
export type Decision<A, R> = { act: A } | { done: R } | { fail: Error }

export type ReconcileSpec<O, M, A, R> = {
  /** Starting memory: facts the page can't show (e.g. "already submitted"). */
  init: M
  /** Read the page into plain data. No decisions, only reads. */
  observe: () => Flow<O>
  /** Pure: given what's on the page and what we remember, pick the next step. */
  decide: (obs: O, mem: M) => Decision<A, R>
  /** Perform one action, wait until its effect is visible, and return updated memory. */
  execute: (action: A, mem: M) => Flow<M>
  /** Safety net against loops that never settle. */
  maxSteps?: number
}

export function* reconcile<O, M, A, R>(spec: ReconcileSpec<O, M, A, R>): Flow<R> {
  const maxSteps = spec.maxSteps ?? 10
  let mem = spec.init

  for (let step = 0; step < maxSteps; step++) {
    const obs = yield* spec.observe()
    const decision = spec.decide(obs, mem)

    if ('done' in decision) return decision.done
    if ('fail' in decision) throw decision.fail

    mem = yield* spec.execute(decision.act, mem)
  }

  throw new RowIssue('INTERNAL', `Flow did not settle after ${maxSteps} steps.`)
}
