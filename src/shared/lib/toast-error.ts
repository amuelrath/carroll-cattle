import { TRPCError } from '@trpc/server'

export type ToastPayload = { type: 'info' | 'error' | 'success'; message: string }

export class ToastableTRPCError extends TRPCError {
  toast?: ToastPayload

  constructor(opts: {
    message: string
    toast?: ToastPayload
    cause?: unknown
    code?: TRPCError['code']
  }) {
    super({
      code: opts.code ?? 'INTERNAL_SERVER_ERROR',
      message: opts.message,
      cause: opts.cause instanceof Error ? opts.cause : new Error(String(opts.cause))
    })
    this.toast = opts.toast
  }
}

export function toastError(opts: {
  message: string
  toast?: ToastPayload
  cause?: unknown
  code?: TRPCError['code']
}): never {
  throw new ToastableTRPCError(opts)
}
