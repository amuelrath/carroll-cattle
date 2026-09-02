import { z } from 'zod'
import { TProcess } from './index'

export const ZTransOvaInventoryUploadRowSchema = z.object({
  donor: z.string(),
  sire: z.string(),
  freezeDate: z.date(),
  canister: z.int(),
  caneNumber: z.string(),
  strawNumber: z.int(),
  stage: z.int(),
  grade: z.int(),
  sex: z.enum(['RS M', 'RS F', 'N'])
})

export const ZBreedRecipientUploadRowSchema = z.object({
  recipTag: z.string(),
  donor: z.string(),
  sire: z.string(),
  date: z.date()
})

export const ZCalveRecipientUploadRowSchema = z.object({
  recipTag: z.string(),
  donor: z.string(),
  sire: z.string(),
  date: z.date()
})

export const ZPregnancyCheckUploadRowSchema = z.object({
  recipTag: z.string(),
  donor: z.string(),
  sire: z.string(),
  date: z.date()
})

// todo remove me
export const ZPenguinUploadRowSchema = z.object({
  species: z.enum(['Adelie', 'Gentoo', 'Chinstrap']),
  island: z.enum(['Torgersen', 'Biscoe', 'Dream']),
  billLength: z.float32(),
  billDepth: z.float32(),
  flipperLength: z.float32(),
  bodyMass: z.int(),
  sex: z.enum(['male', 'female']),
  year: z.int()
})

export const processUploadRowSchemaMap: Record<TProcess, z.ZodType> = {
  calveRecip: ZCalveRecipientUploadRowSchema,
  breedRecip: ZBreedRecipientUploadRowSchema,
  pregCheck: ZPregnancyCheckUploadRowSchema,
  transOvaInventory: ZTransOvaInventoryUploadRowSchema,
  penguins: ZPenguinUploadRowSchema
}
