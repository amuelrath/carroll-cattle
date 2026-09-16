import { dialogService } from '@main/services'
import { unwrap } from '@main/trpc/unwrap'
import { type TOpenFileResponse, ZOpenFileResponse } from '@shared/schemas/trpc'
import { procedure, router } from '../trpc'

export const dialogRouter = router({
  openFile: procedure.mutation(async ({ ctx }): Promise<TOpenFileResponse> => {
    const { dialog } = ctx
    const filePath = await unwrap(dialogService.openFile(dialog))
    return ZOpenFileResponse.parse({ filePath })
  })
})
