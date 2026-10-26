import type { TFlushRow } from '@shared/schemas/jobs/flush.schemas'
import { dateField } from '@shared/schemas/jobs/helper.schemas'
import fc from 'fast-check'

export const noWhitespaceArb = fc.string({ minLength: 1 }).filter((val) => val.trim() !== '')

export const dateArb = fc.date({
  min: new Date('2000-01-01T00:00:00Z'),
  max: new Date('2035-12-31T00:00:00Z'),
  noInvalidDate: true
})

export const count = fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined })
export const formattedDate = dateArb.map((d) => dateField.parse(d))

export const flushRowArb: fc.Arbitrary<TFlushRow> = fc.record(
  {
    date: formattedDate,
    donorTag: noWhitespaceArb,
    sireTag: noWhitespaceArb,
    type: fc.constantFrom('Conventional', 'IVF'),
    recovered: count,
    degenerate: count,
    unfertilized: count,
    discarded: count,
    usable: count,
    transferred: count,
    frozen: count,
    comments: fc.option(noWhitespaceArb, { nil: undefined })
  },
  { requiredKeys: ['date', 'donorTag', 'sireTag', 'type'] }
)
