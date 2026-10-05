import { z } from 'zod'

export const blankToUndefined = (v: unknown) =>
  v === null || (typeof v === 'string' && v.trim() === '') ? undefined : v

export const zValueOrUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess(blankToUndefined, schema.optional())

// dateString => Date() => MM-dd-yyyy
export const dateField = z.coerce.date().transform((date) => {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getDate()}-${date.getFullYear()}`
})
