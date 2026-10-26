import {
  BreedRowAIArb,
  BreedRowETArb,
  toBreedTableRow
} from '@main/automation/flows/breed/__tests__/_arbs'
import { isSameBreed } from '@main/automation/flows/breed/helpers'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

function scenarioMatch(opts: { method: 'AI' | 'ET' }) {
  const rowArb = opts.method === 'AI' ? BreedRowAIArb : BreedRowETArb
  return rowArb.chain((row) => toBreedTableRow(row).map((tableRow) => ({ row, tableRow })))
}

function scenarioNoMatch(opts: { method: 'AI' | 'ET' }) {
  const rowArb = opts.method === 'AI' ? BreedRowAIArb : BreedRowETArb
  return fc.gen().map((g) => {
    const candidates = g(() =>
      fc.uniqueArray(rowArb, { minLength: 2, maxLength: 2, selector: (r) => JSON.stringify(r) })
    )

    const row = candidates[0]
    const tableRow = g(toBreedTableRow, candidates[1])

    return { row, tableRow }
  })
}

describe('isSameBreed', () => {
  it('should be true when there is a match', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('AI', 'ET').chain((method) => scenarioMatch({ method }).map((s) => s)),
        ({ row, tableRow }) => {
          expect(isSameBreed(row, tableRow)).toBe(true)
        }
      )
    )
  })

  it('should be false when there is a match', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('AI', 'ET').chain((method) => scenarioNoMatch({ method }).map((s) => s)),
        ({ row, tableRow }) => {
          expect(isSameBreed(row, tableRow)).toBe(false)
        }
      )
    )
  })
})
