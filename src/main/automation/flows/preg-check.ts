import { findFirst } from '@main/automation/flows/find-first'
import {
  type Authed,
  type BreedingTab,
  type PregCheckModal,
  type Profile,
  type ScopeConsumer,
  type ScopeProvider,
  type SearchResult
} from '@main/automation/site'
import { act, narr, sel } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'
import { ZAnimalSearchResultRow } from '@shared/schemas/jobs/site.schemas'
import { errors } from 'playwright'

function findMatchingTagOrThrow(earTag: string, results: Record<string, unknown>[]) {
  const rows = results.map((r) => ZAnimalSearchResultRow.parse(r))
  const activeAnimals = rows.filter((r) => r.Status === 'Active')
  if (activeAnimals.length === 0)
    throw new RowIssue('NOT_FOUND', `Search ${earTag} yielded no active animals.`)

  const matches = activeAnimals.filter((a) => {
    const expectedTag = earTag.trim().toLowerCase()
    const foundTag = a['Ear Tag'].trim().toLowerCase()
    return foundTag === expectedTag
  })

  if (matches.length === 1) return matches[0]['Ear Tag']

  throw new RowIssue('NOT_FOUND', `Search ${earTag} yielded no active animals.`)
}

const resolveSearchResults = function* (scope, earTag: string) {
  const { animalsTable } = scope

  const hasResults = yield* act.getIsVisible(animalsTable)
  if (!hasResults) throw new RowIssue('NOT_FOUND', `Search ${earTag} yielded no active animals.`)

  const raw = yield* act.extractTable(animalsTable)
  const tagMatch = findMatchingTagOrThrow(earTag, raw)

  const roleSelector = sel.css('a')
  const tagSelector = sel.text(tagMatch)

  yield* act.click([roleSelector, tagSelector])
} satisfies ScopeConsumer<SearchResult>

export const openProfile = function* (scope, earTag: string) {
  yield narr('Searching for animal...')

  const { sidebar, searchResult, profile } = scope

  // search for the animal
  yield* act.fill(sidebar.searchbar, earTag)
  yield* act.click(sidebar.submitSearch)

  const found = yield* findFirst({
    search: searchResult.searchbar,
    profile: profile.name
  })

  if (found === 'search') {
    yield* resolveSearchResults(searchResult, earTag)
  }

  try {
    // double check that we are where we expect to be
    const profileName = yield* act.getText(profile.name)
    if (profileName !== earTag) {
      yield* act.waitForText(profile.secondaryName, earTag)
    }
  } catch (err) {
    if (!(err instanceof errors.TimeoutError)) throw err
    throw new RowIssue(
      'NOT_FOUND',
      `Expected profile for "${earTag}", but ended up somewhere else."`
    )
  }

  return profile
} satisfies ScopeProvider<Authed, Profile>

export const openBreedingTab = function* (scope) {
  const { breedingTab } = scope
  yield* act.waitForVisible(breedingTab.$enter) // !
  yield* act.click(breedingTab.$enter)
  yield* act.waitForVisible(breedingTab.pregCheckForm.$enter)

  return breedingTab
} satisfies ScopeProvider<Profile, BreedingTab>

const openMostRecentCheck = function* (scope) {
  const { firstPregCheck } = scope
  yield* act.click(firstPregCheck.$enter)
  return firstPregCheck.modal
} satisfies ScopeProvider<BreedingTab, PregCheckModal>

const fillPregCheck = function* (scope, row: TFileRow<'pregCheck'>) {
  yield narr('Entering data...')
  console.log('ENTERING DATA', row)

  const { pregCheckForm: form } = scope

  yield* act.click(form.$enter)
  yield* act.fill(form.date, row.date)
  yield* act.select(form.method, row.method)
  yield* act.select(form.technician, row.technician)
  yield* act.select(form.result, row.result)

  if (row.method !== 'Observation' && row.timePreg)
    yield* act.fill(form.timePregnant, String(row.timePreg))
  if (row.method === 'Ultrasound' && row.sex) yield* act.select(form.ultrasoundSex, row.sex)
  if (row.comments) yield* act.fill(form.comments, row.comments)

  yield* act.click(form.submit)
} satisfies ScopeConsumer<BreedingTab>

interface MatchResult {
  valid: boolean
  screenshot: string
}
const checkIfExistingMatches = function* (scope, row: TFileRow<'pregCheck'>) {
  const { modalContent, cancel, ...modalFields } = scope

  const fieldsToCheck = (Object.keys(row) as (keyof typeof row)[]).filter(
    (key) => key !== 'recipTag' && row[key] !== undefined
  )

  // wait for modal to load in
  yield* act.waitForVisible(cancel)

  for (const field of fieldsToCheck) {
    console.info(`[${row.recipTag}]: Checking ${field}`)
    const fieldPresent = yield* act.getIsVisible(modalFields[field])
    if (!fieldPresent) {
      console.info(`[${row.recipTag}]: ${field} Not present`)
      const screenshot = yield* act.screenshot(modalContent)
      yield* act.click(cancel)
      return {
        valid: false,
        screenshot
      }
    }

    const expected = String(row[field])
    let found = yield* act.getText(modalFields[field])
    console.info(`[${row.recipTag}]: Found ${found}, expected ${expected}`)

    if (field === 'timePreg') {
      // one-off case where the app convert between
      // days and months and will display the unit
      // 0-9 = months, 10+ = days
      found = String(found).split(' ')[0]
    }

    if (found !== expected) {
      const screenshot = yield* act.screenshot(modalContent)
      yield* act.click(cancel)
      return {
        valid: false,
        screenshot
      }
    }
  }
  const screenshot = yield* act.screenshot(modalContent)
  yield* act.click(cancel)
  return {
    valid: true,
    screenshot
  }
} satisfies ScopeConsumer<PregCheckModal, MatchResult>

// MaybeToDo: Maybe confirm submission by checking before and after row counts?
export const checkOrFill = function* (scope, row: TFileRow<'pregCheck'>) {
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
  }

  throw new RowIssue('REVIEW', 'Checked work did not match what was input.')
} satisfies ScopeConsumer<BreedingTab, string>
