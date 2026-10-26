import type { DrizzleDb } from '@main/db'
import { relations } from '@shared/db/schema'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { randomUUID } from 'node:crypto'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export const TEST_DB_ROOT = path.join(tmpdir(), 'drizzle-tests')
mkdirSync(TEST_DB_ROOT, { recursive: true })
const dir = mkdtempSync(path.join(TEST_DB_ROOT, 'run-'))

const templatePath = path.join(dir, 'template.db')
let templateReady: Promise<void> | undefined

// Migrate once per test file, then copy the result for each test
function ensureTemplate() {
  templateReady ??= (async () => {
    const db = drizzle({ connection: { url: `file:${templatePath}` }, relations })
    await migrate(db, { migrationsFolder: 'drizzle' }) // your drizzle-kit out dir
    db.$client.close()
  })()
  return templateReady
}

export async function createTestDb(): Promise<{ db: DrizzleDb; cleanup: () => void }> {
  await ensureTemplate()
  const file = path.join(dir, `${randomUUID()}.db`)
  copyFileSync(templatePath, file)

  const db = drizzle({ connection: { url: `file:${file}` }, relations })
  await db.run('PRAGMA foreign_keys = ON')

  return {
    db,
    cleanup: () => {
      db.$client.close()
      try {
        rmSync(file, { force: true })
      } catch {
        // Windows may still hold the handle; the folder is wiped at the next run
      }
    }
  }
}

export async function withDb(fn: (db: DrizzleDb) => Promise<void>) {
  const { db, cleanup } = await createTestDb()
  try {
    await fn(db)
  } finally {
    cleanup()
  }
}
