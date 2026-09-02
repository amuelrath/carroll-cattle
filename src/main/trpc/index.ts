import { windowRouter } from './routers/window'
import { router } from './trpc'
import { dialogRouter } from './routers/dialog'
import { sheetRouter } from './routers/sheet'

export const appRouter = router({
  window: windowRouter,
  dialog: dialogRouter,
  sheet: sheetRouter
})

export type AppRouter = typeof appRouter
