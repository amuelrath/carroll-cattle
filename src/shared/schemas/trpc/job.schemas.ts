import {
  ZSelectFile,
  ZSelectFileRow,
  ZSelectJob,
  ZSelectProcess,
  ZSelectTask,
  ZSelectTaskIssue,
  ZSelectTaskProof
} from '@shared/db/schema'
import { ZProcessId } from '@shared/schemas/jobs'
import { z } from 'zod'

export const ZCreateJobInput = z.object({
  processId: ZProcessId,
  filePath: z.string().min(1),
  sheetName: z.string().min(1),
  columnMap: z.record(z.string().min(1), z.string().min(1))
})
export type TCreateJobInput = z.infer<typeof ZCreateJobInput>

export const ZCreateJobResponse = z.object({
  jobId: z.number()
})
export type TCreateJobResponse = z.infer<typeof ZCreateJobResponse>

export const ZGetJobWithTasksInput = z.object({
  jobId: z.number()
})
export type TGetJobWithTasksInput = z.infer<typeof ZGetJobWithTasksInput>

export const ZGetJobWithTasksResponse = ZSelectJob.extend({
  process: ZSelectProcess,
  tasks: z.array(
    ZSelectTask.extend({
      row: ZSelectFileRow,
      proof: ZSelectTaskProof.optional().nullable(),
      issues: ZSelectTaskIssue.optional().nullable()
    })
  )
})
export type TGetJobWithTasksResponse = z.infer<typeof ZGetJobWithTasksResponse>

export const ZGetAllJobsWithProcessAndFileResponse = z.array(
  ZSelectJob.extend({
    process: ZSelectProcess,
    file: ZSelectFile
  })
)
export type TGetAllJobsWithProcessAndFileResponse = z.infer<
  typeof ZGetAllJobsWithProcessAndFileResponse
>
