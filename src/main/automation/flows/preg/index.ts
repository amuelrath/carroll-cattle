import {
  checkIfExistingMatches,
  fillPreg,
  isSamePreg,
  openExistingPreg
} from '@main/automation/flows/preg/helpers'
import { type Decision, reconcile } from '@main/automation/flows/reconcile'
import type { BreedingTab, ScopeConsumer } from '@main/automation/site'
import type { Flow, MatchResult } from '@main/automation/types'
import { act, narr } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'

import { type TPregTableRow, ZPregTableRow } from '@shared/schemas/jobs/site.schemas'

export type PregMem = { submitted: boolean; checks: Record<number, MatchResult> }
export type PregObs = { rows: TPregTableRow[] }
export type PregAction = { do: 'verify'; rowIdx: number } | { do: 'fill'; prevCount: number }

export function parsePregTable(raw: Record<string, unknown>[]): TPregTableRow[] {
  const res = raw.map((r) => ZPregTableRow.safeParse(r))
  if (res.some((r) => !r.success))
    throw new RowIssue(
      'INTERNAL',
      'There was an issue reading the preg checks table. No action necessary.'
    )
  return res.map((r) => r.data).filter((r) => r !== undefined)
}

export function findMatchingPreg(row: TFileRow<'pregCheck'>, rows: TPregTableRow[]) {
  const idxs = rows.flatMap((r, i) => (isSamePreg(row, r) ? [i] : []))
  if (idxs.length > 1) throw new RowIssue('REVIEW', 'Multiple matching preg checks already exist.')
  return idxs.length === 1 ? { exists: true as const, rowIdx: idxs[0] } : { exists: false as const }
}

export const observePreg = function* (scope): Flow<PregObs> {
  yield* act.waitForVisible(scope.pregCheckForm.$enter)
  const hasTable = yield* act.getIsVisible(scope.pregCheckTable)
  const raw = hasTable ? yield* act.extractTable(scope.pregCheckTable) : []
  return { rows: parsePregTable(raw) }
} satisfies ScopeConsumer<BreedingTab, unknown>

export function decidePreg(
  row: TFileRow<'pregCheck'>,
  obs: PregObs,
  mem: PregMem
): Decision<PregAction, string> {
  const match = findMatchingPreg(row, obs.rows)
  if (!match.exists) {
    if (mem.submitted)
      return {
        fail: new RowIssue('NOT_FOUND', 'Could not locate new preg check data in the table.')
      }
    return { act: { do: 'fill', prevCount: obs.rows.length } }
  }

  const check = mem.checks[match.rowIdx]
  if (!check) return { act: { do: 'verify', rowIdx: match.rowIdx } }
  if (check.valid) return { done: check.screenshot }

  if (mem.submitted)
    return { fail: new RowIssue('REVIEW', 'Checked work did not match what was input.') }

  return {
    fail: new RowIssue(
      'REVIEW',
      'A preg check with matching numbers exists, but other fields differ.'
    )
  }
}

export function* executePreg(
  scope: BreedingTab,
  row: TFileRow<'pregCheck'>,
  action: PregAction,
  mem: PregMem
): Flow<PregMem> {
  switch (action.do) {
    case 'verify': {
      yield narr('Reviewing a previous entry...')
      const modal = yield* openExistingPreg(scope, action.rowIdx)
      const result = yield* checkIfExistingMatches(modal, row)
      return { ...mem, checks: { ...mem.checks, [action.rowIdx]: result } }
    }
    case 'fill': {
      yield narr('Entering data...')
      yield* fillPreg(scope, row)
      yield* act.waitForRowCount(scope.pregCheckTable, action.prevCount + 1) // settle: the new row must exist before the next observe
      return { submitted: true, checks: {} } // reset: row indices may have shifted
    }
  }
}

export const checkOrFillPreg = function* (scope, row: TFileRow<'pregCheck'>) {
  yield narr('Looking for a matching preg check...')
  const init: PregMem = { submitted: false, checks: {} }
  return yield* reconcile({
    init,
    observe: () => observePreg(scope),
    decide: (obs, mem) => decidePreg(row, obs, mem),
    execute: (action, mem) => executePreg(scope, row, action, mem)
  })
} satisfies ScopeConsumer<BreedingTab, string>
