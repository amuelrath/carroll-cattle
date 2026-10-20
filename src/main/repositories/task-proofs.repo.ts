import type { Executor } from '@main/db'
import { taskProofs, type TInsertTaskProof } from '@shared/db/schema'

export const taskProofsRepo = {
  insert: (db: Executor, input: TInsertTaskProof) => {
    return db.insert(taskProofs).values(input).returning({ taskId: taskProofs.taskId })
  }
}
