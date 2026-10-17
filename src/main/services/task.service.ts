import type { Executor } from '@main/db'
import { fromDb, jobsRepo, taskIssuesRepo, taskProofsRepo, tasksRepo } from '@main/repositories'

import { assertJobExists, assertTaskExists } from '@main/services/assertions'
import { type TSelectJob, type TSelectTask } from '@shared/db/schema'
import { DatabaseError, NotAllowedError, NotFoundError } from '@shared/errors'
import { base64ToBuffer } from '@shared/lib/base64-to-blob'
import type { TReadIncompleteRes } from '@shared/schemas/trpc/task.schemas'
import type { ResultAsync } from 'neverthrow'

export class TaskService {
  constructor(private db: Executor) {}

  readIncompleteTasks(input: TSelectJob['id']): ResultAsync<TReadIncompleteRes, DatabaseError> {
    return fromDb(tasksRepo.readIncomplete(this.db, input))
  }

  commitTask(input: { taskId: TSelectTask['id']; screenshot: string }) {
    const { taskId, screenshot } = input
    return fromDb<void, DatabaseError | NotFoundError | NotAllowedError>(
      this.db.transaction(async (tx) => {
        const task = await tasksRepo.readOne(tx, taskId)
        assertTaskExists(task)

        const job = await jobsRepo.readOne(tx, task.jobId)
        assertJobExists(job)

        assertCanCommitTask(job, task)
        await tasksRepo.update(tx, { taskId, data: { status: 'done', completedAt: new Date() } })

        // now add the proof
        const image = base64ToBuffer(screenshot)
        await taskProofsRepo.insert(tx, { taskId, image })

        // delete any issues
        await taskIssuesRepo.delete(tx, taskId)

        // check if the job should be marked as done
        const incompleteTasks = await tasksRepo.readIncomplete(tx, task.jobId)
        if (incompleteTasks.length >= 1) return
        await jobsRepo.update(tx, {
          jobId: task.jobId,
          data: { status: 'complete', completedAt: new Date() }
        })
      })
    )
  }

  upsertIssue(input: { taskId: TSelectTask['id']; screenshot: string; hint: string }) {
    const { taskId, hint, screenshot } = input
    return fromDb(
      this.db.transaction(async (tx) => {
        const task = await tasksRepo.readOne(tx, taskId)
        assertTaskExists(task)

        const rowSnapshot = task.row.copyRow
        const image = base64ToBuffer(screenshot)

        assertCanAddIssue(task)
        await taskIssuesRepo.insert(tx, {
          taskId,
          image,
          hint,
          rowSnapshot
        })
      })
    )
  }
}

function assertCanCommitTask(job: TSelectJob, task: TSelectTask): void {
  if (job.status === 'complete') {
    throw new NotAllowedError('Cannot commit task: job already complete.')
  }
  if (task.status === 'done') {
    throw new NotAllowedError('Cannot commit task: task already done.')
  }
}

function assertCanAddIssue(task: TSelectTask): void {
  if (task.status === 'done') {
    throw new NotAllowedError('Cannot add issue: task already done.')
  }
}
