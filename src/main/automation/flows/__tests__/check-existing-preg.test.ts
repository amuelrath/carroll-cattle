import { fakeFlow, fakePage } from '@main/automation/flows/fake-flow'
import { checkIfExistingMatches } from '@main/automation/flows/preg-check'
import { site } from '@main/automation/site'
import type { TSelector } from '@shared/automation'
import type { TFileRow } from '@shared/schemas/jobs'
import { describe, expect, it } from 'vitest'

const modal = site.authed.profile.breedingTab.firstPregCheck.modal

const row: TFileRow<'pregCheck'> = {
  recipTag: '1234',
  date: '09-26-2026',
  method: 'Palpation',
  technician: 'Dr. White',
  result: 'Pregnant',
  comments: 'Test Comment',
  timePreg: 6
}

const matchingModal = () =>
  new Map<TSelector, string>([
    [modal.date, '09-26-2026'],
    [modal.method, 'Palpation'],
    [modal.technician, 'Dr. White'],
    [modal.result, 'Pregnant'],
    [modal.comments, 'Test Comment'],
    [modal.timePreg, '6 months']
  ])

describe('checkIfExistingPregCheckMatches', () => {
  it('should ignore the unit on timePreg', () => {
    const page = matchingModal().set(modal.timePreg, '6 days')
    const { result } = fakeFlow(checkIfExistingMatches(modal, row), fakePage(page))

    expect(result.valid).toBe(true)
  })

  it('should skip fields that are undefined in the row', () => {
    const page = matchingModal()
    page.delete(modal.comments) // would fail if it were checked
    const { result } = fakeFlow(
      checkIfExistingMatches(modal, { ...row, comments: undefined }),
      fakePage(page)
    )

    expect(result.valid).toBe(true)
  })

  describe('when the existing entry matches', () => {
    it('should be valid when every field matches', () => {
      const { result, actions } = fakeFlow(
        checkIfExistingMatches(modal, row),
        fakePage(matchingModal())
      )

      expect(result).toEqual({ valid: true, screenshot: 'screenshot.png' })
      expect(actions.at(-1)).toMatchObject({
        type: 'click',
        target: [modal.cancel]
      })

      expect(
        actions.filter((act) => act.type === 'click' && act.target?.[0] === modal.cancel)
      ).toHaveLength(1)
    })
  })

  describe('when the existing entry doesnt match', () => {
    it('should be invalid when a field differs', () => {
      const page = matchingModal().set(modal.technician, 'Dr. Brown')
      const { result, actions } = fakeFlow(checkIfExistingMatches(modal, row), fakePage(page))

      expect(result.valid).toBe(false)
      expect(actions.at(-1)).toMatchObject({
        type: 'click',
        target: [modal.cancel]
      })
      expect(
        actions.filter((act) => act.type === 'click' && act.target?.[0] === modal.cancel)
      ).toHaveLength(1)
    })

    it('should be invalid when a field is missing from the modal', () => {
      const page = matchingModal()
      page.delete(modal.comments)
      const { result } = fakeFlow(checkIfExistingMatches(modal, row), fakePage(page))

      expect(result.valid).toBe(false)
    })
  })
})
