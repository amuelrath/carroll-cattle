import { AppError, DatabaseError, isAppError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import { ResultAsync } from 'neverthrow'

export { filesRepo } from './files.repo'
export { fileRowsRepo } from './file-rows.repo'
export { jobsRepo } from './jobs.repo'
export { tasksRepo } from './tasks.repo'
export { taskIssuesRepo } from './task-issues.repo'
export { taskProofsRepo } from './task-proofs.repo'

export const fromDb = <T, E extends AppError = never>(p: Promise<T>) =>
  ResultAsync.fromPromise(p, (cause): E | DatabaseError =>
    isAppError(cause) ? (cause as E) : new DatabaseError(errors.database, { cause })
  )
