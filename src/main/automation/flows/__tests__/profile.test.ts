import {
  findMatchingTagOrThrow,
  openBreedingTab,
  resolveSearchResults
} from '@main/automation/flows/profile'
import type { TAnimalSearchResultRow } from '@shared/schemas/jobs/site.schemas'
import { errors } from 'playwright'
import { describe, expect, it } from 'vitest'
import { site } from '../../site'
import { fakeFlow, respond } from '../fake-flow'

const profile = site.authed.profile
const breedingTab = site.authed.profile.breedingTab
const searchResult = site.authed.searchResult

describe('openBreedingTab', () => {
  it('returns the breedingTab', () => {
    const { result, actions } = fakeFlow(
      openBreedingTab(profile),
      respond([{ waitForVisible: undefined }, { click: undefined }, { waitForVisible: undefined }])
    )

    expect(actions.map((a) => a.type)).toEqual(['waitForVisible', 'click', 'waitForVisible'])
    expect(result).toStrictEqual(breedingTab)
  })
})

describe('findMatchingTagOrThrow', () => {
  it('returns the ear tag of a matching active animal', () => {
    const rows: TAnimalSearchResultRow[] = [
      { 'Animal Type': 'Cow', Status: 'Active', 'Ear Tag': 'TEST' },
      { 'Animal Type': 'Cow', Status: 'Sold', 'Ear Tag': '1234' }
    ]

    expect(findMatchingTagOrThrow('TEST', rows)).toBe('TEST')
  })

  it('rejects when no active animals are found', () => {
    const rows: TAnimalSearchResultRow[] = [
      { 'Animal Type': 'Bull', 'Ear Tag': '1234', Status: 'Dead' }
    ]

    expect(() => findMatchingTagOrThrow('TEST', rows)).toThrow(
      'Search for "TEST" yielded no active animals.'
    )
  })

  it('rejects when no active animals are found even if a tag matches', () => {
    const rows: TAnimalSearchResultRow[] = [
      { 'Animal Type': 'Cow', Status: 'Dead', 'Ear Tag': 'TEST' },
      { 'Animal Type': 'Cow', Status: 'Sold', 'Ear Tag': 'TEST' },
      { 'Animal Type': 'Cow', Status: 'Reference', 'Ear Tag': 'TEST' }
    ]

    expect(() => findMatchingTagOrThrow('TEST', rows)).toThrow(
      'Search for "TEST" yielded no active animals.'
    )
  })

  it('rejects when multiple active animals are found', () => {
    const rows: TAnimalSearchResultRow[] = [
      { 'Animal Type': 'Cow', Status: 'Active', 'Ear Tag': 'TEST' },
      { 'Animal Type': 'Cow', Status: 'Active', 'Ear Tag': 'TEST' }
    ]

    expect(() => findMatchingTagOrThrow('TEST', rows)).toThrow(
      'Search for "TEST" yielded multiple animals with the same name.'
    )
  })
})

describe('resolveSearchResults', () => {
  it('clicks the correct link', () => {
    const { actions } = fakeFlow(
      resolveSearchResults(searchResult, 'TEST'),
      respond([
        {
          getIsVisible: true
        },
        {
          click: undefined
        }
      ])
    )

    expect(actions.map((a) => a.type)).toEqual(['getIsVisible', 'click'])
    expect(actions[1].target).toStrictEqual([
      {
        type: 'css',
        input: 'tr:has(td:text-is("Active")) a:text-is("TEST")',
        options: undefined
      }
    ])
  })

  it('diverts errors in click to findMatchingTagOrThrow', () => {
    expect(() => {
      const rows: TAnimalSearchResultRow[] = [
        { 'Animal Type': 'Cow', Status: 'Reference', 'Ear Tag': 'TEST' },
        { 'Animal Type': 'Cow', Status: 'Dead', 'Ear Tag': 'TEST' }
      ]

      fakeFlow(
        resolveSearchResults(searchResult, 'TEST'),
        respond([
          { getIsVisible: true },
          { click: new errors.TimeoutError() },
          { extractTable: rows }
        ])
      )
    }).toThrow('Search for "TEST" yielded no active animals')
  })

  it('rethrows the original error if a RowIssue cannot be found', () => {
    expect(() => {
      fakeFlow(
        resolveSearchResults(searchResult, 'TEST'),
        respond([
          { getIsVisible: true },
          { click: new Error() },
          { extractTable: new errors.TimeoutError() }
        ])
      )
    }).toThrow(errors.TimeoutError)
  })

  it('rejects when the animals table is not visible', () => {
    expect(() =>
      fakeFlow(resolveSearchResults(searchResult, 'TEST'), respond([{ getIsVisible: false }]))
    ).toThrow('Search for "TEST" yielded no active animals.')
  })
})
