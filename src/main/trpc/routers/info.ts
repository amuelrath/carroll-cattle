import { procedure, router } from '@main/trpc/trpc'
import { app } from 'electron'

export const infoRouter = router({
  getVersion: procedure.query(() => {
    return app.getVersion()
  })
})
