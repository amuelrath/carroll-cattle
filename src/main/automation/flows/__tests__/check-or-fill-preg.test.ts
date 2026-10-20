import { fakeFlow, fakePage, fakePages } from '@main/automation/flows/fake-flow'
import { checkOrFillPregCheck } from '@main/automation/flows/preg-check'
import { site } from '@main/automation/site'
import type { TSelector } from '@shared/automation'
import type { TFileRow } from '@shared/schemas/jobs'
import { describe, expect, it } from 'vitest'

const modal = site.authed.profile.breedingTab.firstPregCheck.modal
const form = site.authed.profile.breedingTab.pregCheckForm
const tab = site.authed.profile.breedingTab

const row: TFileRow<'pregCheck'> = {
  recipTag: '1234',
  date: '09-26-2026',
  method: 'Palpation',
  technician: 'Dr. White',
  result: 'Pregnant',
  comments: 'Test Comment',
  timePreg: 6
}

const otherRow: TFileRow<'pregCheck'> = {
  recipTag: '1234',
  date: '08-01-2025',
  method: 'Observation',
  technician: 'Dr. White',
  result: 'Recheck'
}

const emptyPage = () => new Map<TSelector, string>()
const pageWithEntry = (r: TFileRow<'pregCheck'>) =>
  new Map<TSelector, string>([
    [tab.firstPregCheck.$enter, ''], // the row link exists
    ...Object.entries(r)
      .filter(([, v]) => v !== undefined)
      .map(
        ([k, v]) =>
          [modal[k as keyof typeof modal], k === 'timePreg' ? `${v} months` : String(v)] as [
            TSelector,
            string
          ]
      )
  ])

const pages = (before: Map<TSelector, string>, after: Map<TSelector, string>) =>
  fakePages(before, after, form.submit)

describe('checkOrFillPregCheck', () => {
  it('should fill when the existing entry differs', () => {
    const { result } = fakeFlow(
      checkOrFillPregCheck(tab, row),
      pages(pageWithEntry(otherRow), pageWithEntry(row))
    )
    expect(result).toBe('screenshot.png')
  })

  it('should not fill if the existing entry matches', () => {
    const { actions } = fakeFlow(checkOrFillPregCheck(tab, row), fakePage(pageWithEntry(row)))
    expect(actions.some((a) => a.target?.[0] === form.submit)).toBe(false)
  })

  it('should throw REVIEW when the saved entry does not match', () => {
    expect(() =>
      fakeFlow(checkOrFillPregCheck(tab, row), pages(emptyPage(), pageWithEntry(otherRow)))
    ).toThrow('Checked work did not match what was input.')
  })
})
