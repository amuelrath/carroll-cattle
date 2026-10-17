import type { TSelectJob, TSelectTask } from '@shared/db/schema'
import { NotFoundError } from '@shared/errors'

export function assertTaskExists(task: TSelectTask | undefined): asserts task is TSelectTask {
  if (task === undefined) {
    throw new NotFoundError('Could not find task')
  }
}

export function assertJobExists(job: TSelectJob | undefined): asserts job is TSelectJob {
  if (job === undefined) {
    throw new NotFoundError('Could not find job')
  }
}
