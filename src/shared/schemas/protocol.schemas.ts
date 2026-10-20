import { z } from 'zod'

export const ZWorkerRequest = z.object({
  id: z.number(),
  payload: z.record(z.string(), z.unknown())
})
export type TWorkerRequest = z.infer<typeof ZWorkerRequest>

const ZWorkerSuccessResponse = z.object({
  id: z.number(),
  kind: z.literal('success'),
  data: z.unknown().optional(),
  screenshot: z.base64().optional()
})

const ZWorkerErrorType = z.enum(['timeout', 'unknown'])

const ZWorkerErrorResponse = z.object({
  id: z.number(),
  kind: z.literal('error'),
  errorType: ZWorkerErrorType,
  message: z.string(),
  stack: z.string().optional(),
  screenshot: z.base64().optional()
})
export type TWorkerErrorResponse = z.infer<typeof ZWorkerErrorResponse>

export const ZWorkerResponse = z.discriminatedUnion('kind', [
  ZWorkerErrorResponse,
  ZWorkerSuccessResponse
])
export type TWorkerResponse = z.infer<typeof ZWorkerResponse>
