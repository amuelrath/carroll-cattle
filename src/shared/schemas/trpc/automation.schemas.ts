import { ZJobStatus } from '@shared/db/schema'
import { ZReadIncompleteRes } from '@shared/schemas/trpc/task.schemas'
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
  status: ZJobStatus,
  narration: z.union([z.string(), z.undefined()]),
  jobId: z.union([z.number(), z.undefined()]),
  tasks: ZReadIncompleteRes
})
export type TState = z.infer<typeof ZState>
