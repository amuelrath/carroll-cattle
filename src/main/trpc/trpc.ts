import { type AppError, isAppError, ToastableError } from '@shared/errors'
import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'

interface ErrorData {
  type?: AppError['type']
  toast?: string
  causes?: unknown
}

type CauseEntry = { name: string; message: string; stack?: string; context?: unknown }
export function causeChain(err: unknown): CauseEntry[] {
  const out: CauseEntry[] = []
  let cur = err
  while (cur instanceof Error && out.length < 10) {
    out.push({
      name: cur.name,
      message: cur.message,
      // stack: cur.stack,
      context: cur instanceof ToastableError ? cur.context : undefined
    })
    cur = cur.cause
  }
  return out
}

const t = initTRPC.context<Context>().create({
  // gets forwarded to any onError
  // go to responseLink() to shape the logs
  errorFormatter({ shape, error }) {
    const cause =
      error.cause instanceof ToastableError && isAppError(error.cause) ? error.cause : undefined
    return {
      ...shape,
      data: {
        ...shape.data,
        type: cause?.type,
        toast: cause?.toast,
        causes: causeChain(error.cause)
      } satisfies ErrorData & typeof shape.data
    }
  },
  transformer: superjson
})

export const router = t.router
export const procedure = t.procedure
