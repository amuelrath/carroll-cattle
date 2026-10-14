import { ZJobStatus } from '@shared/db/schema'
import { ZRecord } from '@shared/schemas/helper.schemas'
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
  rows: z.array(ZRecord)
})
export type TFetchSheetResponse = z.infer<typeof ZFetchSheetResponse>

export const ZGetSheetInput = z.object({
  jobId: z.number()
})
export type TGetSheetInput = z.infer<typeof ZGetSheetInput>

const ZValidateSheetSuccessResponse = z.object({
  status: z.literal('valid'),
  sheet: z.array(z.record(z.string(), z.string().nullable()))
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

const ZColumn = z.object({
  // mapped name, used everywhere
  key: z.string(),
  // raw header from upload or UNUSED
  source: z.string(),
  required: z.boolean()
})
export type TColumn = z.infer<typeof ZColumn>

export const ZCellError = z.object({
  key: z.string(),
  hint: z.string()
})
export type TCellError = z.infer<typeof ZCellError>

export const ZCellEdit = z.object({
  key: z.string(),
  from: z.string().nullable(),
  to: z.string().nullable()
})
export type TCellEdit = z.infer<typeof ZCellEdit>

const ZRowBase = z.object({
  rowIdx: z.number(),
  taskId: z.number(),
  copyRow: ZRecord,
  errors: z.array(ZCellError),
  edits: z.array(ZCellEdit)
})

const ZRowIssue = z.object({
  editsSince: z.array(ZCellEdit),
  screenshot: z.base64(),
  hint: z.string()
})
export type TRowIssue = z.infer<typeof ZRowIssue>

const ZRowProof = z.object({
  completedAt: z.date(),
  screenshot: z.base64()
})

export const ZSheetRow = z.discriminatedUnion('state', [
  ZRowBase.extend({ state: z.literal('ready') }),
  ZRowBase.extend({ state: z.literal('invalid') }),
  ZRowBase.extend({ state: z.literal('issue'), issue: ZRowIssue }),
  ZRowBase.extend({ state: z.literal('issueFixed'), issue: ZRowIssue }),
  ZRowBase.extend({ state: z.literal('done'), proof: ZRowProof })
])
export type TSheetRow = z.infer<typeof ZSheetRow>
export type TRowState = TSheetRow['state']

export const ZSheetBase = z.object({
  job: z.object({
    id: z.number(),
    status: ZJobStatus,
    processName: z.string()
  }),
  file: z.object({
    id: z.number(),
    fileName: z.string(),
    sheetName: z.string(),
    columnMap: z.record(z.string(), z.string()).nullable()
  })
})
export type TSheetBase = z.infer<typeof ZSheetBase>

export const ZMappedSheet = ZSheetBase.extend({
  mapped: z.literal(true),
  columns: z.array(ZColumn),
  rows: z.array(ZSheetRow)
})
export type TMappedSheet = z.infer<typeof ZMappedSheet>

export const ZUnmappedSheet = ZSheetBase.extend({
  mapped: z.literal(false)
})
export type TUnmappedSheet = z.infer<typeof ZUnmappedSheet>

export const ZSheet = z.discriminatedUnion('mapped', [ZMappedSheet, ZUnmappedSheet])
export type TSheet = z.infer<typeof ZSheet>
export const UNUSED = 'Unused' as const
