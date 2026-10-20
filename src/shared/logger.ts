import { type LogFunctions } from 'electron-log'

interface BaseLogArguments {
  message: string
}

interface BaseLogErrorArguments extends BaseLogArguments {
  cause: unknown
  stack?: string
}

interface ClientLogErrorArguments extends BaseLogErrorArguments {
  process: '[render]'
  route: string | 'CAUGHT_BY_ROOT_BOUNDARY'
  search?: string
}

interface MainLogErrorArguments extends BaseLogErrorArguments {
  requestId: string
  path: string
  durationMs: number
  input: unknown
  errorType: unknown
}

type LogErrorArguments = ClientLogErrorArguments | MainLogErrorArguments

type TypedLogFn<T> = (args: T) => void

export interface TypedLogger {
  error: TypedLogFn<LogErrorArguments>
  warn: TypedLogFn<BaseLogArguments>
  info: TypedLogFn<BaseLogArguments>
  verbose: TypedLogFn<BaseLogArguments>
  debug: TypedLogFn<BaseLogArguments>
  silly: TypedLogFn<BaseLogArguments>
  log: TypedLogFn<BaseLogArguments>
}

export function createTypedLogger(log: LogFunctions): TypedLogger {
  return {
    error: (args) => log.error(args),
    warn: (args) => log.warn(args),
    info: (args) => log.info(args),
    verbose: (args) => log.verbose(args),
    debug: (args) => log.debug(args),
    silly: (args) => log.silly(args),
    log: (args) => log.log(args)
  }
}
