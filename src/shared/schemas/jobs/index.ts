import { z } from 'zod'

export const ZJobKey = z.enum([
  'transOvaInventory',
  'breedRecip',
  'calveRecip',
  'pregCheck',
  'penguins'
])
export type TJobKey = z.infer<typeof ZJobKey>
