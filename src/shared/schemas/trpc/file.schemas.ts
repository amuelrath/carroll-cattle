import { z } from 'zod'

export const ZColumnMap = z.record(z.string(), z.string())
export type TColumnMap = z.infer<typeof ZColumnMap>

export const ZUpsertColumnMapInput = z.object({
  fileId: z.number(),
  columnMap: ZColumnMap
})

export type TUpsertColumnMapInput = z.infer<typeof ZUpsertColumnMapInput>

export const ZUpdateRowValueInput = z.object({
  fileId: z.number(),
  rowIdx: z.number(),
  columnName: z.string(),
  value: z.string().nullable()
})

export type TUpdateRowValueInput = z.infer<typeof ZUpdateRowValueInput>
