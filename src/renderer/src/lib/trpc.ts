import type { AppRouter } from '@main/trpc'
import { toast } from '@renderer/components/ui/toast'
import { errors } from '@shared/resources/strings'
import { TRPCLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { observable } from '@trpc/server/observable'
import superjson from 'superjson'
import { ipcLink } from 'trpc-electron/renderer'

const toastLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      return next(op).subscribe({
        next(value) {
          observer.next(value)
        },
        error(err) {
          toast.add({
            type: err.data?.toast?.type ?? 'error',
            title: err.data?.toast?.title ?? 'Unexpected Error',
            description: err.data?.toast?.description ?? errors.unknown
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

const links: TRPCLink<AppRouter>[] = [toastLink, ipcLink({ transformer: superjson })]

export const trpc = createTRPCReact<AppRouter>()
export const trpcClient = trpc.createClient({
  links
})
