import { sheetService } from '@main/services'
import { procedure, router } from '@main/trpc/trpc'
import { unwrap } from '@main/trpc/unwrap'
import {
  type TFetchSheetResponse,
  type TSheet,
  type TSheetPreviewResponse,
  ZFetchSheetInput,
  ZFetchSheetResponse,
  ZGetSheetInput,
  ZPreviewSheetInput,
  ZSheet,
  ZSheetPreviewResponse
} from '@shared/schemas/trpc'

export const sheetRouter = router({
  previewSheets: procedure
    .input(ZPreviewSheetInput)
    .mutation(async ({ input }): Promise<TSheetPreviewResponse> => {
      const sheets = await unwrap(sheetService.previewSheetsFromDisk(input))
      return ZSheetPreviewResponse.parse({ sheets })
    }),

  fetchSheet: procedure
    .input(ZFetchSheetInput)
    .query(async ({ input }): Promise<TFetchSheetResponse> => {
      const rows = await unwrap(sheetService.fetchSheetFromDisk(input))
      return ZFetchSheetResponse.parse({ rows })
    }),

  getSheet: procedure.input(ZGetSheetInput).query(async ({ input }): Promise<TSheet> => {
    const view = await unwrap(sheetService.getSheet(input))
    return ZSheet.parse(view)
  })
})
