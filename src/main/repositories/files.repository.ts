import type { DrizzleDb } from '@main/db'
import { fileRows, files, type TInsertFile, type TSelectFile } from '@shared/db/schema'
import { DatabaseError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import type { TValidateSheetSuccessResponse } from '@shared/schemas/trpc'
import { eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'

export class FilesRepository {
  constructor(private db: DrizzleDb) {}

  createFileWithRows(file: TInsertFile, rows: TValidateSheetSuccessResponse['sheet']) {
    return ResultAsync.fromPromise(
      this.db.transaction(async (tx) => {
        const { id: fileId } = await tx
          .insert(files)
          .values(file)
          .returning()
          .then((rows) => rows[0])

        // assemble the rows
        const rowsToInsert = rows.map((row, rowIdx) => ({
          fileId,
          rowIdx,
          json: row
        }))

        await tx.insert(fileRows).values(rowsToInsert)

        return fileId
      }),
      (err) => new DatabaseError(errors.database, { cause: err })
    )
  }

  readFileWithRows(id: TSelectFile['id']) {
    return ResultAsync.fromPromise(
      this.db
        .select()
        .from(files)
        .where(eq(files.id, id))
        .limit(1)
        .innerJoin(fileRows, eq(files.id, fileRows.fileId))
        .execute(),
      (err) => new DatabaseError(errors.database, { cause: err })
    )
  }

  deleteFile(id: TSelectFile['id']): ResultAsync<void, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db
        .delete(files)
        .where(eq(files.id, id))
        .execute()
        .then(() => undefined),
      (err) => new DatabaseError(errors.database, { cause: err })
    )
  }

  updateFile({
    id,
    params
  }: {
    id: TSelectFile['id']
    params: Partial<TInsertFile>
  }): ResultAsync<void, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db
        .update(files)
        .set({ ...params })
        .where(eq(files.id, id))
        .execute()
        .then(() => undefined),
      (err) => new DatabaseError(errors.database, { cause: err })
    )
  }
}
