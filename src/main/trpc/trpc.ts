import { ToastableTRPCError } from '@shared/lib/toast-error'
import { initTRPC } from '@trpc/server'
import log from 'electron-log/main'
import { z, ZodError } from 'zod'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    if (error.cause instanceof ZodError) {
      log.error('[trpc validation]', {
        path: shape.data?.path,
        issues: z.treeifyError(error.cause)
      })
    } else if (!(error instanceof ToastableTRPCError)) {
      log.error(`[trpc error] ${shape.data?.path}`, error.cause ?? error)
    }
    return {
      ...shape,
      data: {
        ...shape.data,
        toast: error instanceof ToastableTRPCError ? error.toast : undefined,
        causeMessage: error.cause instanceof Error ? error.cause.message : undefined
      }
    }
  }
})

export const router = t.router
export const procedure = t.procedure
