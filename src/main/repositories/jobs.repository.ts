import type { DrizzleDb } from '@main/db'
import { jobs, type TInsertJob, type TJobStatus, type TSelectJob } from '@shared/db/schema'
import { DatabaseError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type {
  TGetAllJobsWithProcessAndFileResponse,
  TGetJobWithTasksResponse
} from '@shared/schemas/trpc'
import { eq } from 'drizzle-orm'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

export class JobsRepository {
  constructor(private db: DrizzleDb) {}

  createJob(input: TInsertJob): ResultAsync<TSelectJob['id'], DatabaseError> {
    return ResultAsync.fromPromise(
      this.db
        .insert(jobs)
        .values(input)
        .returning({ id: jobs.id })
        .execute()
        .then((rows) => rows[0].id),
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }

  readJob(id: TSelectJob['id']): ResultAsync<TSelectJob, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db.select().from(jobs).where(eq(jobs.id, id)).limit(1).execute(),
      (cause) => new DatabaseError(errors.database, { cause })
    ).andThen((rows) => (rows[0] ? okAsync(rows[0]) : errAsync(new DatabaseError(errors.notFound))))
  }

  readAllJobsWithProcessAndFile(): ResultAsync<
    TGetAllJobsWithProcessAndFileResponse,
    DatabaseError
  > {
    return ResultAsync.fromPromise(
      this.db.query.jobs
        .findMany({
          with: {
            process: true,
            file: true
          }
        })
        // assertion because it doesn't register that job.processId is required
        .execute() as PromiseLike<TGetAllJobsWithProcessAndFileResponse>,
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }

  readJobWithTasks(
    id: TSelectJob['id']
  ): ResultAsync<TGetJobWithTasksResponse | undefined, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db.query.jobs
        .findFirst({
          where: {
            id
          },
          with: {
            process: true,
            tasks: {
              with: {
                proof: true,
                issues: true,
                row: true
              }
            }
          }
        })
        // assertion because it doesn't register that processId is a string union
        .execute() as PromiseLike<TGetJobWithTasksResponse>,
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }

  updateJobState(id: TSelectJob['id'], status: TJobStatus): ResultAsync<void, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db
        .update(jobs)
        .set({ status })
        .where(eq(jobs.id, id))
        .execute()
        .then(() => undefined),
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }

  delete(id: TSelectJob['id']): ResultAsync<void, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db
        .delete(jobs)
        .where(eq(jobs.id, id))
        .execute()
        .then(() => undefined),
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }
}
