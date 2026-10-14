import type { DrizzleDb } from '@main/db'
import { fileRows, files, type TInsertFile, type TSelectFile } from '@shared/db/schema'
import { DatabaseError } from '@shared/errors'
import { errors } from '@shared/resources/strings'
import { type TValidateSheetSuccessResponse } from '@shared/schemas/trpc'
import type { TUpdateRowValueInput } from '@shared/schemas/trpc/file.schemas'
import { and, eq } from 'drizzle-orm'
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
          originalRow: row,
          copyRow: row
        }))

        await tx.insert(fileRows).values(rowsToInsert)

        return fileId
      }),
      (err) => new DatabaseError(errors.database, { cause: err })
    )
  }

  readFile(id: TSelectFile['id']) {
    return ResultAsync.fromPromise(
      this.db.query.files.findFirst({
        where: {
          id
        }
      }),
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

  updateRow({
    fileId,
    rowIdx,
    value,
    columnName
  }: TUpdateRowValueInput): ResultAsync<void, DatabaseError> {
    return ResultAsync.fromPromise(
      this.db.transaction(async (tx) => {
        const { copyRow } = await tx
          .select()
          .from(fileRows)
          .where(and(eq(fileRows.fileId, fileId), eq(fileRows.rowIdx, rowIdx)))
          .then((res) => {
            if (res.length > 1) throw new Error('Multiple rows were returned.')
            return res[0]
          })

        await tx
          .update(fileRows)
          .set({ copyRow: { ...copyRow, [columnName]: value ? value.trim() : null } })
          .where(and(eq(fileRows.fileId, fileId), eq(fileRows.rowIdx, rowIdx)))
      }),

      (cause) => new DatabaseError(errors.database, { cause })
    )
  }
}
