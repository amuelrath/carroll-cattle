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
