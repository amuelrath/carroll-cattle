import { router, procedure } from '../trpc'
import { z } from 'zod'
import { ZProcess } from '@shared/schemas/process'
import * as XLSX from 'xlsx'
import type { TSheetImportSheetResponse } from '@shared/schemas/response'

export const sheetRouter = router({
  importSheet: procedure
    .input(z.object({ process: ZProcess, filePath: z.string() }))
    .query(async ({ input }): Promise<TSheetImportSheetResponse> => {
      const sheet = XLSX.readFile(input.filePath)

      if (sheet.SheetNames.length > 1) {
        // only one sheet: user must select which sheet to use
        // before the redirect
        return {
          status: 'success',
          data: {
            sheetNames: [...sheet.SheetNames]
          }
        }
      }

      // create new job in db, link file path

      return {
        status: 'success',
        data: {
          sheetNames: [...sheet.SheetNames]
        },
        redirect: `/process/${input.process}`
      }
    })
})
