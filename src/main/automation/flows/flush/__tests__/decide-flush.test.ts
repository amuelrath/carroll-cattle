import { flushRowArb } from '@main/automation/flows/__tests__/_arbs'
import {
  type Flush,
  sameDetails,
  simulate,
  type World
} from '@main/automation/flows/flush/__tests__/_simulate'
import { isSameFlush, toFlushTableRow } from '@main/automation/flows/flush/helpers'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const variantOf = (row: Flush) =>
  fc.oneof(
    flushRowArb.map((r) => ({ ...r, donorTag: row.donorTag })), // unrelated flush
    fc.constant(row), // exact copy
    fc
      .string({ maxLength: 10 }) // same table columns,
      .filter((c) => c !== row.comments) // different hidden field
      .map((c) => ({ ...row, comments: c }))
  )

const scenarioArb = flushRowArb.chain((row) =>
  fc.record({
    row: fc.constant(row),
    world: fc.record({
      flushes: fc.array(variantOf(row), { maxLength: 4 }),
      dropsWrites: fc.boolean(),
      corrupts: fc.constantFrom(undefined, 'comments', 'frozen')
    })
  })
)

const honest = (w: World) => !w.dropsWrites && !w.corrupts
const hasTableMatch = (row: Flush, w: World) =>
  w.flushes.some((f) => isSameFlush(row, toFlushTableRow(f)))

describe('decideFlush', () => {
  it('a row matches its own table row', () =>
    fc.assert(
      fc.property(flushRowArb, (row) => {
        expect(isSameFlush(row, toFlushTableRow(row))).toBe(true)
      }),
      { endOnFailure: true }
    ))

  it('always settles: done or a RowIssue, never a stray error', () =>
    fc.assert(
      fc.property(scenarioArb, ({ row, world }) => {
        expect(simulate(row, world).outcome).not.toBe('error')
      })
    ))

  it('writes at most once', () =>
    fc.assert(
      fc.property(scenarioArb, ({ row, world }) => {
        expect(simulate(row, world).writes).toBeLessThanOrEqual(1)
      })
    ))

  it('never writes when a table-matching flush already exists', () =>
    fc.assert(
      fc.property(scenarioArb, ({ row, world }) => {
        fc.pre(hasTableMatch(row, world))
        expect(simulate(row, world).writes).toBe(0)
      })
    ))

  it('never reports success unless the site really holds the flush', () =>
    fc.assert(
      fc.property(scenarioArb, ({ row, world }) => {
        const r = simulate(row, world)
        if (r.outcome !== 'done') return
        expect(
          world.flushes.some((f) => isSameFlush(row, toFlushTableRow(f)) && sameDetails(row, f))
        ).toBe(true)
      })
    ))

  it('an honest site with no prior match ends done with one write', () =>
    fc.assert(
      fc.property(scenarioArb, ({ row, world }) => {
        fc.pre(honest(world) && !hasTableMatch(row, world))
        const r = simulate(row, world)
        expect(r).toMatchObject({ outcome: 'done', writes: 1 })
      })
    ))
})
