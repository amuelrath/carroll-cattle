import { fileRouter } from '@main/trpc/routers/file'
import { automationRouter } from './routers/automation'
import { dialogRouter } from './routers/dialog'
import { jobRouter } from './routers/job'
import { processRouter } from './routers/process'
import { sheetRouter } from './routers/sheet'
import { systemRouter } from './routers/system'
import { windowRouter } from './routers/window'
import { router } from './trpc'

export const appRouter = router({
  window: windowRouter,
  dialog: dialogRouter,
  sheet: sheetRouter,
  system: systemRouter,
  job: jobRouter,
  process: processRouter,
  automation: automationRouter,
  file: fileRouter
})

export type AppRouter = typeof appRouter
