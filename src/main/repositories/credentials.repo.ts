import type { Executor } from '@main/db'
import { credentials } from '@shared/db/schema'

export const credentialsRepo = {
  read: async (db: Executor) => {
    const res = await db.select().from(credentials).limit(1).execute()
    return res[0]
  }
}
