import { shellService } from '@main/services'
import { unwrap } from '@main/trpc/unwrap'
import { ZOpenPathInput } from '@shared/schemas/trpc'
import { procedure, router } from '../trpc'

export const systemRouter = router({
  openPath: procedure.input(ZOpenPathInput).mutation(async ({ input }): Promise<void> => {
    const { filePath } = input
    await unwrap(shellService.open({ filePath }))
    return
  })
})
