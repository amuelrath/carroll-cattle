import { fakeFlow, fakePage } from '@main/automation/flows/__tests__/_fake-flow'
import { exitModal } from '@main/automation/flows/exit-modal'
import { PregRowArb } from '@main/automation/flows/preg/__tests__/_arbs'
import { checkIfExistingMatches } from '@main/automation/flows/preg/helpers'
import { site } from '@main/automation/site'
import fc from 'fast-check'
import { describe, expect, it, vi } from 'vitest'

const modal = site.authed.profile.breedingTab.pregCheckModal

vi.mock('@main/automation/flows/exit-modal', { spy: true })

const getTimePreg = (time: number | undefined) => {
  if (time === undefined) return undefined
  if (time > 9) return `${time} months`
  return `${time} days`
}

function scenarioMatch() {
  return PregRowArb.map((row) => {
    const page = fakePage(modal, { ...row, timePreg: getTimePreg(row.timePreg) })
    return {
      row,
      page
    }
  })
}

function scenarioNoMatch() {
  return fc.gen().map((g) => {
    const examples = g(() =>
      fc.uniqueArray(PregRowArb, { minLength: 2, maxLength: 2, selector: (r) => JSON.stringify(r) })
    )
    const page = fakePage(modal, { ...examples[0], timePreg: getTimePreg(examples[0].timePreg) })
    return {
      row: examples[1],
      page
    }
  })
}

function scenario({ match }: { match: boolean }) {
  if (match) {
    return scenarioMatch()
  } else {
    return scenarioNoMatch()
  }
}

describe('checkIfExistingMatches', () => {
  it('should call exitModal exactly once with the correct result', () => {
    fc.assert(
      fc.property(
        fc.boolean().chain((match) => scenario({ match }).map((s) => ({ ...s, match }))),
        ({ row, page, match }) => {
          vi.mocked(exitModal).mockClear()

          const { actions, result } = fakeFlow(checkIfExistingMatches(modal, row), page)
          expect(exitModal).toHaveBeenCalledTimes(1)
          expect(exitModal).toHaveBeenCalledWith(match, modal.modalContent, modal.cancel)

          expect(result).toMatchObject({ valid: match, screenshot: 'screenshot.png' })
          expect(actions.map((a) => a.target).at(-1)).toEqual([modal.cancel])
        }
      ),
      { endOnFailure: true, numRuns: 200 }
    )
  })

  it.todo('should check the visibility ', () => {})
})
