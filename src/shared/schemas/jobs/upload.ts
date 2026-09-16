import type { TJobKey } from '@shared/schemas/jobs'
import { z } from 'zod'

export const ZTransOvaInvRow = z.object({
  donor: z.string().describe('Donor animal ID'),
  sire: z.string().describe('Sire animal ID'),
  freezeDate: z.date().describe('Date the embryo/semen was frozen'),
  canister: z.int().describe('Storage tank canister number'),
  caneNumber: z.string().describe('Cane identifier within the canister'),
  strawNumber: z.int().describe('Straw position number on the cane'),
  stage: z.int().describe('Embryo development stage'),
  grade: z.int().describe('Embryo quality grade'),
  sex: z.enum(['RS M', 'RS F', 'N']).describe('Sexed result: male, female, or non-sexed')
})
export type TTransOvaInvRow = z.infer<typeof ZTransOvaInvRow>

export const ZBreedRecipRow = z.object({
  recipTag: z.string().describe('Recipient animal tag ID'),
  donor: z.string().describe('Donor animal ID'),
  sire: z.string().describe('Sire animal ID'),
  date: z.date().describe('Breeding date')
})
export type TBreedRecipRow = z.infer<typeof ZBreedRecipRow>

export const ZCalveRecipRow = z.object({
  recipTag: z.string().describe('Recipient animal tag ID'),
  donor: z.string().describe('Donor animal ID'),
  sire: z.string().describe('Sire animal ID'),
  date: z.date().describe('Calving date')
})
export type TCalveRecipRow = z.infer<typeof ZCalveRecipRow>

export const ZPregCheckRow = z.object({
  recipTag: z.string().describe('Recipient animal tag ID'),
  donor: z.string().describe('Donor animal ID'),
  sire: z.string().describe('Sire animal ID'),
  date: z.date().describe('Pregnancy check date')
})
export type TPregCheckRow = z.infer<typeof ZPregCheckRow>

export const ZPenguinRow = z.object({
  species: z.enum(['Adelie', 'Gentoo', 'Chinstrap']).describe('Penguin species'),
  island: z.enum(['Torgersen', 'Biscoe', 'Dream']).describe('Island where observed'),
  billLength: z.float32().describe('Bill length in millimeters'),
  billDepth: z.float32().describe('Bill depth in millimeters'),
  flipperLength: z.float32().describe('Flipper length in millimeters'),
  bodyMass: z.int().describe('Body mass in grams'),
  sex: z.enum(['male', 'female']).describe('Penguin sex'),
  year: z.int().describe('Year of observation')
})
export type TPenguinRow = z.infer<typeof ZPenguinRow>

export const uploadSchemas = {
  calveRecip: ZCalveRecipRow,
  breedRecip: ZBreedRecipRow,
  pregCheck: ZPregCheckRow,
  transOvaInventory: ZTransOvaInvRow,
  penguins: ZPenguinRow
} satisfies Record<TJobKey, z.ZodType>
export type TUploadSchemas = typeof uploadSchemas

export type TFileRow<K extends TJobKey> = z.infer<TUploadSchemas[K]>
