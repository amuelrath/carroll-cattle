import { SheetError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type { TFetchSheetResponse, TSheetPreviewResponse } from '@shared/schemas/trpc'
import { Result } from 'neverthrow'
import XLSX from 'xlsx'

export function readWorkbook({
  filePath
}: {
  filePath: string
}): Result<XLSX.WorkBook, SheetError> {
  return Result.fromThrowable(
    () => XLSX.readFile(filePath, { cellDates: true, raw: false }),
    (cause) => new SheetError(`File couldn't be read.`, { cause, toast: errors.unreadableFile })
  )()
}

export function getSheet({
  workbook,
  sheetName
}: {
  workbook: XLSX.WorkBook
  sheetName: string
}): TFetchSheetResponse['rows'] {
  const sheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    blankrows: true,
    raw: false,
    dateNF: 'mm-dd-yyyy'
  }) as TFetchSheetResponse['rows']
}

export function getWorkbookSheetNamesAndHeads({
  workbook
}: {
  workbook: XLSX.WorkBook
}): TSheetPreviewResponse['sheets'] {
  return workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils
      .sheet_to_json(sheet, { defval: '', blankrows: true, raw: false, dateNF: 'mm-dd-yyyy' })
      .slice(0, 8) as TSheetPreviewResponse['sheets'][number]['headRows']
    const headRows = rows && rows.length > 0 ? rows : null
    return { sheetName, headRows }
  })
}
