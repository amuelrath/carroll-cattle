import { z } from 'zod'

export const blankToUndefined = (v: unknown) =>
  v === null || (typeof v === 'string' && v.trim() === '') ? undefined : v

export const zValueOrUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess(blankToUndefined, schema.optional()).optional()

// dateString => Date() => MM-dd-yyyy
export const dateField = z
  .union([z.string(), z.number(), z.date()])
  .pipe(z.coerce.date())
  .transform((date) => {
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(date.getUTCDate()).padStart(2, '0')
    return `${mm}-${dd}-${date.getUTCFullYear()}`
  })
