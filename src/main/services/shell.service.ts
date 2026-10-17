import { pathExists } from '@main/lib/path-exists'
import { NotFoundError } from '@shared/errors'
import type { TOpenPathInput } from '@shared/schemas/trpc'
import { shell } from 'electron'
import { err, fromSafePromise, ok } from 'neverthrow'

export class ShellService {
  getFileName({ filePath }: TOpenPathInput) {
    return pathExists({ filePath })
      .asyncAndThen(() =>
        fromSafePromise(shell.openPath(filePath)).andThen((res) =>
          typeof res === 'string' && res.length > 0 ? err(new Error(res)) : ok()
        )
      )
      .mapErr((cause) => new NotFoundError('Could not locate that file.', { cause }))
  }
}
