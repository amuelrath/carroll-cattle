import { procedure, router } from '../trpc'
import type { TFileOpenFileResponse } from '@shared/schemas/response'
import { errors } from '@shared/resources/strings'

export const dialogRouter = router({
  openFile: procedure.query(async ({ ctx }): Promise<TFileOpenFileResponse> => {
    try {
      const { canceled, filePaths } = await ctx.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          {
            name: '.csv, .xls, .xlsx',
            extensions: ['csv', 'xlsx', 'xls']
          }
        ]
      })
      if (canceled || filePaths.length === 0)
        return {
          status: 'success',
          data: {
            filePath: null
          }
        }
      return {
        status: 'success',
        data: { filePath: filePaths[0] }
      }
    } catch (e) {
      return {
        message: String(e),
        status: 'error',
        toast: { type: 'error', message: errors.unknown }
      }
    }
  })
})
