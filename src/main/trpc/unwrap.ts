import type { AppError } from '@shared/errors'
import { TRPCError } from '@trpc/server'
import { Result, type ResultAsync } from 'neverthrow'

const CODE_MAP = {
  NOT_FOUND: 'NOT_FOUND',
  SHELL: 'BAD_REQUEST',
  DATABASE: 'INTERNAL_SERVER_ERROR',
  SHEET: 'INTERNAL_SERVER_ERROR',
  JOB: 'INTERNAL_SERVER_ERROR',
  DIALOG: 'UNPROCESSABLE_CONTENT',
  AUTOMATION: 'INTERNAL_SERVER_ERROR',
  FLOW: 'INTERNAL_SERVER_ERROR'
} satisfies Record<AppError['type'], TRPCError['code']>

export async function unwrap<T>(
  result: ResultAsync<T, AppError> | Result<T, AppError>
): Promise<T> {
  const r = await result
  if (r.isErr()) {
    throw new TRPCError({
      code: CODE_MAP[r.error.type],
      message: r.error.message,
      cause: r.error
    })
  }
  return r.value
}
