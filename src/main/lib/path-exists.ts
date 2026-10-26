import { NotFoundError } from '@shared/errors'
import { err, ok, Result } from 'neverthrow'
import { existsSync } from 'node:fs'

export function pathExists({ filePath }: { filePath: string }): Result<void, NotFoundError> {
  if (!existsSync(filePath)) {
    return err(
      new NotFoundError(`Path "${filePath}" doesn't exist.`, {
        toast: {
          type: 'error',
          title: 'Not Found',
          description: 'Could not find that file'
        }
      })
    )
  }
  return ok(undefined)
}
