import { getDb } from '@main/db'
import { processes } from '@shared/db/schema'
import { procedure, router } from '../trpc'

export const processRouter = router({
  fetchProcesses: procedure.query(async () => {
    return getDb().select().from(processes).execute()
  })
})
