import type { Executor } from '@main/db'
import { fileRowsRepo, filesRepo, fromDb, jobsRepo, tasksRepo } from '@main/repositories'
import type { SheetService } from '@main/services'
import { assertJobExists } from '@main/services/assertions'
import type {
  TInsertFileRow,
  TInsertTask,
  TJobStatus,
  TSelectFile,
  TSelectFileRow,
  TSelectJob
} from '@shared/db/schema'
import { DatabaseError, NotAllowedError, NotFoundError } from '@shared/errors'
import { TRecord } from '@shared/schemas/helper.schemas'
import type { TCreateJobInput, TJobIdInput, TReadAllJobsRes } from '@shared/schemas/trpc'
import type { ResultAsync } from 'neverthrow'
import path from 'path'

export class JobService {
  constructor(
    private db: Executor,
    private sheetService: SheetService
  ) {}

  createJob(input: TCreateJobInput) {
    const { filePath, sheetName, processId } = input
    const fileName = path.parse(filePath).name
    const file = { fileName, sheetName }
    return this.sheetService.fetchSheetFromDisk({ filePath, sheetName }).asyncAndThen((rows) =>
      fromDb(
        this.db.transaction(async (tx) => {
          const fileId = await filesRepo.insert(tx, file)
          const insertedRows = await fileRowsRepo.insertMany(tx, toRowInserts(fileId, rows))
          const jobId = await jobsRepo.insert(tx, { fileId, processId })
          await tasksRepo.insertMany(tx, toTaskInserts(jobId, insertedRows))
          return { jobId }
        })
      )
    )
  }

  readJobWithTasks(input: TJobIdInput) {
    const { jobId } = input
    return fromDb(jobsRepo.readOneWithTasks(this.db, jobId))
  }

  readAllJobs(): ResultAsync<TReadAllJobsRes, DatabaseError> {
    return fromDb(jobsRepo.readAll(this.db))
  }

  deleteJob(input: TJobIdInput) {
    const { jobId } = input
    return fromDb(jobsRepo.delete(this.db, jobId))
  }

  updateJobStatus(jobId: TSelectJob['id'], status: TJobStatus) {
    return fromDb<void, DatabaseError | NotFoundError | NotAllowedError>(
      this.db.transaction(async (tx) => {
        const job = await jobsRepo.readOne(tx, jobId)
        assertJobExists(job)

        assertCanUpdateJobStatus(job)
        await jobsRepo.update(tx, { jobId, data: { status } })
      })
    )
  }
}

function toRowInserts(fileId: TSelectFile['id'], rows: TRecord[]): TInsertFileRow[] {
  return rows.map((row, rowIdx) => ({
    fileId,
    rowIdx,
    copyRow: row,
    originalRow: row
  }))
}

function toTaskInserts(
  jobId: TSelectJob['id'],
  insertedRows: { fileId: TSelectFile['id']; rowIdx: TSelectFileRow['rowIdx'] }[]
): TInsertTask[] {
  return insertedRows.map(({ rowIdx, fileId }) => ({
    status: 'notDone',
    jobId,
    fileId,
    rowIdx
  }))
}

function assertCanUpdateJobStatus(job: TSelectJob) {
  if (job.status === 'complete') {
    throw new NotAllowedError('Job already complete.')
  }
}
