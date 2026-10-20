import type {
  BreedingModal,
  BreedingTab,
  ScopeConsumer,
  ScopeProvider
} from '@main/automation/site'
import type { MatchResult } from '@main/automation/types'
import { act, sel } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'

const openMostRecentBreeding = function* (scope) {
  const { firstBreeding } = scope
  yield* act.click(firstBreeding.$enter)
  return firstBreeding.modal
} satisfies ScopeProvider<BreedingTab, BreedingModal>

export const checkIfExistingMatches = function* (scope, row: TFileRow<'breeding'>) {
  const exit = function* (valid: boolean) {
    const screenshot = yield* act.screenshot(modalContent)
    yield* act.click(cancel)
    return { valid, screenshot }
  }

  const { modalContent, cancel, ...modalFields } = scope

  const baseFields = ['date', 'method', 'technician', 'comments'] as const
  const baseFieldsToCheck = baseFields.filter((key) => row[key] !== undefined)

  // wait for modal to load in
  yield* act.waitForVisible(cancel)

  for (const field of baseFieldsToCheck) {
    const fieldPresent = yield* act.getIsVisible(modalFields[field])
    // This will likely never be false unless that page didn't load properly.
    if (!fieldPresent) {
      return yield* exit(false)
    }

    const expected = String(row[field]).trim()
    const found = yield* act.getText(modalFields[field])

    if (String(found).trim() !== expected) {
      return yield* exit(false)
    }
  }

  // AI Bull
  if (row.method === 'AI') {
    const foundBull = yield* act.getText(modalFields.bullTag)
    if (String(foundBull).trim().toLowerCase() !== row.bullTag.trim().toLowerCase()) {
      return yield* exit(false)
    }
  }

  // ET Embryo
  if (row.method === 'ET') {
    const foundEmbryo = yield* act.getText(modalFields.embryo)
    const expectedEmbryo = `${row.bullTag} x ${row.donorTag}`.toLowerCase()
    if (String(foundEmbryo).trim().toLowerCase() !== String(expectedEmbryo).trim().toLowerCase()) {
      return yield* exit(false)
    }
  }

  // ET CL Side
  if (row.method === 'ET' && row.clSide) {
    const fieldVisible = yield* act.getIsVisible(modalFields.clSide)
    if (!fieldVisible) return yield* exit(false)

    const foundSide = yield* act.getText(modalFields.clSide)
    if (row.clSide !== String(foundSide).trim()) {
      return yield* exit(false)
    }
  }

  return yield* exit(true)
} satisfies ScopeConsumer<BreedingModal, MatchResult>

// This is the way the option label is constructed.
function getEmbryoName(bullTag: string, donorTag: string, caneNo: string, strawNo: string) {
  return `${bullTag} x ${donorTag} (#: ${strawNo} / CC: ${caneNo})`
}

const fillBreeding = function* (scope, row: TFileRow<'breeding'>) {
  const { breedingForm: form } = scope

  yield* act.click(form.$enter)
  yield* act.select(form.method, row.method)
  yield* act.fill(form.date, row.date)
  yield* act.select(form.technician, row.technician)

  if (row.method === 'AI') {
    const optionSelector = [sel.css('b'), sel.text(row.bullTag)]

    yield* act.click(form.bull.$enter)
    yield* act.fill(form.bull.searchbar, row.bullTag)
    yield* act.waitForVisible(optionSelector) // has to load in from db
    yield* act.click(optionSelector)
  }

  if (row.method === 'ET') {
    if (!row.caneNo || !row.strawNo)
      throw new RowIssue(
        'MISSING_DATA',
        'Method is "ET," but row is missing either a caneNo or strawNo.'
      )

    // ToDo: RowIssue for case embryo isn't found
    const embryoName = getEmbryoName(row.bullTag, row.donorTag, row.caneNo, row.strawNo)
    console.log(embryoName)
    yield* act.select(form.embryo, embryoName)

    if (row.clSide) yield* act.select(form.clSide, row.clSide)
  }

  if (row.comments) yield* act.fill(form.comments, row.comments)
  yield* act.click(form.submit)
} satisfies ScopeConsumer<BreedingTab>

export const checkOrFillBreeding = function* (scope, row: TFileRow<'breeding'>) {
  const { firstBreeding } = scope

  const check = function* () {
    const modal = yield* openMostRecentBreeding(scope)
    return yield* checkIfExistingMatches(modal, row)
  }

  let match: MatchResult
  const exists = yield* act.getIsVisible(firstBreeding.$enter)
  if (exists) {
    match = yield* check()
    if (match.valid) return match.screenshot
  }

  yield* fillBreeding(scope, row)

  match = yield* check()
  if (match.valid) return match.screenshot

  throw new RowIssue('REVIEW', 'Checked work did not match what was input.')
} satisfies ScopeConsumer<BreedingTab, string>
