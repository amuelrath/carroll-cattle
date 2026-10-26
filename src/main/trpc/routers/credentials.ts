import { getDb } from '@main/db'
import { credentialsRepo } from '@main/repositories/credentials.repo'
import { procedure, router } from '@main/trpc/trpc'
import { ZCredentials } from '@shared/schemas/trpc/credentials.schemas'

export const credentialsRouter = router({
  setCredentials: procedure.input(ZCredentials).mutation(async ({ input }) => {
    await credentialsRepo.upsert(getDb(), input)
  }),
  getCredentials: procedure.query(async () => {
    return await credentialsRepo.read(getDb())
  })
})
