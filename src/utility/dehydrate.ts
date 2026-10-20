/* for sending an error to PlaywrightRPC */
import type { TWorkerErrorResponse } from '@shared/schemas/protocol.schemas'
import { errors } from 'playwright'

type DehydrateError = ({
  id,
  err,
  screenshot
}: {
  id: number
  err: unknown
  /* base64 encoded png */
  screenshot: string
}) => TWorkerErrorResponse

export const dehydrateError: DehydrateError = ({ id, err, screenshot }) => {
  if (err instanceof errors.TimeoutError) {
    const { message, stack } = err
    return { kind: 'error', id, errorType: 'timeout', message, stack, screenshot }
  }
  if (err instanceof Error) {
    const { message, stack } = err
    return { kind: 'error', id, errorType: 'unknown', message, stack, screenshot }
  }

  if (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string') {
    const { message } = err
    return { kind: 'error', id, errorType: 'unknown', message }
  }

  return { kind: 'error', id, errorType: 'unknown', message: String(err) }
}
