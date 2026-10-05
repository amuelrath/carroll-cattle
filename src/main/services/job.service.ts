import { FilesRepository, JobsRepository, TasksRepository } from '@main/repositories'
import type { SheetService } from '@main/services'
import { JobError, toAppError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type {
  TCreateJobInput,
  TCreateJobResponse,
  TGetAllJobsWithProcessAndFileResponse,
  TGetJobWithTasksInput,
  TGetJobWithTasksResponse,
  TValidateSheetResponse
} from '@shared/schemas/trpc'
import { err, ok, type ResultAsync } from 'neverthrow'
import path from 'path'

export class JobService {
  constructor(
    private sheetService: SheetService,
    private filesRepository: FilesRepository,
    private jobsRepository: JobsRepository,
    private tasksRepository: TasksRepository
  ) {}

  createJob(input: TCreateJobInput): ResultAsync<TCreateJobResponse, JobError> {
    const { filePath, sheetName, columnMap, processId } = input

    const fileName = path.parse(filePath).name
    const file = { fileName, sheetName }

    return this.sheetService
      .validateSheet({ filePath, sheetName, columnMap, processId })
      .andThen((res) => unwrapValidation(res))
      .asyncAndThen((rows) => this.filesRepository.createFileWithRows(file, rows))
      .andThen((fileId) => this.jobsRepository.createJob({ fileId, processId }))
      .andThen((jobId) => this.tasksRepository.createTasks(jobId).map(() => ({ jobId })))
      .mapErr((err) => toAppError(err, JobError))
  }

  // gets a job and its tasks with their actions
  getJobWithTasks(
    input: TGetJobWithTasksInput
  ): ResultAsync<TGetJobWithTasksResponse | undefined, JobError> {
    const { jobId } = input
    return this.jobsRepository.readJobWithTasks(jobId).mapErr((err) => toAppError(err, JobError))
  }

  getAllJobs(): ResultAsync<TGetAllJobsWithProcessAndFileResponse, JobError> {
    return this.jobsRepository
      .readAllJobsWithProcessAndFile()
      .mapErr((err) => toAppError(err, JobError))
  }
}

function unwrapValidation(res: TValidateSheetResponse) {
  if (res.status === 'invalid') {
    return err(new JobError(errors.invalidSheet))
  }
  return ok(res.sheet)
}
