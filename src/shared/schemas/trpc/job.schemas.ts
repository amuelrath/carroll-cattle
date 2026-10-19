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
  filePath: z.string().min(1),
  sheetName: z.string().min(1),
  processId: ZProcessId
})
export type TCreateJobInput = z.infer<typeof ZCreateJobInput>

export const ZJobIdInput = z.object({
  jobId: z.number().int()
})
export type TJobIdInput = z.infer<typeof ZJobIdInput>

export const ZReadJobWithTasksRes = ZSelectJob.extend({
  file: ZSelectFile,
  process: ZSelectProcess,
  tasks: z.array(
    ZSelectTask.extend({
      row: ZSelectFileRow,
      proof: ZSelectTaskProof.nullable(),
      issue: ZSelectTaskIssue.nullable()
    })
  )
})
export type TReadJobWithTasksRes = z.infer<typeof ZReadJobWithTasksRes>

export const ZReadAllJobsRes = z.array(
  ZSelectJob.extend({
    file: ZSelectFile,
    process: ZSelectProcess,
    tasks: z.array(ZSelectTask)
  })
)
export type TReadAllJobsRes = z.infer<typeof ZReadAllJobsRes>

export const ZRenameJobInput = z.object({
  jobId: z.number(),
  title: z.string().min(1)
})
export type TRenameJobInput = z.infer<typeof ZRenameJobInput>
