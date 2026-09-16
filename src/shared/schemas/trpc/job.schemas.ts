import { ZJobKey } from '@shared/schemas/jobs'
import { z } from 'zod'

export const ZCreateJobInput = z.object({
  jobKey: ZJobKey,
  filePath: z.string().min(1),
  sheetName: z.string().min(1),
  columnMap: z.record(z.string().min(1), z.string().min(1))
})
export type TCreateJobInput = z.infer<typeof ZCreateJobInput>

export const ZCreateJobResponse = z.object({
  jobId: z.number()
})
export type TCreateJobResponse = z.infer<typeof ZCreateJobResponse>
