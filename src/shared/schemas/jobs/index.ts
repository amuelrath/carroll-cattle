import { z } from 'zod'

export const ZProcessId = z.enum([
  'transOvaInventory',
  'breedRecip',
  'calveRecip',
  'pregCheck',
  'penguins'
])
export type TProcessId = z.infer<typeof ZProcessId>
