import type { TJobStatus } from '@shared/db/schema'
import { ZReadIncompleteTasksWithRowsResponse } from '@shared/schemas/trpc/task.schemas'
import { z } from 'zod'

export const ZStartInput = z.object({
  jobId: z.number()
})
export type TStartInput = z.infer<typeof ZStartInput>

export const ZSpeed = z.enum(['slow', 'normal', 'max'])
export type TSpeed = z.infer<typeof ZSpeed>
export const ZSpeedInput = z.object({
  speed: ZSpeed
})

export const ZState = z.object({
  speed: ZSpeed,
  status: z.enum(['paused', 'active', 'inactive'] satisfies TJobStatus[]),
  narration: z.union([z.string(), z.undefined()]),
  jobId: z.union([z.number(), z.undefined()]),
  tasks: ZReadIncompleteTasksWithRowsResponse
})
export type TState = z.infer<typeof ZState>
