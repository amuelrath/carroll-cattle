import type { Executor } from '@main/db'
import { credentials } from '@shared/db/schema'
import type { TCredentials } from '@shared/schemas/trpc/credentials.schemas'

export const credentialsRepo = {
  read: async (db: Executor) => {
    const res = await db.select().from(credentials).limit(1).execute()
    return res[0]
  },
  upsert: async (db: Executor, input: TCredentials) => {
    await db.transaction(async (tx) => {
      const exists = await tx.select().from(credentials).execute()
      if (exists.length === 0 || !exists) {
        return await tx.insert(credentials).values(input)
      } else {
        return await tx.update(credentials).set(input)
      }
    })
  }
}
