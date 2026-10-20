import { dateField, zValueOrUndefined } from '@shared/schemas/jobs/helper.schemas'
import { z } from 'zod'

// const copy = {
//   method: `Required. The method of breeding. ("Artificial Insemination", "Natural Service", "Embryo Transfer")`,
//   date: 'Required. The date of breeding. (MM/DD/YYYY)',
//   technician: "Breeding technician's name.",
//   bull: 'The unique ear tag or name of the bull.'
// }

// ToDo: Add copy for column definitions
export const ZBreedingRow = z.object({
  method: z.enum(['AI', 'ET']),
  recipTag: z.string().min(1),
  donorTag: z.string().min(1),
  bullTag: z.string().min(1),
  date: dateField,
  technician: z.string().min(1),
  comments: zValueOrUndefined(z.string()),

  // ET Only
  caneNo: zValueOrUndefined(z.string()),
  strawNo: zValueOrUndefined(z.string()),
  clSide: zValueOrUndefined(z.enum(['Left', 'Right']))
})

const zEtOnly = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.undefined({ message: 'Only allowed when method is ET' })
)

const ZBreedingBase = z.object({
  recipTag: z.string().min(1),
  donorTag: z.string().min(1),
  bullTag: z.string().min(1),
  date: dateField,
  technician: z.string().min(1),
  comments: zValueOrUndefined(z.string())
})

const ZAIRow = ZBreedingBase.extend({
  method: z.literal('AI'),
  caneNo: zEtOnly,
  strawNo: zEtOnly,
  clSide: zEtOnly
})

const ZETRow = ZBreedingBase.extend({
  method: z.literal('ET'),
  caneNo: z.string().min(1),
  strawNo: z.string().min(1),
  clSide: z.enum(['Left', 'Right'])
})

export const ZBreedingRowGen = z.discriminatedUnion('method', [ZAIRow, ZETRow])

export type TBreedingRow = z.infer<typeof ZBreedingRow>
