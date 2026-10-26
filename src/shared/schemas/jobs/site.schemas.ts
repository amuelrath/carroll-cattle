import { dateField, zValueOrUndefined } from '@shared/schemas/jobs/helper.schemas'
import { z } from 'zod'

/** When we search for an animal and multiple results are displayed,
 * the results table should contain these properties */
export const ZAnimalSearchResultRow = z.object({
  'Ear Tag': z.string().min(1),
  'Animal Type': z.preprocess(
    (val: string) => {
      // Extracts the enum val from the val so it won't break on 'Calf - B'
      if (typeof val !== 'string') return val
      const match = val.match(/\b(bull|cow|calf)\b/i)
      if (!match) return val // let z.enum produce the normal error
      const word = match[1].toLowerCase()
      return word[0].toUpperCase() + word.slice(1)
    },
    z.enum(['Bull', 'Cow', 'Calf'])
  ),
  Status: z.enum(['Active', 'Sold', 'Dead', 'Reference'])
})

export type TAnimalSearchResultRow = z.infer<typeof ZAnimalSearchResultRow>

export const ZFlushTableRow = z.object({
  'Flush Date': z.string(),
  Sire: z.string(),
  'Flush Type': z.enum(['IVF', 'Conventional']),
  Recovered: zValueOrUndefined(z.coerce.number()),
  Usable: zValueOrUndefined(z.coerce.number()),
  Frozen: zValueOrUndefined(z.coerce.number()),
  Transferred: zValueOrUndefined(z.coerce.number()),
  Unfertilized: zValueOrUndefined(z.coerce.number()),
  Degenerate: zValueOrUndefined(z.coerce.number())
})
export type TFlushTableRow = z.infer<typeof ZFlushTableRow>

export const ZPregTableRow = z.object({
  'Check Date': dateField,
  'Check Method': z.enum(['Palpation', 'Ultrasound', 'Blood', 'Observation', 'Urine']),
  Result: z.enum(['Open', 'Pregnant', 'Recheck']),
  'Time Pregnant': zValueOrUndefined(z.string()),
  Technician: zValueOrUndefined(z.string())
})

export type TPregTableRow = z.infer<typeof ZPregTableRow>

// table will list MULTIPLE VALUES in some cells. have to double parse
export const ZBreedTableRowRaw = z.object({
  'Breeding Date': z.string(),
  // Will list donor and sire
  Mating: z.string(),
  // can sometimes list the technician below it. we will have to parse it out manually
  Method: z.string()
})

export type TBreedTableRowRaw = z.infer<typeof ZBreedTableRowRaw>
