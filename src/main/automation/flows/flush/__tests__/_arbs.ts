import type { TFileRow } from '@shared/schemas/jobs'
import fc, { type Arbitrary } from 'fast-check'

const numberOrUndefined = fc.option(fc.integer(), { nil: undefined })
const textOrUndefined = fc.option(
  fc.string().filter((val) => val.trim() !== ''),
  { nil: undefined }
)

const text = fc.string({ minLength: 1 }).filter((val) => val.trim() !== '')
const date = fc.stringMatching(/^\d\d-\d\d-\d\d\d\d$/)
const type = fc.constantFrom('IVF', 'Conventional')

export const FlushRowArb: Arbitrary<TFileRow<'flush'>> = fc.record({
  date,
  type,
  technician: text,
  sex: fc.option(fc.constantFrom('Bull', 'Heifer'), { nil: undefined }),
  timePreg: numberOrUndefined,
  comments: textOrUndefined,
  usable: numberOrUndefined,
  unfertilized: numberOrUndefined,
  transferred: numberOrUndefined,
  recovered: numberOrUndefined,
  frozen: numberOrUndefined,
  degenerate: numberOrUndefined,
  sireTag: text,
  discarded: numberOrUndefined,
  donorTag: text
})
