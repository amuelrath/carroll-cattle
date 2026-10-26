import { exitModal } from '@main/automation/flows/exit-modal'
import type {
  BreedingTab,
  PregCheckModal,
  ScopeConsumer,
  ScopeProvider
} from '@main/automation/site'
import type { MatchResult } from '@main/automation/types'
import { act, sel } from '@shared/automation'
import type { TFileRow } from '@shared/schemas/jobs'
import type { TPregCheckRow } from '@shared/schemas/jobs/preg-check.schemas'
import type { TPregTableRow } from '@shared/schemas/jobs/site.schemas'

const firstToken = (v: unknown) => (v == null ? '' : (String(v).trim().split(/\s+/)[0] ?? ''))
export const isSamePreg = (row: TPregCheckRow, tableRow: TPregTableRow) => {
  return (
    tableRow['Result'] === row.result &&
    tableRow['Check Date'] === row.date &&
    tableRow['Check Method'] === row.method &&
    firstToken(tableRow['Time Pregnant']) === firstToken(row.timePreg)
  )
}

export const openExistingPreg = function* (scope, rowIdx: number) {
  const { pregCheckModal } = scope
  yield* act.click(sel.css(`#pregnancy_checks_container table tbody tr:nth-child(${rowIdx + 1}) a`))
  return pregCheckModal
} satisfies ScopeProvider<BreedingTab, PregCheckModal>

export const checkIfExistingMatches = function* (scope, row: TFileRow<'pregCheck'>) {
  const { modalContent, cancel, ...modalFields } = scope

  const fieldsToCheck = (Object.keys(modalFields) as (keyof typeof modalFields)[]).filter(
    (key) => row[key] !== undefined
  )

  // wait for modal to load in
  yield* act.waitForVisible(cancel)
  for (const field of fieldsToCheck) {
    const fieldPresent = yield* act.getIsVisible(modalFields[field])
    if (!fieldPresent) return yield* exitModal(false, modalContent, cancel)

    let found = String(yield* act.getText(modalFields[field])).trim()

    if (field === 'timePreg') {
      // one-off case where the app convert between
      // days and months and will display the unit
      // 0-9 = months, 10+ = days
      found = String(found).split(' ')[0]
    }

    const expected = String(row[field]).trim()
    if (found !== expected) return yield* exitModal(false, modalContent, cancel)
  }
  return yield* exitModal(true, modalContent, cancel)
} satisfies ScopeConsumer<PregCheckModal, MatchResult>

export const fillPreg = function* (scope, row: TFileRow<'pregCheck'>) {
  const { pregCheckForm: form } = scope

  yield* act.click(form.$enter)
  yield* act.fill(form.date, row.date)
  yield* act.select(form.method, row.method)
  yield* act.select(form.technician, row.technician)
  yield* act.select(form.result, row.result)

  if (row.method !== 'Observation' && row.timePreg) {
    yield* act.fill(form.timePregnant, String(row.timePreg))
  }

  if (row.method === 'Ultrasound' && row.sex) {
    yield* act.select(form.ultrasoundSex, row.sex)
  }

  if (row.comments) yield* act.fill(form.comments, row.comments)

  yield* act.click(form.submit)
} satisfies ScopeConsumer<BreedingTab>
