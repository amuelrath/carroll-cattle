import { processes } from '@shared/db/schema'
import log from 'electron-log/main'
import { getDb } from './'
import { processSeed } from './_data'

// ToDo seed data should live near here
export async function seedIfEmpty() {
  try {
    const existingProcesses = await getDb().select().from(processes).limit(1)
    if (existingProcesses.length === 0) {
      await getDb().insert(processes).values(processSeed)
      log.info('Process seeding complete.')
    } else {
      log.info('Processes already seeded. Skipping...')
    }
  } catch (err) {
    log.error('Seeding failed: ', err)
    throw err
  }
}
