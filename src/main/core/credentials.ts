import { getDb } from '@main/db'
import { credentialsRepo } from '@main/repositories/credentials.repo'

let cached: Awaited<ReturnType<typeof credentialsRepo.read>>

export const credentialsCache = {
  load: async () => {
    cached = await credentialsRepo.read(getDb())
  },
  get: () => {
    if (!cached) throw new Error('No credentials saved')
    return cached
  }
}
