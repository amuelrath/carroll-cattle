import { ZJobKey } from '@shared/schemas/jobs'
import { uploadSchemas } from '@shared/schemas/jobs/upload'
import { z } from 'zod'

export const ZPreviewSheetInput = z.object({
  filePath: z.string().min(1)
})
export type TPreviewSheetInput = z.infer<typeof ZPreviewSheetInput>

export const ZSheetPreviewResponse = z.object({
  sheets: z.array(
    z.object({
      sheetName: z.string(),
      headRows: z.array(z.record(z.string(), z.unknown())).nullable()
    })
  )
})
export type TSheetPreviewResponse = z.infer<typeof ZSheetPreviewResponse>

export const ZFetchSheetInput = z.object({
  filePath: z.string().min(1),
  sheetName: z.string().min(1)
})
export type TFetchSheetInput = z.infer<typeof ZFetchSheetInput>

export const ZFetchSheetResponse = z.object({
  rows: z.array(z.record(z.string(), z.unknown()))
})
export type TFetchSheetResponse = z.infer<typeof ZFetchSheetResponse>

export const ZValidateSheetInput = ZFetchSheetInput.extend({
  jobKey: ZJobKey,
  columnMap: z.record(z.string(), z.string())
}).superRefine((val, ctx) => {
  const reqKeys = uploadSchemas[val.jobKey].keyof().options as string[]
  const mapKeys = Object.keys(val.columnMap)

  for (const key of reqKeys) {
    if (!mapKeys.includes(key)) {
      ctx.addIssue({
        code: 'custom',
        path: ['columnMap', key],
        message: `Missing mapping for required column "${key}"`
      })
    }
  }
})
export type TValidateSheetInput = z.infer<typeof ZValidateSheetInput>

const ZValidateSheetSuccessResponse = z.object({
  status: z.literal('valid'),
  sheet: z.array(z.record(z.string(), z.unknown()))
})
export type TValidateSheetSuccessResponse = z.infer<typeof ZValidateSheetSuccessResponse>

const ZValidateSheetErrorResponse = z.object({
  status: z.literal('invalid'),
  errors: z
    .array(
      z.object({
        columnName: z.string(),
        rowIdx: z.number(),
        detail: z.string().describe('Rendered in /jobs/validate')
      })
    )
    .min(1)
})
export type TValidateSheetErrorResponse = z.infer<typeof ZValidateSheetErrorResponse>

export const ZValidateSheetResponse = z.discriminatedUnion('status', [
  ZValidateSheetSuccessResponse,
  ZValidateSheetErrorResponse
])
export type TValidateSheetResponse = z.infer<typeof ZValidateSheetResponse>
