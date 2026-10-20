import type { Executor } from '@main/db'
import { fromDb } from '@main/repositories'
import { fileRowsRepo } from '@main/repositories/file-rows.repo'
import { filesRepo } from '@main/repositories/files.repo'
import { jobsRepo } from '@main/repositories/jobs.repo'
import { tasksRepo } from '@main/repositories/tasks.repo'
import type { TSelectFile, TSelectFileRow, TSelectJob, TSelectTask } from '@shared/db/schema'
import { DatabaseError, NotAllowedError, NotFoundError } from '@shared/errors'
import type { TUpdateRowValueInput, TUpsertColumnMapInput } from '@shared/schemas/trpc/file.schemas'

export class FileService {
  constructor(private db: Executor) {}

  readFile(input: { fileId: TSelectFile['id'] }) {
    const { fileId } = input
    return fromDb(filesRepo.readOne(this.db, fileId))
  }

  upsertColumnMap(input: TUpsertColumnMapInput) {
    const { fileId, columnMap } = input
    return fromDb(filesRepo.update(this.db, { fileId, data: { columnMap } }))
  }

  updateRow(input: TUpdateRowValueInput) {
    const { fileId, rowIdx, value, columnName } = input
    return fromDb<void, DatabaseError | NotAllowedError | NotFoundError>(
      this.db.transaction(async (tx) => {
        const job = await jobsRepo.findByFile(tx, fileId)
        const task = await tasksRepo.findByRow(tx, { fileId, rowIdx })
        const row = await fileRowsRepo.readOne(tx, { fileId, rowIdx })
        assertRowEditable(job, task, row, columnName)

        const rowToInsert = {
          ...row.copyRow,
          [columnName]: value ? String(value).trim() : null
        }

        await fileRowsRepo.update(tx, { fileId, rowIdx, data: rowToInsert })
      })
    )
  }
}

function assertRowEditable(
  job: TSelectJob | undefined,
  task: TSelectTask | undefined,
  row: TSelectFileRow | undefined,
  columnName: string
): void {
  if (!job) {
    throw new NotFoundError(`Could not find a job given fileId`)
  }

  if (!task) {
    throw new NotFoundError(`Could not find task given fileId and rowIdx`)
  }

  if (!row) {
    throw new NotFoundError(`Could not find row given fileId and rowIdx`)
  }

  if (job.status === 'complete') {
    throw new NotAllowedError('Cannot update row: job is complete.')
  }

  if (task.status === 'done') {
    throw new NotAllowedError(`Cannot update row: task already done.`)
  }

  const rowKeys = Object.keys(row.copyRow)
  if (!rowKeys.includes(columnName)) {
    throw new NotAllowedError(
      `Cannot update ${columnName} on row because that key doesn't already exist.`
    )
  }
}
