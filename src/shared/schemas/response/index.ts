import { z } from 'zod'

const ZToastCall = z.object({
  type: z.enum(['info', 'error', 'success']),
  message: z.string()
})

const ZIpcSuccessResponse = z.object({
  status: z.literal('success'),
  toast: ZToastCall.optional(),
  redirect: z.string().optional()
})

const ZIpcErrorResponse = z.object({
  status: z.literal('error'),
  toast: ZToastCall.optional(),
  redirect: z.string().optional(),
  message: z.string()
})

function extendIpcResponse<T extends z.ZodRawShape>(dataShape: T) {
  return z.discriminatedUnion('status', [
    ZIpcErrorResponse,
    ZIpcSuccessResponse.extend({ data: z.object(dataShape) })
  ])
}

export const ZFileOpenFileResponse = extendIpcResponse({
  filePath: z.string().nullable()
})
export type TFileOpenFileResponse = z.infer<typeof ZFileOpenFileResponse>

export const ZSheetImportSheetResponse = extendIpcResponse({
  sheetNames: z.array(z.string()).nullable()
})
export type TSheetImportSheetResponse = z.infer<typeof ZSheetImportSheetResponse>
