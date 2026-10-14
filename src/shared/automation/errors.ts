import type { TSelector } from '@shared/automation/sel'
import type { TWorkerErrorResponse } from '@shared/schemas/protocol.schemas'
import { errors } from 'playwright'

export class AbortedError extends Error {}

export type RowIssueCode = 'NOT_FOUND' | 'WARN' | 'REVIEW' | 'INTERNAL' | 'MISSING_DATA'
export class RowIssue extends Error {
  constructor(
    public code: RowIssueCode,
    public message: string,
    public target?: TSelector[]
  ) {
    super(message)
    this.code = code
    this.target = target
  }
}

/* for reconstructing errors from across the wire */
export function rehydrateError(res: TWorkerErrorResponse) {
  switch (res.errorType) {
    case 'timeout':
      // WatchMe: Is this right/ok? There is no "stack" property on TimeoutError
      return new errors.TimeoutError(res.message, { cause: res.stack })
    case 'unknown':
      return new Error(res.message, { cause: res.stack })
    default:
      throw new Error(`Impossible case ${res.errorType satisfies never}`)
  }
}
