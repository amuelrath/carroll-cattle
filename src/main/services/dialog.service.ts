import { NotAllowedError } from '@shared/errors'
import type { Dialog } from 'electron'
import { ResultAsync } from 'neverthrow'

export class DialogService {
  openFile(dialog: Dialog) {
    return ResultAsync.fromPromise(
      dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: '.csv, .xls, .xlsx', extensions: ['csv', 'xlsx', 'xls'] }]
      }),
      (cause) => new NotAllowedError('Not allowed to open file.', { cause })
    ).map(({ canceled, filePaths }) => {
      if (canceled || filePaths.length === 0) return null
      return filePaths[0]
    })
  }
}
