import type { DrizzleDb } from '@main/db'
import { jobs, type TInsertJob, type TSelectJob, type TStatus } from '@shared/db/schema'
import { DatabaseError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import { and, eq, ne } from 'drizzle-orm'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

export class JobsDbService {
  constructor(private db: DrizzleDb) {}

  create(input: TInsertJob): ResultAsync<TSelectJob['id'], DatabaseError> {
    return ResultAsync.fromPromise(
      this.db
        .insert(jobs)
        .values(input)
        .returning({ id: jobs.id })
        .execute()
        .then((rows) => rows[0].id),
      (err) => new DatabaseError(errors.database, { cause: err })
    )
  }

  read(id: TSelectJob['id']): ResultAsync<TSelectJob, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db.select().from(jobs).where(eq(jobs.id, id)).limit(1).execute(),
      (err) => new DatabaseError(errors.database, { cause: err })
    ).andThen((rows) => (rows[0] ? okAsync(rows[0]) : errAsync(new DatabaseError(errors.notFound))))
  }

  delete(id: TSelectJob['id']): ResultAsync<void, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db
        .delete(jobs)
        .where(eq(jobs.id, id))
        .execute()
        .then(() => undefined),
      (err) => new DatabaseError(errors.database, { cause: err })
    )
  }

  updateStatus({
    id,
    status
  }: {
    id: TSelectJob['id']
    status: TStatus
  }): ResultAsync<{ status: TSelectJob['status'] }[], DatabaseError> {
    return ResultAsync.fromPromise(
      this.db
        .update(jobs)
        .set({ status })
        .where(and(eq(jobs.id, id), ne(jobs.status, 'success')))
        .returning({ status: jobs.status }),
      (err) => new DatabaseError(errors.database, { cause: err })
    )
  }
}
