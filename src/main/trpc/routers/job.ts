import { jobService } from '@main/services'
import { unwrap } from '@main/trpc/unwrap'
import { type TCreateJobResponse, ZCreateJobInput, ZCreateJobResponse } from '@shared/schemas/trpc'
import { procedure, router } from '../trpc'

export const jobRouter = router({
  create: procedure
    .input(ZCreateJobInput)
    .mutation(async ({ input }): Promise<TCreateJobResponse> => {
      const res = await unwrap(jobService.create(input))
      return ZCreateJobResponse.parse(res)
    })
})
