import { pathExists } from '@main/lib/path-exists'
import { NotFoundError, UnknownError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type { TOpenExternal, TOpenPathInput } from '@shared/schemas/trpc'
import { shell } from 'electron'
import { err, fromSafePromise, ok, ResultAsync } from 'neverthrow'

export class ShellService {
  open({ filePath }: TOpenPathInput) {
    return pathExists({ filePath })
      .asyncAndThen(() =>
        fromSafePromise(shell.openPath(filePath)).andThen((res) =>
          typeof res === 'string' && res.length > 0 ? err(new Error(res)) : ok()
        )
      )
      .mapErr((cause) => new NotFoundError('Could not locate that file.', { cause }))
  }
  openExternal(input: TOpenExternal) {
    const { url } = input
    return ResultAsync.fromPromise(
      shell.openExternal(url),
      (cause) => new UnknownError(errors.unknown, { cause })
    )
  }
}
