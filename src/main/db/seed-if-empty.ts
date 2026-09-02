import { db } from './index'
import { testTable } from './schema'

export async function seedIfEmpty() {
  const existing = await db.select().from(testTable).limit(1)
  if (existing.length === 0) {
    await db.insert(testTable).values([{ name: 'test' }])
  }
}
