import { getIssueDetails } from '@main/lib/get-issue-details'
import { SheetError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type {
  TFetchSheetResponse,
  TSheetPreviewResponse,
  TValidateSheetErrorResponse,
  TValidateSheetInput,
  TValidateSheetResponse
} from '@shared/schemas/trpc'
import { Result } from 'neverthrow'
import XLSX from 'xlsx'
import { z } from 'zod'

export function getSheetErrors({
  mappedSheet,
  schema,
  columnMap
}: {
  mappedSheet: TFetchSheetResponse['rows']
  schema: z.ZodType
  columnMap: TValidateSheetInput['columnMap']
}): TValidateSheetResponse {
  const cellErrs: TValidateSheetErrorResponse['errors'] = []
  mappedSheet.forEach((row, rowIdx) => {
    const { error } = schema.safeParse(row)
    if (!error) return

    const errs: TValidateSheetErrorResponse['errors'] = error.issues.map((iss) => {
      const targetKey = iss.path[0] as string

      return {
        rowIdx,
        columnName: columnMap[targetKey] ?? targetKey,
        detail: getIssueDetails(iss)
      }
    })
    return cellErrs.push(...errs)
  })

  if (cellErrs.length > 0)
    return {
      status: 'invalid',
      errors: cellErrs
    }

  return {
    status: 'valid',
    sheet: mappedSheet
  }
}

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

export function mapColumnNames({
  sheet,
  columnMap
}: {
  sheet: TFetchSheetResponse['rows']
  columnMap: TValidateSheetInput['columnMap']
}) {
  /* columnMap = Record<TargetKey, SheetKey>
   * the TargetKeys are derived from the schema
   * the SkeetKeys are from the parsed sheet
   */
  const reverseMap = Object.fromEntries(
    Object.entries(columnMap).map(([newKey, oldKey]) => [oldKey, newKey])
  )
  return sheet.map((row) =>
    Object.fromEntries(
      Object.entries(row)
        .filter(([oldKey]) => oldKey in reverseMap)
        .map(([oldKey, value]) => [reverseMap[oldKey], value])
    )
  )
}
