import { router, procedure } from '../trpc'

export const windowRouter = router({
  minimize: procedure.mutation(({ ctx }) => {
    ctx.window?.minimize()
  }),

  maximize: procedure.mutation(({ ctx }) => {
    if (!ctx.window) return
    ctx.window.isMaximized() ? ctx.window.unmaximize() : ctx.window.maximize()
  }),

  close: procedure.mutation(({ ctx }) => {
    ctx.window?.close()
  }),

  isMaximized: procedure.query(({ ctx }) => {
    return ctx.window?.isMaximized() ?? false
  })
})
