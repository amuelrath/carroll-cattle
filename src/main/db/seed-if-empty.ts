import { processes } from '@shared/db/schema'
import { PROCESS_COPY } from '@shared/resources/strings/processes'
import { TProcess } from '@shared/schemas/process'
import log from 'electron-log/main'
import { db } from './index'

export async function seedIfEmpty() {
  try {
    const existing = await db.select().from(processes).limit(1)
    if (existing.length === 0) {
      await db.insert(processes).values([
        ...Object.entries(PROCESS_COPY).map(([id, { name, desc }]) => ({
          id: id as TProcess,
          name,
          desc
        }))
      ])
      log.info('Seeding complete.')
    } else {
      log.info('DB already seeded. Skipping...')
    }
  } catch (err) {
    log.error('Seeding failed: ', err)
    throw err
  }
}
