import { isAppError } from '@shared/errors'

type CauseEntry = { type?: string; name?: string; message: string; stack?: string }

export function causeChain(err: unknown, maxDepth = 10): CauseEntry[] {
  const out: CauseEntry[] = []
  let cur: unknown = err

  while (cur !== undefined && out.length < maxDepth) {
    if (cur instanceof Error) {
      out.push({
        type: isAppError(cur) ? cur.type : undefined,
        name: cur.name,
        message: cur.message,
        stack: cur.stack
      })
      cur = cur.cause
    } else {
      // non-Error throwable (string, plain object): record it and stop
      out.push({ message: typeof cur === 'string' ? cur : JSON.stringify(cur) })
      break
    }
  }
  return out
}
