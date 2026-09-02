import { z } from 'zod'

export const ZProcess = z.enum([
  'transOvaInventory',
  'breedRecip',
  'calveRecip',
  'pregCheck',
  'penguins'
])
export type TProcess = z.infer<typeof ZProcess>
