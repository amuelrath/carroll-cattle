import { getCellEdits } from '@shared/lib/sheet'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

// Keys: normal headers plus the nasty ones
const keyArb = fc.oneof(
  { weight: 4, arbitrary: fc.string({ minLength: 1, maxLength: 8 }) },
  {
    weight: 1,
    arbitrary: fc.constantFrom('valueOf', 'toString', 'constructor', 'hasOwnProperty', '__proto__')
  }
)

const whitespaceArb = fc.string({ unit: fc.constantFrom(' ', '\t', '\n'), maxLength: 3 })

// Cells: real text, blank-ish strings, null
const cellArb = fc.oneof(
  fc.string(),
  whitespaceArb,
  fc.constant(null),
  fc.tuple(whitespaceArb, fc.string(), whitespaceArb).map(([a, s, b]) => a + s + b)
)

const rowArb = fc.dictionary(keyArb, cellArb)

// Reference semantics, written independently of the implementation
const norm = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
const get = (row: Record<string, unknown>, k: string) =>
  Object.hasOwn(row, k) ? row[k] : undefined
const byKey = <T extends { key: string }>(xs: T[]) =>
  [...xs].sort((a, b) => (a.key < b.key ? -1 : 1))

describe('getCellEdits', () => {
  it('a row diffed against itself has no edits', () => {
    fc.assert(
      fc.property(rowArb, (row) => {
        expect(getCellEdits(row, row)).toEqual([])
      })
    )
  })

  it('matches the reference: a key is reported iff its normalized values differ', () => {
    fc.assert(
      fc.property(rowArb, rowArb, (before, after) => {
        const edits = getCellEdits(before, after)
        const reported = new Map(edits.map((e) => [e.key, e]))
        const keys = new Set([...Object.keys(before), ...Object.keys(after)])

        for (const key of keys) {
          const from = norm(get(before, key))
          const to = norm(get(after, key))
          if (from === to) expect(reported.has(key)).toBe(false)
          else expect(reported.get(key)).toEqual({ key, from, to })
        }
        expect(edits.every((e) => keys.has(e.key))).toBe(true)
      })
    )
  })

  it('reports each key at most once', () => {
    fc.assert(
      fc.property(rowArb, rowArb, (before, after) => {
        const keys = getCellEdits(before, after).map((e) => e.key)
        expect(new Set(keys).size).toBe(keys.length)
      })
    )
  })

  it('never reports a no-op edit', () => {
    fc.assert(
      fc.property(rowArb, rowArb, (before, after) => {
        for (const e of getCellEdits(before, after)) expect(e.from).not.toBe(e.to)
      })
    )
  })

  it('is symmetric: swapping rows swaps from/to', () => {
    fc.assert(
      fc.property(rowArb, rowArb, (before, after) => {
        const forward = getCellEdits(before, after).map(({ key, from, to }) => ({
          key,
          from: to,
          to: from
        }))
        expect(byKey(getCellEdits(after, before))).toEqual(byKey(forward))
      })
    )
  })

  it('ignores surrounding whitespace', () => {
    fc.assert(
      fc.property(rowArb, whitespaceArb, whitespaceArb, (row, pre, post) => {
        const padded = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, typeof v === 'string' ? pre + v + post : v])
        )
        expect(getCellEdits(row, padded)).toEqual([])
      })
    )
  })

  it('treats missing, null, empty and whitespace-only cells as the same', () => {
    fc.assert(
      fc.property(keyArb, fc.constantFrom(null, '', ' ', '\t\n'), (key, blank) => {
        const withBlank = Object.fromEntries([[key, blank]])
        expect(getCellEdits({}, withBlank)).toEqual([])
        expect(getCellEdits(withBlank, {})).toEqual([])
      })
    )
  })

  it('applying the edits to `before` leaves nothing to diff against `after`', () => {
    fc.assert(
      fc.property(rowArb, rowArb, (before, after) => {
        const edits = getCellEdits(before, after)
        // fromEntries defines keys directly, so a "__proto__" edit can't touch the prototype
        const applied = Object.fromEntries([
          ...Object.entries(before),
          ...edits.map((e) => [e.key, e.to] as const)
        ])
        expect(getCellEdits(applied, after)).toEqual([])
      })
    )
  })

  it('changing one cell produces exactly one edit for that key', () => {
    fc.assert(
      fc.property(
        rowArb,
        keyArb,
        fc.string().filter((s) => s.trim() !== ''),
        (row, key, value) => {
          fc.pre(norm(get(row, key)) !== value.trim())
          const changed = Object.fromEntries([...Object.entries(row), [key, value]])
          expect(getCellEdits(row, changed)).toEqual([
            { key, from: norm(get(row, key)), to: value.trim() }
          ])
        }
      )
    )
  })

  it('does not throw on prototype-named keys (regression)', () => {
    expect(getCellEdits({ valueOf: null }, {})).toEqual([])
    expect(getCellEdits({}, { constructor: 'x' })).toEqual([
      { key: 'constructor', from: null, to: 'x' }
    ])
  })
})
