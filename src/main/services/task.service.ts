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

  startTask(input: TSelectTask['id']) {
    return fromDb(
      this.db.transaction(async (tx) => {
        const task = await tasksRepo.readOne(tx, input)
        assertTaskExists(task)

        assertTaskIncomplete(task)
        await tasksRepo.update(tx, { taskId: input, data: { startedAt: new Date() } })
      })
    )
  }

  commitTask(input: { taskId: TSelectTask['id']; screenshot: string; url: string }) {
    const { taskId, screenshot, url } = input
    return fromDb<void, DatabaseError | NotFoundError | NotAllowedError>(
      this.db.transaction(async (tx) => {
        const task = await tasksRepo.readOne(tx, taskId)
        assertTaskExists(task)

        const job = await jobsRepo.readOne(tx, task.jobId)
        assertJobExists(job)

        assertJobAndTaskIncomplete(job, task)
        await tasksRepo.update(tx, { taskId, data: { status: 'done', completedAt: new Date() } })

        // now add the proof
        const image = base64ToBuffer(screenshot)
        await taskProofsRepo.insert(tx, { taskId, image, url })

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

  upsertIssue(input: { taskId: TSelectTask['id']; screenshot: string; hint: string; url: string }) {
    const { taskId, hint, screenshot, url } = input
    return fromDb(
      this.db.transaction(async (tx) => {
        const task = await tasksRepo.readOne(tx, taskId)
        assertTaskExists(task)

        const rowSnapshot = task.row.copyRow
        const image = base64ToBuffer(screenshot)

        assertTaskIncomplete(task)
        await tasksRepo.update(tx, {
          taskId,
          data: { status: 'issue' }
        })

        await taskIssuesRepo.insert(tx, {
          taskId,
          image,
          hint,
          rowSnapshot,
          url
        })
      })
    )
  }
}

/* Ensure neither the job nor task is complete */
function assertJobAndTaskIncomplete(job: TSelectJob, task: TSelectTask): void {
  if (job.status === 'complete') {
    throw new NotAllowedError('Cannot commit task: job already complete.')
  }
  if (task.status === 'done') {
    throw new NotAllowedError('Cannot commit task: task already done.')
  }
}

/* Ensure task is not complete */
function assertTaskIncomplete(task: TSelectTask): void {
  if (task.status === 'done') {
    throw new NotAllowedError('Cannot add issue: task already done.')
  }
}
