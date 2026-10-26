import type { TFileRow } from '@shared/schemas/jobs'
import fc, { type Arbitrary } from 'fast-check'

const text = fc.string({ minLength: 1 }).filter((val) => val.trim() !== '')
const date = fc.stringMatching(/^\d\d-\d\d-\d\d\d\d$/)
const clSide = fc.constantFrom('Left', 'Right')
const textOrUndefined = fc.option(
  fc.string().filter((val) => val.trim() !== ''),
  { nil: undefined }
)

export const BreedRowETArb: Arbitrary<TFileRow<'breeding'>> = fc.record({
  method: fc.constantFrom('ET'),
  bullTag: text,
  recipTag: text,
  strawNo: fc.string(),
  caneNo: fc.string(),
  donorTag: text,
  date: date,
  technician: text,
  clSide: clSide,
  comments: textOrUndefined
})

export const BreedRowAIArb: Arbitrary<TFileRow<'breeding'>> = fc.record({
  method: fc.constantFrom('AI'),
  bullTag: text,
  recipTag: text,
  donorTag: text,
  date: date,
  technician: text,
  clSide: clSide,
  comments: textOrUndefined
})

export const toBreedTableRow = (row: TFileRow<'breeding'>) => {
  const garbage = fc.string()
  return fc.record({
    'Breeding Date': fc.constant(row.date),
    Method: garbage.map((g) => `${row.method}${g}${row.technician}`),
    Mating:
      row.method === 'AI' ?
        fc.constant(row.bullTag)
      : garbage.map((g) => `${row.bullTag}${g}${row.donorTag}`)
  })
}
