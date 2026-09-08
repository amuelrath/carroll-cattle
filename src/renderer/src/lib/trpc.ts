import type { AppRouter } from '@main/trpc'
import { errors } from '@shared/resources/strings'
import { createTRPCProxyClient, TRPCLink } from '@trpc/client'
import { observable } from '@trpc/server/observable'
import log from 'electron-log/renderer'
import { ipcLink } from 'trpc-electron/renderer'
import { toast } from '../components/ui/toast'
import { navigate } from './nav-ref'

const responseLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      return next(op).subscribe({
        next(value) {
          // eslint-disable-next-line
          const res = value.result.data as any
          if (res?.redirect) navigate(res.redirect)
          if (res?.toast) {
            toast.add({
              type: res.toast.type,
              description: res.toast.message
            })
          }
          observer.next(value)
        },
        error(err) {
          toast.add({
            type: err.data?.toast?.type ?? 'error',
            description: err.data?.toast?.message ?? errors.unknown
          })
          if (err.data?.toast) {
            log.error(err.message, err.data?.causeMessage ?? err.cause)
          }
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
