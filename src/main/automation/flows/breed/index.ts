import {
  checkIfExistingMatches,
  fillBreed,
  isSameBreed,
  openExistingBreed
} from '@main/automation/flows/breed/helpers'
import { type Decision, reconcile } from '@main/automation/flows/reconcile'
import type { BreedingTab, ScopeConsumer } from '@main/automation/site'
import type { Flow, MatchResult } from '@main/automation/types'
import { act, narr } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'
import { type TBreedTableRowRaw, ZBreedTableRowRaw } from '@shared/schemas/jobs/site.schemas'

export type BreedMem = { submitted: boolean; checks: Record<number, MatchResult> }
export type BreedObs = { rows: TBreedTableRowRaw[] }
export type BreedAction = { do: 'verify'; rowIdx: number } | { do: 'fill'; prevCount: number }

export function parseBreedTable(raw: Record<string, unknown>[]): TBreedTableRowRaw[] {
  console.log(raw)
  const rawRes = raw.map((r) => ZBreedTableRowRaw.safeParse(r))
  if (rawRes.some((r) => !r.success))
    throw new RowIssue(
      'INTERNAL',
      'There was an issue reading the breeding table. No action necessary.'
    )

  return rawRes.map((r) => r.data).filter((r) => r !== undefined)
}

export function findMatchingBreed(row: TFileRow<'breeding'>, rows: TBreedTableRowRaw[]) {
  const idxs = rows.flatMap((r, i) => (isSameBreed(row, r) ? [i] : []))
  if (idxs.length > 1) throw new RowIssue('REVIEW', 'Multiple matching breedings already exist.')
  return idxs.length === 1 ? { exists: true as const, rowIdx: idxs[0] } : { exists: false as const }
}

export const observeBreed = function* (scope): Flow<BreedObs> {
  yield* act.waitForVisible(scope.breedingForm.$enter)
  const hasTable = yield* act.getIsVisible(scope.breedingTable)
  const raw = hasTable ? yield* act.extractTable(scope.breedingTable) : []
  return { rows: parseBreedTable(raw) }
} satisfies ScopeConsumer<BreedingTab, unknown>

export function decideBreed(
  row: TFileRow<'breeding'>,
  obs: BreedObs,
  mem: BreedMem
): Decision<BreedAction, string> {
  const match = findMatchingBreed(row, obs.rows)
  if (!match.exists) {
    if (mem.submitted)
      return {
        fail: new RowIssue('NOT_FOUND', 'Could not locate new breeding data in the table.')
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
      'A breeding with matching numbers exists, but other fields differ.'
    )
  }
}

export function* executeBreed(
  scope: BreedingTab,
  row: TFileRow<'breeding'>,
  action: BreedAction,
  mem: BreedMem
): Flow<BreedMem> {
  switch (action.do) {
    case 'verify': {
      yield narr('Reviewing a previous entry...')
      const modal = yield* openExistingBreed(scope, action.rowIdx)
      const result = yield* checkIfExistingMatches(modal, row)
      return { ...mem, checks: { ...mem.checks, [action.rowIdx]: result } }
    }
    case 'fill': {
      yield narr('Entering data...')
      yield* fillBreed(scope, row)
      yield* act.waitForRowCount(scope.breedingTable, action.prevCount + 1) // settle: the new row must exist before the next observe
      return { submitted: true, checks: {} } // reset: row indices may have shifted
    }
  }
}

export const checkOrFillBreed = function* (scope, row: TFileRow<'breeding'>) {
  yield narr('Looking for a matching breeding...')
  const init: BreedMem = { submitted: false, checks: {} }
  return yield* reconcile({
    init,
    observe: () => observeBreed(scope),
    decide: (obs, mem) => decideBreed(row, obs, mem),
    execute: (action, mem) => executeBreed(scope, row, action, mem)
  })
} satisfies ScopeConsumer<BreedingTab, string>
