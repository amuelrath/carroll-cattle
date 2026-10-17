import logger from '@main/logger'
import { causeChain } from '@main/trpc/cause-chain'
import { type AppError, type ErrorToast, isAppError } from '@shared/errors'
import { initTRPC } from '@trpc/server'
import { performance } from 'node:perf_hooks'
import superjson from 'superjson'
import type { Context } from './context'

function findTypedArrays(v: unknown, path = '$', seen = new WeakSet()): string[] {
  if (v === null || typeof v !== 'object') return []
  if (ArrayBuffer.isView(v)) return [`${path} (${v.constructor.name})`]
  if (seen.has(v)) return []
  seen.add(v)
  return Object.entries(v).flatMap(([k, x]) => findTypedArrays(x, `${path}.${k}`, seen))
}

// e.g. in the middleware after `const result = await next()`:

interface ErrorData {
  type?: AppError['type']
  toast?: ErrorToast
  cause?: unknown
}

const debugTransformer = {
  input: superjson,
  output: {
    serialize: (value: unknown) => {
      const hits = findTypedArrays(value)
      if (hits.length) console.warn('[trpc] typed arrays in outbound payload:', hits)
      return superjson.serialize(value)
    },
    deserialize: superjson.deserialize
  }
}

const t = initTRPC.context<Context>().create({
  // gets forwarded to any onError
  // go to responseLink() to shape the logs
  errorFormatter({ shape, error }) {
    const cause = error.cause && isAppError(error.cause) ? error.cause : undefined
    return {
      ...shape,
      data: {
        ...shape.data,
        type: cause?.type,
        toast: cause?.toast,
        cause: error.cause
      } satisfies ErrorData & typeof shape.data
    }
  },
  transformer: debugTransformer
})

const logged = t.middleware(async ({ path, input, next }) => {
  const requestId = crypto.randomUUID()
  const start = performance.now()

  const result = await next({ ctx: { requestId } })

  if (result.ok) {
    const hits = findTypedArrays(result.data)
    if (hits.length) console.warn(path, hits)
  }

  if (!result.ok) {
    logger.error({
      message:
        isAppError(result.error.cause) ? result.error.message
        : Error.isError(result.error) ? result.error.message
        : 'Unknown',
      requestId,
      path,
      durationMs: Math.round(performance.now() - start),
      input,
      errorType: isAppError(result.error.cause) ? result.error.cause : 'UNEXPECTED',
      cause: causeChain(result.error.cause)
    })
  }
  return result
})

export const router = t.router
export const procedure = t.procedure.use(logged)
