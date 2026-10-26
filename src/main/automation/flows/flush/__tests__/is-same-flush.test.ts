import { flushRowArb } from '@main/automation/flows/__tests__/_arbs'
import { isSameFlush, toFlushTableRow } from '@main/automation/flows/flush/helpers'
import type { TFlushRow } from '@shared/schemas/jobs/flush.schemas'
import fc, { Arbitrary } from 'fast-check'
import { describe, expect, it } from 'vitest'

const same = (a: unknown, b: unknown) => fc.stringify(a) === fc.stringify(b)
function scenario<T extends object>({
  arb,
  isMatch,
  keys
}: {
  arb: Arbitrary<T>
  isMatch: boolean
  keys: readonly (keyof T)[] // fields the matcher actually compares
}) {
  if (isMatch) {
    return arb.map((actual) => ({ actual, found: structuredClone(actual), expected: true }))
  }

  return fc
    .tuple(arb, arb)
    .map(([actual, other]) => ({
      actual,
      other,
      diffKeys: keys.filter((k) => !same(actual[k], other[k]))
    }))
    .filter(({ diffKeys }) => diffKeys.length > 0)
    .chain(({ actual, other, diffKeys }) =>
      fc.subarray(diffKeys, { minLength: 1 }).map((changed) => {
        const found = { ...actual }
        for (const k of changed) found[k] = other[k]
        return { actual, found, expected: false }
      })
    )
}

const flushMatchKeys = [
  'date',
  'type',
  'sireTag',
  'degenerate',
  'frozen',
  'recovered',
  'transferred',
  'unfertilized',
  'usable'
] as const satisfies readonly (keyof TFlushRow)[]

describe('isSameFlush', () => {
  it('should return true if there is a match', () => {
    fc.assert(
      fc.property(
        scenario({ arb: flushRowArb, isMatch: true, keys: flushMatchKeys }),
        ({ actual, found, expected }) => {
          expect(isSameFlush(actual, toFlushTableRow(found))).toBe(expected)
        }
      )
    )
  })

  it('should return false if there is not a match', () => {
    fc.assert(
      fc.property(
        scenario({ arb: flushRowArb, isMatch: false, keys: flushMatchKeys }),
        ({ actual, found, expected }) => {
          expect(isSameFlush(actual, toFlushTableRow(found))).toBe(expected)
        }
      )
    )
  })
})
