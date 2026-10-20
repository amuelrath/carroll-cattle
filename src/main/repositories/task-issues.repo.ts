import type { Executor } from '@main/db'
import { taskIssues, type TInsertTaskIssue, type TSelectTaskIssue } from '@shared/db/schema'
import { eq } from 'drizzle-orm'

export const taskIssuesRepo = {
  delete: (db: Executor, input: TSelectTaskIssue['taskId']) => {
    return db.delete(taskIssues).where(eq(taskIssues.taskId, input))
  },
  insert: (db: Executor, input: TInsertTaskIssue) => {
    return db
      .insert(taskIssues)
      .values(input)
      .onConflictDoUpdate({
        target: taskIssues.taskId,
        set: { hint: input.hint, image: input.image, url: input.url }
      })
  }
}
