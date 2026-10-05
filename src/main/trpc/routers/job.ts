import { jobService } from '@main/services'
import { unwrap } from '@main/trpc/unwrap'
import {
  type TCreateJobResponse,
  type TGetAllJobsWithProcessAndFileResponse,
  type TGetJobWithTasksResponse,
  ZCreateJobInput,
  ZCreateJobResponse,
  ZGetAllJobsWithProcessAndFileResponse,
  ZGetJobWithTasksInput,
  ZGetJobWithTasksResponse
} from '@shared/schemas/trpc'
import { procedure, router } from '../trpc'

export const jobRouter = router({
  create: procedure
    .input(ZCreateJobInput)
    .mutation(async ({ input }): Promise<TCreateJobResponse> => {
      const res = await unwrap(jobService.createJob(input))
      return ZCreateJobResponse.parse(res)
    }),
  fetchJobWithTasks: procedure
    .input(ZGetJobWithTasksInput)
    .query(async ({ input }): Promise<TGetJobWithTasksResponse | undefined> => {
      const res = await unwrap(jobService.getJobWithTasks(input))
      return ZGetJobWithTasksResponse.parse(res)
    }),
  fetchAllJobs: procedure.query(async (): Promise<TGetAllJobsWithProcessAndFileResponse> => {
    const res = await unwrap(jobService.getAllJobs())
    return ZGetAllJobsWithProcessAndFileResponse.parse(res)
  })
})
