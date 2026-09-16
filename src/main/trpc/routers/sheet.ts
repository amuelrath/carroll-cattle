import { sheetService } from '@main/services'
import { procedure, router } from '@main/trpc/trpc'
import { unwrap } from '@main/trpc/unwrap'
import {
  type TFetchSheetResponse,
  type TSheetPreviewResponse,
  type TValidateSheetResponse,
  ZFetchSheetInput,
  ZFetchSheetResponse,
  ZPreviewSheetInput,
  ZSheetPreviewResponse,
  ZValidateSheetInput,
  ZValidateSheetResponse
} from '@shared/schemas/trpc'

export const sheetRouter = router({
  previewSheets: procedure
    .input(ZPreviewSheetInput)
    .mutation(async ({ input }): Promise<TSheetPreviewResponse> => {
      const sheets = await unwrap(sheetService.previewSheets(input))
      return ZSheetPreviewResponse.parse({ sheets })
    }),

  fetchSheet: procedure
    .input(ZFetchSheetInput)
    .query(async ({ input }): Promise<TFetchSheetResponse> => {
      const rows = await unwrap(sheetService.fetchSheet(input))
      return ZFetchSheetResponse.parse({ rows })
    }),

  validateSheet: procedure
    .input(ZValidateSheetInput)
    .query(async ({ input }): Promise<TValidateSheetResponse> => {
      const res = await unwrap(sheetService.validateSheet(input))
      return ZValidateSheetResponse.parse(res)
    })
})
