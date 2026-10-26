import {
  checkIfExistingMatches,
  fillFlush,
  isSameFlush,
  openExistingFlush
} from '@main/automation/flows/flush/helpers'
import { type Decision, reconcile } from '@main/automation/flows/reconcile'
import type { EmbryoTab, ScopeConsumer } from '@main/automation/site'
import type { Flow, MatchResult } from '@main/automation/types'
import { act, narr } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'
import { type TFlushTableRow, ZFlushTableRow } from '@shared/schemas/jobs/site.schemas'

// rowIdx → result of opening that row and comparing
export type FlushMem = { submitted: boolean; checks: Record<number, MatchResult> }
export type FlushObs = { rows: TFlushTableRow[] }
export type FlushAction = { do: 'verify'; rowIdx: number } | { do: 'fill' }

export function parseFlushTable(raw: Record<string, unknown>[]): TFlushTableRow[] {
  const res = raw.map((r) => ZFlushTableRow.safeParse(r))
  if (res.some((r) => !r.success))
    throw new RowIssue(
      'INTERNAL',
      'There was an issue reading the flushes table. No action necessary.'
    )
  return res.map((r) => r.data).filter((r) => r !== undefined)
}

export function findMatchingFlush(row: TFileRow<'flush'>, rows: TFlushTableRow[]) {
  const idxs = rows.flatMap((r, i) => (isSameFlush(row, r) ? [i] : []))
  if (idxs.length > 1) throw new RowIssue('REVIEW', 'Multiple matching flushes already exist.')
  return idxs.length === 1 ? { exists: true as const, rowIdx: idxs[0] } : { exists: false as const }
}

export const observeFlush = function* (scope): Flow<FlushObs> {
  yield* act.waitForVisible(scope.flushForm.$enter)
  const hasTable = yield* act.getIsVisible(scope.flushTable)
  const raw = hasTable ? yield* act.extractTable(scope.flushTable) : []
  return { rows: parseFlushTable(raw) }
} satisfies ScopeConsumer<EmbryoTab, unknown>

export function decideFlush(
  row: TFileRow<'flush'>,
  obs: FlushObs,
  mem: FlushMem
): Decision<FlushAction, string> {
  const match = findMatchingFlush(row, obs.rows) // may throw REVIEW for duplicates

  if (!match.exists) {
    if (mem.submitted)
      return { fail: new RowIssue('NOT_FOUND', 'Could not locate new flush data in the table.') }
    return { act: { do: 'fill' } }
  }

  const check = mem.checks[match.rowIdx]
  if (!check) return { act: { do: 'verify', rowIdx: match.rowIdx } }
  if (check.valid) return { done: check.screenshot }

  if (mem.submitted)
    return { fail: new RowIssue('REVIEW', 'Checked work did not match what was input.') }
  return {
    fail: new RowIssue('REVIEW', 'A flush with matching numbers exists, but other fields differ.')
  }
}

export function* executeFlush(
  scope: EmbryoTab,
  row: TFileRow<'flush'>,
  action: FlushAction,
  mem: FlushMem
): Flow<FlushMem> {
  switch (action.do) {
    case 'verify': {
      yield narr('Reviewing a previous entry...')
      const modal = yield* openExistingFlush(scope, action.rowIdx)
      const result = yield* checkIfExistingMatches(modal, row)
      return { ...mem, checks: { ...mem.checks, [action.rowIdx]: result } }
    }
    case 'fill': {
      yield narr('Entering data...')
      yield* fillFlush(scope, row)
      yield* act.waitForVisible(scope.flushTable) // settle: the new row must exist before the next observe
      return { submitted: true, checks: {} } // reset: row indices may have shifted
    }
  }
}

export const checkOrFillFlush = function* (scope, row: TFileRow<'flush'>) {
  yield narr('Looking for a matching flush...')
  const init: FlushMem = { submitted: false, checks: {} }
  return yield* reconcile({
    init,
    observe: () => observeFlush(scope),
    decide: (obs, mem) => decideFlush(row, obs, mem),
    execute: (action, mem) => executeFlush(scope, row, action, mem)
  })
} satisfies ScopeConsumer<EmbryoTab, string>
