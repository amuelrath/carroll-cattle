import { FilesRepository, JobsRepository, TasksRepository } from '@main/repositories'
import type { SheetService } from '@main/services'
import { JobError, toAppError } from '@shared/errors'
import type {
  TCreateJobInput,
  TCreateJobResponse,
  TGetAllJobsWithProcessAndFileResponse,
  TGetJobWithTasksInput,
  TGetJobWithTasksResponse
} from '@shared/schemas/trpc'
import { type ResultAsync } from 'neverthrow'
import path from 'path'

export class JobService {
  constructor(
    private sheetService: SheetService,
    private files: FilesRepository,
    private jobs: JobsRepository,
    private tasks: TasksRepository
  ) {}

  createJob(input: TCreateJobInput): ResultAsync<TCreateJobResponse, JobError> {
    const { filePath, sheetName, processId } = input

    const fileName = path.parse(filePath).name
    const file = { fileName, sheetName }

    return this.sheetService
      .fetchSheetFromDisk({ filePath, sheetName })
      .asyncAndThen((rows) => this.files.createFileWithRows(file, rows))
      .andThen((fileId) => this.jobs.createJob({ fileId, processId }))
      .andThen((jobId) => this.tasks.createTasks(jobId).map(() => ({ jobId })))
      .mapErr((err) => toAppError(err, JobError))
  }

  // gets a job and its tasks with their actions
  getJobWithTasks(
    input: TGetJobWithTasksInput
  ): ResultAsync<TGetJobWithTasksResponse | undefined, JobError> {
    const { jobId } = input
    return this.jobs.readJobWithTasks(jobId).mapErr((err) => toAppError(err, JobError))
  }

  getAllJobs(): ResultAsync<TGetAllJobsWithProcessAndFileResponse, JobError> {
    return this.jobs.readAllJobsWithProcessAndFile().mapErr((err) => toAppError(err, JobError))
  }
}
