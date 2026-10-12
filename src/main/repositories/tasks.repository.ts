import type { DrizzleDb } from '@main/db'
import {
  fileRows,
  jobs,
  taskIssues,
  taskProofs,
  tasks,
  type TInsertTask,
  type TSelectJob,
  type TSelectTask
} from '@shared/db/schema'
import { DatabaseError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type { TReadIncompleteTasksWithRowsResponse } from '@shared/schemas/trpc/task.schemas'
import { eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'

export class TasksRepository {
  constructor(private db: DrizzleDb) {}
  createTasks(jobId: TSelectJob['id']) {
    return ResultAsync.fromPromise(
      this.db.transaction(async (tx) => {
        const job = await tx
          .select()
          .from(jobs)
          .where(eq(jobs.id, jobId))
          .limit(1)
          .execute()
          .then((rows) => rows[0])

        const rows = await tx
          .select()
          .from(fileRows)
          .where(eq(fileRows.fileId, job.fileId))
          .execute()

        const tasksToInsert = rows.map(
          (r) =>
            ({
              jobId,
              fileId: job.fileId,
              rowIdx: r.rowIdx
            }) satisfies TInsertTask
        )

        await tx.insert(tasks).values(tasksToInsert).execute()
      }),
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }

  readJobTasksWithRows(jobId: TSelectJob['id']) {
    return ResultAsync.fromPromise(
      this.db.query.tasks.findMany({
        where: {
          jobId
        },
        with: {
          row: true,
          issues: true,
          proof: true
        }
      }),
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }

  readIncompleteJobTasksWithRows(
    jobId: TSelectJob['id']
  ): ResultAsync<TReadIncompleteTasksWithRowsResponse, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db.query.tasks.findMany({
        where: {
          jobId,
          status: 'notDone'
        },
        with: {
          row: true
        }
      }),
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }

  commitTask(taskId: TSelectTask['id'], imgBase64: string) {
    return ResultAsync.fromPromise(
      // set status
      this.db.transaction(async (tx) => {
        await tx
          .update(tasks)
          .set({ status: 'done', completedAt: new Date() })
          .where(eq(tasks.id, taskId))
        // upload proof
        await tx
          .insert(taskProofs)
          .values({
            taskId,
            imgBase64
          })
          .onConflictDoUpdate({ target: taskProofs.taskId, set: { imgBase64 } })

        // remove issues
        await tx.delete(taskIssues).where(eq(taskIssues.taskId, taskId))
      }),
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }

  upsertIssue(taskId: TSelectTask['id'], imgBase64: string, desc: string) {
    return ResultAsync.fromPromise(
      this.db.transaction(async (tx) => {
        await tx.update(tasks).set({ status: 'notDone' }).where(eq(tasks.id, taskId))
        await tx
          .insert(taskIssues)
          .values({
            taskId,
            imgBase64,
            desc
          })
          .onConflictDoUpdate({ target: taskIssues.taskId, set: { imgBase64, desc } })
      }),
      (cause) => new DatabaseError(errors.database, { cause })
    )
  }
}
