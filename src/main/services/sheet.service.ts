import { pathExists } from '@main/lib/path-exists'
import { getSheet, getWorkbookSheetNamesAndHeads, readWorkbook } from '@main/lib/workbook'
import { JobsRepository } from '@main/repositories'
import { DatabaseError, NotFoundError, SheetError, toAppError } from '@shared/errors'
import { getColumns, getSheetRow } from '@shared/lib/sheet'
import { uploadSchemas } from '@shared/schemas/jobs'
import type {
  TFetchSheetInput,
  TFetchSheetResponse,
  TGetSheetInput,
  TMappedSheet,
  TPreviewSheetInput,
  TSheet,
  TSheetPreviewResponse,
  TUnmappedSheet
} from '@shared/schemas/trpc'
import { err, ok, Result, type ResultAsync, safeTry } from 'neverthrow'

export class SheetService {
  constructor(private jobs: JobsRepository) {}

  previewSheetsFromDisk(
    input: TPreviewSheetInput
  ): Result<TSheetPreviewResponse['sheets'], SheetError> {
    const { filePath } = input
    return pathExists({ filePath })
      .andThen(() => readWorkbook({ filePath }))
      .map((workbook) => getWorkbookSheetNamesAndHeads({ workbook }))
      .mapErr((err) => toAppError(err, SheetError))
  }

  fetchSheetFromDisk(input: TFetchSheetInput): Result<TFetchSheetResponse['rows'], SheetError> {
    const { sheetName, filePath } = input

    return pathExists({ filePath })
      .andThen(() => readWorkbook({ filePath }))
      .map((workbook) => getSheet({ workbook, sheetName }))
      .mapErr((err) => toAppError(err, SheetError))
  }

  getSheet(input: TGetSheetInput): ResultAsync<TSheet, DatabaseError | NotFoundError> {
    const { jobId } = input
    const { jobs } = this

    return safeTry(async function* () {
      const job = yield* await jobs.readJobWithTasks(jobId)
      if (!job) return err(new NotFoundError(`Job ${jobId} not found.`))

      if (!job.file.columnMap) {
        return ok({
          mapped: false,
          job: {
            id: job.id,
            status: job.status,
            processName: job.process.name
          },
          file: job.file
        } satisfies TUnmappedSheet)
      }

      const schema = uploadSchemas[job.processId]
      const columnMap = job.file.columnMap
      return ok({
        mapped: true,
        job: {
          id: job.id,
          status: job.status,
          processName: job.process.name
        },
        file: job.file,
        columns: getColumns(job.file.columnMap, schema),
        rows: job.tasks.map((task) => getSheetRow(task, schema, columnMap))
      } satisfies TMappedSheet)
    })
  }
}
