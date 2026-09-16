import { NotFoundError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import { err, ok, Result } from 'neverthrow'
import { existsSync } from 'node:fs'

export function pathExists({ filePath }: { filePath: string }): Result<void, NotFoundError> {
  if (!existsSync(filePath)) {
    return err(
      new NotFoundError(`Path "${filePath}" doesn't exist. Did the file move?`, {
        toast: errors.pathNotFound
      })
    )
  }
  return ok(undefined)
}
