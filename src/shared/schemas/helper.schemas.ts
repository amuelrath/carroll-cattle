import { z } from 'zod'

export const ZRecord = z.record(z.string(), z.union([z.string(), z.null()]))
export type TRecord = z.infer<typeof ZRecord>
