import { type AppError, isAppError, ToastableError } from '@shared/errors'
import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'

interface ErrorData {
  type?: AppError['type']
  toast?: string
}

const t = initTRPC.context<Context>().create({
  // gets forwarded to any onError
  errorFormatter({ shape, error }) {
    const cause =
      error.cause instanceof ToastableError && isAppError(error.cause) ? error.cause : undefined
    return {
      ...shape,
      data: {
        ...shape.data,
        type: cause?.type,
        toast: cause?.toast
      } satisfies ErrorData & typeof shape.data
    }
  },
  transformer: superjson
})

export const router = t.router
export const procedure = t.procedure
