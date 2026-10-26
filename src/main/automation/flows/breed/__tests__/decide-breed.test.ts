import { type BreedMem, decideBreed } from '@main/automation/flows/breed'
import {
  BreedRowAIArb,
  BreedRowETArb,
  toBreedTableRow
} from '@main/automation/flows/breed/__tests__/_arbs'
import { isSameBreed } from '@main/automation/flows/breed/helpers'
import fc from 'fast-check'
import { isDeepStrictEqual } from 'node:util'
import { describe, expect, it } from 'vitest'

const BreedRowArb = fc.oneof(BreedRowAIArb, BreedRowETArb)

const noMatch = () => {
  return fc.gen().map((g) => {
    const candidates = g(() =>
      fc.uniqueArray(BreedRowArb, {
        minLength: 1,
        maxLength: 5,
        comparator: (a, b) =>
          isSameBreed(
            a,
            g(() => toBreedTableRow(b))
          )
      })
    )
    const row = g(() => fc.constantFrom(...candidates))
    const tableRows = candidates
      .filter((r) => !isDeepStrictEqual(r, row))
      .map((r) => g(toBreedTableRow, r))
    return {
      row,
      obs: { rows: tableRows }
    }
  })
}

const match = () => {
  return fc.gen().map((g) => {
    const candidates = g(() =>
      fc.uniqueArray(BreedRowArb, {
        minLength: 1,
        maxLength: 20,
        comparator: (a, b) =>
          isSameBreed(
            a,
            g(() => toBreedTableRow(b))
          )
      })
    )
    const rowIdx = g(fc.integer, { min: 0, max: candidates.length - 1 })

    return {
      row: candidates[rowIdx],
      obs: { rows: candidates.map((r) => g(toBreedTableRow, r)) },
      rowIdx
    }
  })
}

describe('decideBreed', () => {
  it('should fail NOT_FOUND if it submitted but no table match exists', () => {
    const mem: BreedMem = {
      submitted: true,
      checks: { [0]: { valid: false, screenshot: 'screenshot.png' } }
    }

    fc.assert(
      fc.property(noMatch(), ({ row, obs }) => {
        const result = decideBreed(row, obs, mem)
        expect(result).toEqual({
          fail: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      })
    )
  })

  it('should fill if it did not submit and no table match exists', () => {
    const mem: BreedMem = {
      submitted: false,
      checks: { [0]: { valid: false, screenshot: 'screenshot.png' } }
    }

    fc.assert(
      fc.property(noMatch(), ({ row, obs }) => {
        const result = decideBreed(row, obs, mem)
        expect(result).toMatchObject({ act: { do: 'fill' } })
      })
    )
  })

  it('should verify when a table match exists and it has not been checked', () => {
    fc.assert(
      fc.property(match(), fc.boolean(), ({ row, obs, rowIdx }, submitted) => {
        const mem: BreedMem = { submitted, checks: {} }

        expect(decideBreed(row, obs, mem)).toEqual({
          act: { do: 'verify', rowIdx }
        })
      }),
      { endOnFailure: true, numRuns: 20, verbose: true }
    )
  })

  it('should be done if the check is valid, regardless of submission status', () => {
    fc.assert(
      fc.property(match(), fc.boolean(), ({ row, obs, rowIdx }, submitted) => {
        const mem: BreedMem = {
          submitted,
          checks: { [rowIdx]: { valid: true, screenshot: 'screenshot.png' } }
        }

        expect(decideBreed(row, obs, mem)).toEqual({
          done: 'screenshot.png'
        })
      }),
      { endOnFailure: true, numRuns: 20, verbose: true }
    )
  })

  it('should fail REVIEW if the check is invalid but we submitted', () => {
    fc.assert(
      fc.property(match(), ({ row, obs, rowIdx }) => {
        const mem: BreedMem = {
          submitted: true,
          checks: { [rowIdx]: { valid: false, screenshot: 'screenshot.png' } }
        }

        expect(decideBreed(row, obs, mem)).toEqual({
          fail: expect.objectContaining({
            code: 'REVIEW',
            message: expect.stringMatching(/Checked work/)
          })
        })
      }),
      { endOnFailure: true, numRuns: 20, verbose: true }
    )
  })

  it.todo('final review check...', () => {})
})
