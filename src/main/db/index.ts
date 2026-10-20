import 'dotenv/config'
import { relations } from '@shared/db/schema'
import { drizzle } from 'drizzle-orm/libsql'
import { app } from 'electron'
import path from 'node:path'

let _db: DrizzleDb | undefined

export function getDb() {
  if (!_db) {
    const dbFileName = app.isPackaged ? 'prod.db' : 'dev.db'
    const dbPath = `file:${path.join(app.getPath('userData'), dbFileName)}`
    _db = drizzle(dbPath, { relations })
  }
  return _db
}

export function __setDbForTesting(testDb: DrizzleDb) {
  _db = testDb
}

export type DrizzleDb = ReturnType<typeof drizzle<typeof relations>>

export type Tx = Parameters<Parameters<DrizzleDb['transaction']>[0]>[0]

export type Executor = DrizzleDb | Tx
