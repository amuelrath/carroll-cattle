import { createTRPCProxyClient, TRPCClientError, TRPCLink } from '@trpc/client'
import type { AppRouter } from '@main/trpc'
import { ipcLink } from 'trpc-electron/renderer'
import { navigate } from './nav-ref'
import { toast } from '../components/ui/toast'
import { observable } from '@trpc/server/observable'
import { errors } from '@shared/resources/strings'

const responseLink: TRPCLink<AppRouter> = () => {
  // everything in this section happens once during app initialization
  // useful for cache storage - docs
  return ({ next, op }) => {
    return observable((observer) => {
      return next(op).subscribe({
        next(value) {
          // middleware here
          const res = value.result.data as any
          if (res?.redirect) navigate(res.redirect)
          if (res?.toast) {
            toast.add({
              type: res.toast.type,
              description: res.toast.message
            })
          }
          if (res?.status === 'error') {
            observer.error(new TRPCClientError(res.message))
            return
          }
          observer.next(value)
        },
        error(err) {
          toast.add({
            type: 'error',
            description: errors.unknown
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

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [responseLink, ipcLink()]
})
