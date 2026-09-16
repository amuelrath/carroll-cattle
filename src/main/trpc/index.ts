import { dialogRouter } from './routers/dialog'
import { jobRouter } from './routers/job'
import { sheetRouter } from './routers/sheet'
import { systemRouter } from './routers/system'
import { windowRouter } from './routers/window'
import { router } from './trpc'

export const appRouter = router({
  window: windowRouter,
  dialog: dialogRouter,
  sheet: sheetRouter,
  system: systemRouter,
  job: jobRouter
})

export type AppRouter = typeof appRouter
