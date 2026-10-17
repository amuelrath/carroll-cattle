import type { Executor } from '@main/db'
import {
  fileRows,
  type TInsertFileRow,
  type TSelectFile,
  type TSelectFileRow
} from '@shared/db/schema'
import type { TRecord } from '@shared/schemas/helper.schemas'
import { and, eq } from 'drizzle-orm'

export const fileRowsRepo = {
  readOne: async (
    db: Executor,
    input: { fileId: TSelectFileRow['fileId']; rowIdx: TSelectFileRow['rowIdx'] }
  ) => {
    const rows = await db
      .select()
      .from(fileRows)
      .where(and(eq(fileRows.fileId, input.fileId), eq(fileRows.rowIdx, input.rowIdx)))
    return rows[0]
  },
  readMany: (db: Executor, input: TSelectFile['id']) => {
    return db.select().from(fileRows).where(eq(fileRows.fileId, input))
  },
  insertMany: (db: Executor, input: TInsertFileRow[]) => {
    return db
      .insert(fileRows)
      .values(input)
      .returning({ fileId: fileRows.fileId, rowIdx: fileRows.rowIdx })
  },
  update: (
    db: Executor,
    input: {
      fileId: TSelectFileRow['fileId']
      rowIdx: TSelectFileRow['rowIdx']
      data: TRecord
    }
  ) => {
    return db
      .update(fileRows)
      .set({ copyRow: input.data })
      .where(and(eq(fileRows.fileId, input.fileId), eq(fileRows.rowIdx, input.rowIdx)))
  }
}
