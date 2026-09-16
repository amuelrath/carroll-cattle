import type { SheetService } from '@main/services'
import { FilesDbService, JobsDbService } from '@main/services/db'
import type { TSelectJob, TStatus } from '@shared/db/schema'
import { JobError, toAppError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type {
  TCreateJobInput,
  TCreateJobResponse,
  TValidateSheetResponse
} from '@shared/schemas/trpc'
import { err, errAsync, ok, okAsync, type ResultAsync } from 'neverthrow'
import path from 'path'

export class JobService {
  constructor(
    private sheetService: SheetService,
    private filesDbService: FilesDbService,
    private jobsDbService: JobsDbService
  ) {}

  create(input: TCreateJobInput): ResultAsync<TCreateJobResponse, JobError> {
    const { filePath, sheetName, columnMap, jobKey } = input

    const fileName = path.parse(filePath).name
    const file = { fileName, sheetName }

    return this.sheetService
      .validateSheet({ filePath, sheetName, columnMap, jobKey })
      .andThen((res) => unwrapValidation(res))
      .asyncAndThen((rows) =>
        this.filesDbService.createFileWithRows({ file, rows }).map((fileId) => ({ fileId, rows }))
      )
      .andThen(({ fileId, rows }) =>
        this.jobsDbService.create({ fileId, processId: jobKey }).map((jobId) => ({ jobId, rows }))
      )
      .map(({ jobId, rows }) => ({ jobId, rows })) // ToDo: Now Create Tasks
      .mapErr((err) => toAppError(err, JobError))
  }

  updateStatus(id: TSelectJob['id'], status: TStatus): ResultAsync<void, JobError> {
    return this.jobsDbService
      .updateStatus({ id, status })
      .mapErr((err) => toAppError(err, JobError))
      .andThen((rows) =>
        rows.length === 0 ? errAsync(new JobError(errors.jobAlreadyComplete)) : okAsync(undefined)
      )
  }
}

function unwrapValidation(res: TValidateSheetResponse) {
  if (res.status === 'invalid') {
    return err(new JobError(errors.invalidSheet))
  }
  return ok(res.sheet)
}
