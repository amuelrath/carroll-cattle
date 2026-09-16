import { DialogError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type { TOpenFileResponse } from '@shared/schemas/trpc'
import type { Dialog } from 'electron'
import { ResultAsync } from 'neverthrow'

export class DialogService {
  openFile(dialog: Dialog): ResultAsync<TOpenFileResponse['filePath'], DialogError> {
    return ResultAsync.fromPromise(
      dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: '.csv, .xls, .xlsx', extensions: ['csv', 'xlsx', 'xls'] }]
      }),
      (err) => new DialogError(errors.unknown, { cause: err })
    ).map(({ canceled, filePaths }) => {
      if (canceled || filePaths.length === 0) return null
      return filePaths[0]
    })
  }
}
