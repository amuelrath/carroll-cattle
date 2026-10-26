import { capitalize } from '@shared/lib/strings'
import { dateField, zValueOrUndefined } from '@shared/schemas/jobs/helper.schemas'
import { z } from 'zod'

const copy = {
  recipTag: 'Required. The unique tag of the recipient that was checked.',
  date: 'Required. The date the recipient was diagnosed. (MM/DD/YYYY)',
  method:
    'Required. The method of diagnosis. ("Palpation", "Urine", "Observation", "Blood", "Ultrasound")',
  sex: 'The sex of the calf as seen on ultrasound.',
  result: 'Required. The diagnosis. ("open", "pregnant", "recheck")',
  technician: 'The name of the technician. Default is "Dr. White"',
  timePreg: 'The number of days or months pregnant.',
  comments: 'Extra notes or details.'
}

const DEF_TECHNICIAN = 'Dr. White'

export const ZPregCheckRow = z.object({
  recipTag: z
    .union([z.string(), z.number()])
    .transform((val) => String(val).trim())
    .pipe(z.string().min(1))
    .describe(copy.recipTag),
  date: dateField.describe(copy.date),
  method: z
    .string()
    .transform(capitalize)
    .pipe(z.enum(['Palpation', 'Urine', 'Observation', 'Blood', 'Ultrasound']))
    .describe(copy.method),
  sex: zValueOrUndefined(
    z
      .string()
      .transform(capitalize)
      .pipe(z.enum(['Bull', 'Heifer']))
  ).describe(copy.sex),
  timePreg: zValueOrUndefined(z.coerce.number()).describe(copy.timePreg),
  result: z
    .string()
    .transform(capitalize)
    .pipe(z.enum(['Open', 'Pregnant', 'Recheck']))
    .describe(copy.result),
  technician: zValueOrUndefined(z.string()).default(DEF_TECHNICIAN).describe(copy.technician),
  comments: zValueOrUndefined(z.string()).describe(copy.comments)
})
export type TPregCheckRow = z.infer<typeof ZPregCheckRow>
