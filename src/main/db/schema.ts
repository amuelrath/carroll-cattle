import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const testTable = sqliteTable('testTable', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull()
})
