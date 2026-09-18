import type { AppRouter } from '@main/trpc'
import { toast } from '@renderer/components/ui/toast'
import logger from '@renderer/lib/logger'
import { errors } from '@shared/resources/strings'
import { TRPCLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { observable } from '@trpc/server/observable'
import superjson from 'superjson'
import { ipcLink } from 'trpc-electron/renderer'

const responseLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    const source = op.path.split('.').pop() // "importSheet"
    return observable((observer) => {
      return next(op).subscribe({
        next(value) {
          observer.next(value)
        },
        error(err) {
          toast.add({
            type: 'error',
            description: err.data?.toast ?? errors.unknown
          })

          logger.error({
            process: '[main]',
            call: `[${source}]`,
            type: err.data?.type,
            params: JSON.stringify(op.input),
            message: err.message,
            cause: err.cause,
            stack: err.stack
          })
          observer.error(err)
        },
        complete() {
          observer.complete()
        }
      })
    })
  }
}

export const trpc = createTRPCReact<AppRouter>()
export const trpcClient = trpc.createClient({
  links: [responseLink, ipcLink({ transformer: superjson })]
})
