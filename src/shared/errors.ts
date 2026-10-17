export type ErrorToast = { type: 'warning' | 'error' | 'info'; title: string; description: string }

export interface AppErrorOptions {
  toast?: ErrorToast
  cause?: unknown
}

export abstract class BaseAppError extends Error {
  abstract readonly type: string
  readonly toast?: ErrorToast

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = new.target.name
    this.toast = options.toast
  }
}

export class NotFoundError extends BaseAppError {
  readonly type = 'NOT_FOUND' as const
}

export class NotAllowedError extends BaseAppError {
  readonly type = 'NOT_ALLOWED' as const
}

export class DatabaseError extends BaseAppError {
  readonly type = 'DATABASE' as const
}

export class AutomationError extends BaseAppError {
  readonly type = 'AUTOMATION' as const
}

export class ParseError extends BaseAppError {
  readonly type = 'PARSE' as const
}

export class UnknownError extends BaseAppError {
  readonly type = 'UNKNOWN' as const
}

export type AppError =
  NotFoundError | NotAllowedError | DatabaseError | AutomationError | ParseError | UnknownError

export function isAppError(err: unknown): err is AppError {
  return err instanceof BaseAppError
}
