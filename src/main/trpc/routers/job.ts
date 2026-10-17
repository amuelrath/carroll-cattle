import { jobService } from '@main/services'
import { unwrap } from '@main/trpc/unwrap'
import {
  type TReadAllJobsRes,
  type TReadJobWithTasksRes,
  ZCreateJobInput,
  ZJobIdInput,
  ZReadAllJobsRes,
  ZReadJobWithTasksRes
} from '@shared/schemas/trpc'

import { procedure, router } from '../trpc'

export const jobRouter = router({
  create: procedure.input(ZCreateJobInput).mutation(async ({ input }) => {
    const res = await unwrap(jobService.createJob(input))
    return ZJobIdInput.parse(res)
  }),
  readAllJobs: procedure.query(async (): Promise<TReadAllJobsRes> => {
    const res = await unwrap(jobService.readAllJobs())
    return ZReadAllJobsRes.parse(res)
  }),
  readJobWithTasks: procedure
    .input(ZJobIdInput)
    .query(async ({ input }): Promise<TReadJobWithTasksRes | undefined> => {
      const res = await unwrap(jobService.readJobWithTasks(input))
      return ZReadJobWithTasksRes.parse(res)
    })
})
