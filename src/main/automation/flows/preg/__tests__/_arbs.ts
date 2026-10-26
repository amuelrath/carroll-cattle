import type { TFileRow } from '@shared/schemas/jobs'
import type { TPregTableRow } from '@shared/schemas/jobs/site.schemas'
import fc, { type Arbitrary } from 'fast-check'

const textOrUndefined = fc.option(
  fc.string().filter((val) => val.trim() !== ''),
  { nil: undefined }
)

const numberOrUndefined = fc.option(fc.integer(), { nil: undefined })

const text = fc.string({ minLength: 1 }).filter((val) => val.trim() !== '')
const date = fc.stringMatching(/^\d\d-\d\d-\d\d\d\d$/)
const result = fc.constantFrom('Open', 'Pregnant', 'Recheck')
const method = fc.constantFrom('Palpation', 'Ultrasound', 'Blood', 'Observation', 'Urine')

export const PregRowArb: Arbitrary<TFileRow<'pregCheck'>> = fc.record({
  date,
  result,
  method,
  recipTag: text,
  technician: text,
  sex: fc.option(fc.constantFrom('Bull', 'Heifer'), { nil: undefined }),
  timePreg: numberOrUndefined,
  comments: textOrUndefined
})

export function toTableRow(row: TFileRow<'pregCheck'>): TPregTableRow {
  return {
    'Check Date': row.date,
    'Check Method': row.method,
    Result: row.result,
    'Time Pregnant': row.timePreg == null ? '' : String(row.timePreg),
    Technician: row.technician
  }
}
