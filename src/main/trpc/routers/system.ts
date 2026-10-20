import { shellService } from '@main/services'
import { unwrap } from '@main/trpc/unwrap'
import { ZOpenExternalInput, ZOpenPathInput } from '@shared/schemas/trpc'
import { procedure, router } from '../trpc'

export const systemRouter = router({
  openPath: procedure.input(ZOpenPathInput).mutation(async ({ input }): Promise<void> => {
    return await unwrap(shellService.open(input))
  }),
  openExternal: procedure.input(ZOpenExternalInput).mutation(async ({ input }) => {
    return await unwrap(shellService.openExternal(input))
  })
})
