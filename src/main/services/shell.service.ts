import { pathExists } from '@main/lib/path-exists'
import { ShellError, toAppError } from '@shared/errors'
import type { TOpenPathInput } from '@shared/schemas/trpc'
import { shell } from 'electron'
import { err, fromSafePromise, ok, type ResultAsync } from 'neverthrow'

export class ShellService {
  getFileName({ filePath }: TOpenPathInput): ResultAsync<void, ShellError> {
    return pathExists({ filePath })
      .asyncAndThen(() =>
        fromSafePromise(shell.openPath(filePath)).andThen((res) =>
          typeof res === 'string' && res.length > 0 ? err(new ShellError(res)) : ok()
        )
      )
      .mapErr((err) => toAppError(err, ShellError))
  }
}
