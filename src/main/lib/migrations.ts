import type { DrizzleDb } from '@main/db'
import logger from '@main/logger'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { app } from 'electron'
import path from 'node:path'

export function resolveMigrationsPath(isPackaged: boolean, appPath: string, resourcesPath: string) {
  return isPackaged ? path.join(resourcesPath, 'drizzle') : path.join(appPath, 'drizzle')
}

export async function runMigrations(db: DrizzleDb) {
  try {
    const migrationsFolder = resolveMigrationsPath(
      app.isPackaged,
      app.getAppPath(),
      process.resourcesPath
    )
    logger.info({ message: `Running migrations from "${migrationsFolder}` })
    await migrate(db, { migrationsFolder })
    logger.info({ message: 'Migrations complete' })
  } catch (err) {
    logger.warn({
      message: `Migrations Failed: ${err}`
    })
    throw err
  }
}
