import type { Executor } from '@main/db'
import { pathExists } from '@main/lib/path-exists'
import { getSheet, getWorkbookSheetNamesAndHeads, readWorkbook } from '@main/lib/workbook'
import { fromDb, jobsRepo } from '@main/repositories'
import { NotFoundError } from '@shared/errors'
import { getColumns, getSheetRow } from '@shared/lib/sheet'
import { uploadSchemas } from '@shared/schemas/jobs'
import type {
  TFetchSheetInput,
  TGetSheetInput,
  TMappedSheetIn,
  TPreviewSheetInput,
  TUnmappedSheet
} from '@shared/schemas/trpc'
import { err, ok, safeTry } from 'neverthrow'

export class SheetService {
  constructor(private db: Executor) {}

  previewSheetsFromDisk(input: TPreviewSheetInput) {
    const { filePath } = input
    return pathExists({ filePath })
      .andThen(() => readWorkbook({ filePath }))
      .map((workbook) => getWorkbookSheetNamesAndHeads({ workbook }))
  }

  fetchSheetFromDisk(input: TFetchSheetInput) {
    const { sheetName, filePath } = input

    return pathExists({ filePath })
      .andThen(() => readWorkbook({ filePath }))
      .map((workbook) => getSheet({ workbook, sheetName }))
  }

  getSheet(input: TGetSheetInput) {
    const { jobId } = input
    const { db } = this

    return safeTry(async function* () {
      const job = yield* fromDb(jobsRepo.readOneWithTasks(db, jobId))
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
      } satisfies TMappedSheetIn)
    })
  }
}
