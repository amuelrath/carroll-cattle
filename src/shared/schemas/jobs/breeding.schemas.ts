import { dateField, zValueOrUndefined } from '@shared/schemas/jobs/helper.schemas'
import { z } from 'zod'

export const ZBreedingRow = z.object({
  method: z.enum(['AI', 'ET']).describe('The breeding method.'),
  recipTag: z.string().min(1).describe("The recipient's ear tag."),
  donorTag: z.string().min(1).describe("The donor's ear tag."),
  bullTag: z.string().min(1).describe("The bull's ear tag."),
  date: dateField.describe('The breeding date.'),
  technician: z.string().min(1).describe('The breeding technician.'),
  comments: zValueOrUndefined(z.string()).describe('Extra notes or details.'),

  // ET Only
  caneNo: zValueOrUndefined(z.string()).describe("The embryo's cane code. (ET Only)"),
  strawNo: zValueOrUndefined(z.string()).describe("The embryo's straw number. (ET Only)"),
  clSide: zValueOrUndefined(z.enum(['Left', 'Right'])).describe(
    'The side in which the corpus luteum has formed. (ET Only)'
  )
})

export type TBreedingRow = z.infer<typeof ZBreedingRow>
