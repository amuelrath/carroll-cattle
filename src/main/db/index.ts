import 'dotenv/config'
import { relations } from '@shared/db/schema'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { app } from 'electron'
import log from 'electron-log/main'
import path from 'node:path'

const DEV_DB = 'dev.db'
const PROD_DB = 'prod.db'

const dbPath = path.join(app.getPath('userData'), process.env.DEV_MODE! ? DEV_DB : PROD_DB)

export const db = drizzle(`file:${dbPath}`, { relations })

export function resolveMigrationsPath(isPackaged: boolean, appPath: string, resourcesPath: string) {
  return isPackaged ? path.join(resourcesPath, 'drizzle') : path.join(appPath, 'drizzle')
}

export async function runMigrations() {
  try {
    const migrationsFolder = resolveMigrationsPath(
      app.isPackaged,
      app.getAppPath(),
      process.resourcesPath
    )
    log.info('Running migrations from', migrationsFolder)
    await migrate(db, { migrationsFolder })
    log.info('Migrations complete')
  } catch (err) {
    log.error('Migration failed:', err)
    throw err
  }
}
