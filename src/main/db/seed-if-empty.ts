import { getDb } from '@main/db/index'
import { processes } from '@shared/db/schema'
import { PROCESS_COPY } from '@shared/resources/strings/processes'
import type { TProcessId } from '@shared/schemas/jobs'
import log from 'electron-log/main'

export async function seedIfEmpty() {
  try {
    const existing = await getDb().select().from(processes).limit(1)
    if (existing.length === 0) {
      await getDb()
        .insert(processes)
        .values([
          ...Object.entries(PROCESS_COPY).map(([id, { name, desc }]) => ({
            id: id as TProcessId,
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
