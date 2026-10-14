import { FilesRepository } from '@main/repositories'
import type { DatabaseError } from '@shared/errors'
import type { TUpdateRowValueInput, TUpsertColumnMapInput } from '@shared/schemas/trpc/file.schemas'
import type { ResultAsync } from 'neverthrow'

export class FileService {
  constructor(private files: FilesRepository) {
    this.files = files
  }

  upsertColumnMap(input: TUpsertColumnMapInput): ResultAsync<void, DatabaseError> {
    const { fileId, columnMap } = input
    return this.files.updateFile({
      id: fileId,
      params: {
        columnMap
      }
    })
  }

  updateRow(input: TUpdateRowValueInput) {
    return this.files.updateRow(input)
  }
}
