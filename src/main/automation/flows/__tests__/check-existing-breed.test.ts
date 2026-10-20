import { checkIfExistingMatches } from '@main/automation/flows/breeding'
import { fakeFlow, fakePage } from '@main/automation/flows/fake-flow'
import { site } from '@main/automation/site'
import type { TSelector } from '@shared/automation'
import type { TFileRow } from '@shared/schemas/jobs'
import fc, { Arbitrary } from 'fast-check'
import { describe, expect, it } from 'vitest'

const etArb = fc.record(
  {
    method: fc.constant('ET' as const),
    recipTag: fc.string({ minLength: 1 }),
    donorTag: fc.string({ minLength: 1 }),
    bullTag: fc.string({ minLength: 1 }),
    date: fc.string({ minLength: 1 }),
    clSide: fc.constantFrom('Left' as const, 'Right' as const),
    caneNo: fc.string({ minLength: 1 }),
    strawNo: fc.string({ minLength: 1 }),
    technician: fc.string({ minLength: 1 }),
    comments: fc.string()
  },
  {
    requiredKeys: [
      'method',
      'recipTag',
      'donorTag',
      'bullTag',
      'technician',
      'date',
      'clSide',
      'caneNo',
      'strawNo'
    ]
  }
)

const aiArb = fc.record(
  {
    method: fc.constant('ET' as const),
    recipTag: fc.string({ minLength: 1 }),
    donorTag: fc.string({ minLength: 1 }),
    bullTag: fc.string({ minLength: 1 }),
    date: fc.string({ minLength: 1 }),
    technician: fc.string({ minLength: 1 }),
    comments: fc.string()
  },
  {
    requiredKeys: ['method', 'recipTag', 'donorTag', 'bullTag', 'technician', 'date']
  }
)

const foundModal = (data: TFileRow<'breeding'>) => {
  return new Map<TSelector, string | undefined>([
    [modal.date, data.date],
    [modal.clSide, data.clSide],
    [modal.method, data.method],
    [modal.comments, data.comments],
    [modal.technician, data.technician],
    [modal.embryo, `${data.bullTag} x ${data.donorTag}`]
  ])
}

const withMissingFields = (arb: Arbitrary<TFileRow<'breeding'>>) =>
  arb.chain((data) => {
    const present = [...foundModal(data)]
      .filter(([, value]) => value !== undefined)
      .map(([selector]) => selector)

    return fc.record({
      data: fc.constant(data),
      removed: fc.subarray(present, { minLength: 1 })
    })
  })

const differentFrom = (original: string) =>
  fc.string({ minLength: 1 }).filter((v) => v.toLowerCase() !== original.trim().toLowerCase())

const withChangedFields = (arb: Arbitrary<TFileRow<'breeding'>>) =>
  arb.chain((data) => {
    const present = [...foundModal(data)].filter(
      (entry): entry is [TSelector, string] => entry[1] !== undefined
    )

    return fc.record({
      data: fc.constant(data),
      changes: fc
        .subarray(present, { minLength: 1 })
        .chain((picked) =>
          fc.tuple(
            ...picked.map(([selector, original]) =>
              differentFrom(original).map((value) => [selector, value] as const)
            )
          )
        )
    })
  })

const modal = site.authed.profile.breedingTab.firstBreeding.modal

describe('checkIfExistingMatches', () => {
  describe('when the method is embryo transfer', () => {
    it('should return valid when all fields match', () => {
      fc.assert(
        fc.property(etArb, (data) => {
          const { result, actions } = fakeFlow(
            checkIfExistingMatches(modal, data),
            fakePage(foundModal(data))
          )

          expect(actions.filter((act) => act.type === 'click')).toHaveLength(1)
          expect(result).toMatchObject({
            valid: true,
            screenshot: 'screenshot.png'
          })
        })
      )
    })

    it('should return invalid when one or more fields are missing', () => {
      fc.assert(
        fc.property(withMissingFields(etArb), ({ data, removed }) => {
          const found = foundModal(data)
          removed.forEach((selector) => found.delete(selector))

          const { result, actions } = fakeFlow(checkIfExistingMatches(modal, data), fakePage(found))

          expect(actions.filter((act) => act.type === 'click')).toHaveLength(1)
          expect(result).toMatchObject({ valid: false, screenshot: 'screenshot.png' })
        })
      )
    })

    it('should return invalid when one or more fields has a differing value', () => {
      fc.assert(
        fc.property(withChangedFields(etArb), ({ data, changes }) => {
          const found = foundModal(data)
          changes.forEach(([selector, value]) => found.set(selector, value))

          const { result } = fakeFlow(checkIfExistingMatches(modal, data), fakePage(found))

          expect(result).toMatchObject({ valid: false, screenshot: 'screenshot.png' })
        })
      )
    })

    it.skip('stats: changed fields', () => {
      fc.statistics(withChangedFields(etArb), ({ changes }) => `${changes.length} changed`, {
        numRuns: 10_000
      })

      const names = new Map<TSelector, string>(
        Object.entries(modal).map(([name, selector]) => [selector as TSelector, name])
      )
      fc.statistics(
        withChangedFields(etArb),
        ({ changes }) => changes.map(([selector]) => names.get(selector) ?? '?'),
        { numRuns: 10_000 }
      )
    })
  })

  describe('when the method is artificial insemination', () => {
    it('should return valid when all fields match', () => {
      fc.assert(
        fc.property(aiArb, (data) => {
          const { result, actions } = fakeFlow(
            checkIfExistingMatches(modal, data),
            fakePage(foundModal(data))
          )

          expect(actions.filter((act) => act.type === 'click')).toHaveLength(1)
          expect(result).toMatchObject({
            valid: true,
            screenshot: 'screenshot.png'
          })
        })
      )
    })

    it('should return invalid when one or more fields are missing', () => {
      fc.assert(
        fc.property(withMissingFields(aiArb), ({ data, removed }) => {
          const found = foundModal(data)
          removed.forEach((selector) => found.delete(selector))

          const { result, actions } = fakeFlow(checkIfExistingMatches(modal, data), fakePage(found))

          expect(actions.filter((act) => act.type === 'click')).toHaveLength(1)
          expect(result).toMatchObject({ valid: false, screenshot: 'screenshot.png' })
        })
      )
    })

    it('should return invalid when one or more fields has a differing value', () => {
      fc.assert(
        fc.property(withChangedFields(aiArb), ({ data, changes }) => {
          const found = foundModal(data)
          changes.forEach(([selector, value]) => found.set(selector, value))

          const { result } = fakeFlow(checkIfExistingMatches(modal, data), fakePage(found))

          expect(result).toMatchObject({ valid: false, screenshot: 'screenshot.png' })
        })
      )
    })

    it.skip('stats: changed fields', () => {
      fc.statistics(withChangedFields(aiArb), ({ changes }) => `${changes.length} changed`, {
        numRuns: 10_000
      })

      const names = new Map<TSelector, string>(
        Object.entries(modal).map(([name, selector]) => [selector as TSelector, name])
      )
      fc.statistics(
        withChangedFields(aiArb),
        ({ changes }) => changes.map(([selector]) => names.get(selector) ?? '?'),
        { numRuns: 10_000 }
      )
    })
  })
})
