import type { Executor } from '@main/db'
import {
  tasks,
  type TInsertTask,
  type TSelectFileRow,
  type TSelectJob,
  type TSelectTask
} from '@shared/db/schema'
import { and, eq } from 'drizzle-orm'

export const tasksRepo = {
  findByRow: async (
    db: Executor,
    input: { fileId: TSelectFileRow['fileId']; rowIdx: TSelectFileRow['rowIdx'] }
  ) => {
    const rows = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.fileId, input.fileId), eq(tasks.rowIdx, input.rowIdx)))
    return rows[0]
  },
  insertMany: (db: Executor, input: TInsertTask[]) => {
    return db.insert(tasks).values(input)
  },
  update: (db: Executor, input: { taskId: TSelectTask['id']; data: Partial<TInsertTask> }) => {
    return db.update(tasks).set(input.data).where(eq(tasks.id, input.taskId))
  },
  readOne: async (db: Executor, input: TSelectTask['id']) => {
    return db.query.tasks.findFirst({
      where: {
        id: input
      },
      with: {
        row: true
      }
    })
  },
  readIncomplete: (db: Executor, input: TSelectJob['id']) => {
    return db.query.tasks.findMany({
      where: {
        jobId: input,
        status: {
          ne: 'done'
        }
      },
      with: {
        row: true
      }
    })
  },
  readMany: (db: Executor, input: TSelectJob['id']) => {
    return db.select().from(tasks).where(eq(tasks.jobId, input))
  }
}
