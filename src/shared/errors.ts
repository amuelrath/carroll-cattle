// TODO REWRITE 95% OF THIS SHITE
interface ToastableErrorOptions<TContext = unknown> {
  /** String shown to the user as a toast message. */
  toast?: string
  /** The raw underlying error/exception, for logging/debugging (native Error.cause). */
  cause?: unknown
  /**  Any extra details supplied by the AppError */
  context?: TContext
}

export abstract class ToastableError<TContext = unknown> extends Error {
  abstract readonly type: string
  toast?: string
  readonly context?: TContext

  protected constructor(message: string, options?: ToastableErrorOptions<TContext>) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined)
    this.toast = options?.toast
    this.context = options?.context
  }
}

const APP_ERROR_TYPES = new Set<string>()

export function makeAppError<TContext = unknown>() {
  return <TType extends string>(type: TType) => {
    APP_ERROR_TYPES.add(type)

    return class extends ToastableError<TContext> {
      readonly type = type
      constructor(message: string, options?: ToastableErrorOptions<TContext>) {
        super(message, options)
        this.name = new.target.name
      }
    }
  }
}
export class NotFoundError extends makeAppError()('NOT_FOUND') {}
export class SheetError extends makeAppError()('SHEET') {}
export class ShellError extends makeAppError()('SHELL') {}
export class DialogError extends makeAppError()('DIALOG') {}
export class JobError extends makeAppError()('JOB') {}
export class DatabaseError extends makeAppError()('DATABASE') {}
export class AutomationError extends makeAppError()('AUTOMATION') {}
export class FlowError extends makeAppError()('FLOW') {}
export type AppError =
  | NotFoundError
  | DatabaseError
  | SheetError
  | ShellError
  | DialogError
  | JobError
  | AutomationError
  | FlowError

export function isAppError(err: unknown): err is AppError {
  return err instanceof ToastableError && APP_ERROR_TYPES.has(err.type)
}

type ContextOf<T> = T extends ToastableError<infer C> ? C : never

type AppErrorConstructor<T extends AppError> = new (
  message: string,
  options?: ToastableErrorOptions<ContextOf<T>>
) => T

export function toAppError<T extends AppError>(
  err: unknown,
  ErrorClass: AppErrorConstructor<T>,
  context?: ContextOf<T>
): T {
  if (err instanceof ErrorClass) return err
  return new ErrorClass(err instanceof Error ? err.message : String(err), {
    cause: err,
    toast: err instanceof ToastableError ? err.toast : undefined,
    context
  })
}
