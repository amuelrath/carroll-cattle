import { dateField, zValueOrUndefined } from '@shared/schemas/jobs/helper.schemas'
import { z } from 'zod'

export const ZFlushRow = z.object({
  date: dateField.describe('The aspiration date.'),
  donorTag: z.string().min(1).describe('The tag of the donor.'),
  sireTag: z.string().min(1).describe("The sire's tag."),
  type: z.enum(['Conventional', 'IVF']).describe('The flush method.'),
  recovered: zValueOrUndefined(z.coerce.number().int()).describe('The count of recovered oocytes.'),
  degenerate: zValueOrUndefined(z.coerce.number().int()).describe(
    'The count of degenerate oocytes.'
  ),
  unfertilized: zValueOrUndefined(z.coerce.number().int()).describe(
    'The count of unfertilized oocytes.'
  ),
  discarded: zValueOrUndefined(z.coerce.number().int()).describe('The count of discarded embryos.'),
  usable: zValueOrUndefined(z.coerce.number().int()).describe('The count of usable embryos.'),
  transferred: zValueOrUndefined(z.coerce.number().int()).describe(
    'The count of transferred embryos.'
  ),
  frozen: zValueOrUndefined(z.coerce.number().int()).describe('The count of frozen embryos.'),
  comments: zValueOrUndefined(z.string()).describe('Extra notes or details.')
})
// .superRefine((vals, ctx) => {
//   if (vals.frozen === 0 && vals.transferred === 0) {
//     for (const field of ['frozen', 'transferred'] as const) {
//       ctx.addIssue({
//         code: 'custom',
//         message: 'Must have at least one frozen or one transferred.',
//         path: [field]
//       })
//     }
//   }
// })

export type TFlushRow = z.infer<typeof ZFlushRow>
