import { pathExists } from '@main/lib/path-exists'
import {
  getSheet,
  getSheetErrors,
  getWorkbookSheetNamesAndHeads,
  mapColumnNames,
  readWorkbook
} from '@main/lib/workbook'
import { SheetError, toAppError } from '@shared/errors'
import { uploadSchemas } from '@shared/schemas/jobs/upload'
import type {
  TFetchSheetInput,
  TFetchSheetResponse,
  TPreviewSheetInput,
  TSheetPreviewResponse,
  TValidateSheetInput,
  TValidateSheetResponse
} from '@shared/schemas/trpc'
import { Result } from 'neverthrow'

export class SheetService {
  previewSheets(input: TPreviewSheetInput): Result<TSheetPreviewResponse['sheets'], SheetError> {
    const { filePath } = input
    return pathExists({ filePath })
      .andThen(() => readWorkbook({ filePath }))
      .map((workbook) => getWorkbookSheetNamesAndHeads({ workbook }))
      .mapErr((err) => toAppError(err, SheetError))
  }

  fetchSheet(input: TFetchSheetInput): Result<TFetchSheetResponse['rows'], SheetError> {
    const { sheetName, filePath } = input

    return pathExists({ filePath })
      .andThen(() => readWorkbook({ filePath }))
      .map((workbook) => getSheet({ workbook, sheetName }))
      .mapErr((err) => toAppError(err, SheetError))
  }

  validateSheet(input: TValidateSheetInput): Result<TValidateSheetResponse, SheetError> {
    const { processId, columnMap, sheetName, filePath } = input
    const schema = uploadSchemas[processId]

    return pathExists({ filePath })
      .andThen(() => readWorkbook({ filePath }))
      .map((workbook) => getSheet({ workbook, sheetName }))
      .map((sheet) => mapColumnNames({ sheet, columnMap }))
      .map((mappedSheet) => getSheetErrors({ mappedSheet, schema, columnMap }))
      .mapErr((err) => toAppError(err, SheetError))
  }
}
