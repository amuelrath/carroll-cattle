import { getDb } from '@main/db'
import { procedure, router } from '@main/trpc/trpc'
import { credentials } from '@shared/db/schema'
import { z } from 'zod'

export const credentialsRouter = router({
  setCredentials: procedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      await getDb().transaction(async (tx) => {
        const exists = await tx.select().from(credentials).execute()
        if (exists.length === 0 || !exists) {
          return await tx.insert(credentials).values(input)
        } else {
          return await tx.update(credentials).set(input)
        }
      })
    }),
  getCredentials: procedure.query(async () => {
    const res = await getDb().select().from(credentials).limit(1).execute()
    return res[0]
  })
})
