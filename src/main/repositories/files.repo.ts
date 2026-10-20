import { type Executor } from '@main/db'
import { files, type TInsertFile, type TSelectFile } from '@shared/db/schema'
import { eq } from 'drizzle-orm'

export const filesRepo = {
  insert: async (db: Executor, input: TInsertFile) => {
    const rows = await db.insert(files).values(input).returning({ id: files.id })
    return rows[0].id
  },
  readOne: async (db: Executor, input: TSelectFile['id']) => {
    const rows = await db.select().from(files).where(eq(files.id, input))
    return rows[0]
  },
  update: (db: Executor, input: { fileId: TSelectFile['id']; data: Partial<TInsertFile> }) => {
    return db.update(files).set(input.data).where(eq(files.id, input.fileId))
  }
}
