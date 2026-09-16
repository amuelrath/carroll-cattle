interface ToastableErrorOptions {
  /** String shown to the user as a toast message. */
  toast?: string
  /** The raw underlying error/exception, for logging/debugging (native Error.cause). */
  cause?: unknown
}

export abstract class ToastableError extends Error {
  abstract readonly type: string
  toast?: string

  protected constructor(message: string, options?: ToastableErrorOptions) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined)
    this.toast = options?.toast
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
export class NotFoundError extends ToastableError {
  readonly type = 'NOT_FOUND' as const
  constructor(message: string, options?: ToastableErrorOptions) {
    super(message, options)
    this.name = 'NotFoundError'
  }
}

export class SheetError extends ToastableError {
  readonly type = 'SHEET' as const
  issues?: unknown
  constructor(message: string, options?: ToastableErrorOptions & { issues?: unknown }) {
    super(message, options)
    this.issues = options?.issues
    this.name = 'SheetError'
  }
}

export class ShellError extends ToastableError {
  readonly type = 'SHELL' as const
  constructor(message: string, options?: ToastableErrorOptions) {
    super(message, options)
    this.name = 'ShellError'
  }
}

export class DialogError extends ToastableError {
  readonly type = 'DIALOG' as const
  constructor(message: string, options?: ToastableErrorOptions) {
    super(message, options)
    this.name = 'DialogError'
  }
}

export class JobError extends ToastableError {
  readonly type = 'JOB' as const
  constructor(message: string, options?: ToastableErrorOptions) {
    super(message, options)
    this.name = 'JobError'
  }
}

export class DatabaseError extends ToastableError {
  readonly type = 'DATABASE' as const
  constructor(message: string, options?: ToastableErrorOptions) {
    super(message, options)
    this.name = 'DatabaseError'
  }
}

export type AppError =
  NotFoundError | DatabaseError | SheetError | ShellError | DialogError | JobError

const APP_ERROR_TYPES: Set<string> = new Set([
  'NOT_FOUND',
  'DATABASE',
  'SHEET',
  'SHELL',
  'DIALOG',
  'JOB'
] satisfies AppError['type'][])

export function isAppError(err: unknown): err is AppError {
  return err instanceof ToastableError && APP_ERROR_TYPES.has(err.type)
}

type AppErrorConstructor<T extends AppError> = new (
  message: string,
  options?: ToastableErrorOptions
) => T

export function toAppError<T extends AppError>(
  err: unknown,
  ErrorClass: AppErrorConstructor<T>
): T {
  return err instanceof ErrorClass
    ? err
    : new ErrorClass((err as Error)?.message ?? String(err), { cause: err })
}
