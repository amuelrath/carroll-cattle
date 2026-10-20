import {
  type BreedingTab,
  type PregCheckModal,
  type ScopeConsumer,
  type ScopeProvider
} from '@main/automation/site'
import type { MatchResult } from '@main/automation/types'
import { act, narr } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'

export const openMostRecentCheck = function* (scope) {
  const { firstPregCheck } = scope
  yield* act.click(firstPregCheck.$enter)
  return firstPregCheck.modal
} satisfies ScopeProvider<BreedingTab, PregCheckModal>

export const fillPregCheck = function* (scope, row: TFileRow<'pregCheck'>) {
  yield narr('Entering data...')
  console.log('ENTERING DATA', row)

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

export const checkIfExistingMatches = function* (scope, row: TFileRow<'pregCheck'>) {
  const exit = function* (valid: boolean) {
    const screenshot = yield* act.screenshot(modalContent)
    yield* act.click(cancel)
    return {
      valid,
      screenshot
    }
  }

  const { modalContent, cancel, ...modalFields } = scope

  const fieldsToCheck = (Object.keys(row) as (keyof typeof row)[]).filter(
    (key) => key !== 'recipTag' && row[key] !== undefined
  )

  // wait for modal to load in
  yield* act.waitForVisible(cancel)

  for (const field of fieldsToCheck) {
    const fieldPresent = yield* act.getIsVisible(modalFields[field])
    if (!fieldPresent) {
      return yield* exit(false)
    }

    const expected = String(row[field])
    let found = yield* act.getText(modalFields[field])

    if (field === 'timePreg') {
      // one-off case where the app convert between
      // days and months and will display the unit
      // 0-9 = months, 10+ = days
      found = String(found).split(' ')[0]
    }

    if (found !== expected) {
      return yield* exit(false)
    }
  }
  return yield* exit(true)
} satisfies ScopeConsumer<PregCheckModal, MatchResult>

// MaybeToDo: Maybe confirm submission by checking before and after row counts?
export const checkOrFillPregCheck = function* (scope, row: TFileRow<'pregCheck'>) {
  const { firstPregCheck } = scope

  const check = function* () {
    const modal = yield* openMostRecentCheck(scope)
    return yield* checkIfExistingMatches(modal, row)
  }

  const exists = yield* act.getIsVisible(firstPregCheck.$enter)

  let match: MatchResult
  if (exists) {
    yield narr('Reviewing a previous entry...')
    match = yield* check()
    if (match.valid) return match.screenshot
  }
  yield* fillPregCheck(scope, row)

  yield narr('Checking work...')
  match = yield* check()
  if (match.valid) {
    return match.screenshot
  } else {
    throw new RowIssue('REVIEW', 'Checked work did not match what was input.')
  }
} satisfies ScopeConsumer<BreedingTab, string>
