import { findFirst } from '@main/automation/flows/find-first'
import type {
  Authed,
  BreedingTab,
  EmbryoTab,
  Profile,
  ScopeConsumer,
  ScopeProvider,
  SearchResult
} from '@main/automation/site'
import { act, narr, sel } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import { ZAnimalSearchResultRow } from '@shared/schemas/jobs/site.schemas'
import { errors } from 'playwright'

export function findMatchingTagOrThrow(earTag: string, results: Record<string, unknown>[]) {
  console.log(results)

  if (!results || !Array.isArray(results))
    throw new RowIssue('NOT_FOUND', `Search for "${earTag}" yielded no active animals.`)

  const rows = results.map((r) => ZAnimalSearchResultRow.parse(r))
  const activeAnimals = rows.filter((r) => r.Status === 'Active')
  if (activeAnimals.length === 0)
    throw new RowIssue('NOT_FOUND', `Search for "${earTag}" yielded no active animals.`)

  const matches = activeAnimals.filter((a) => {
    const expectedTag = earTag.trim().toLowerCase()
    const foundTag = a['Ear Tag'].trim().toLowerCase()
    return foundTag === expectedTag
  })

  if (matches.length > 1)
    throw new RowIssue(
      'NOT_FOUND',
      `Search for "${earTag}" yielded multiple animals with the same name.`
    )

  return matches[0]['Ear Tag']
}

export const resolveSearchResults = function* (scope, earTag: string) {
  const { animalsTable } = scope

  const hasResults = yield* act.getIsVisible(animalsTable)
  if (!hasResults)
    throw new RowIssue('NOT_FOUND', `Search for "${earTag}" yielded no active animals.`)

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const cssString = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const tagPattern = cssString(`^${escapeRegex(earTag)}$`)

  try {
    yield* act.click(sel.css(`tr:has(td:text-is("Active")) a:text-matches("${tagPattern}", "i")`))
  } catch (err) {
    // Try to get a RowIssue
    // Otherwise act.click would just throw a TimeoutError
    const raw = yield* act.extractTable(animalsTable)
    findMatchingTagOrThrow(earTag, raw)
    // If an error isn't found, throw original
    throw err
  }
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
    yield* act.waitForText(profile.name, earTag)
  } catch (err) {
    if (!(err instanceof errors.TimeoutError)) throw err
    throw new RowIssue(
      'NOT_FOUND',
      `Expected profile for "${earTag}", but ended up somewhere else.`
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

export const openEmbryoTab = function* (scope) {
  const { embryoTab } = scope
  yield* act.waitForVisible(embryoTab.$enter)
  yield* act.click(embryoTab.$enter)
  yield* act.waitForVisible(embryoTab.flushForm.$enter)

  return embryoTab
} satisfies ScopeProvider<Profile, EmbryoTab>
