import type { Directive, TAction, TActionOutput, TActionType } from '@shared/automation'
import type { ActionOf } from '@shared/automation/act'
import type { RowIssue } from '@shared/automation/errors'
import type { TFileRow, TProcessId } from '@shared/schemas/jobs'

export type Flow<R = void> = Generator<Directive, R, unknown>

type Requester = <K extends TActionType>(action: ActionOf<K> | TAction) => Promise<TActionOutput<K>>

export interface Handlers {
  request: Requester
  onNarration: (narr: string) => Promise<void>
  /* fires when new row is about to be processed */
  onStart: (idx: number) => Promise<void>
  /* screenshot is base64 png */
  onCommit: (idx: number, screenshot: string, url: string) => Promise<void>
  /* screenshot is base64 png */
  onIssue: (idx: number, issue: RowIssue, screenshot: string, url: string) => Promise<void>
  onWarn: (warning: string) => Promise<void>
  signal: AbortSignal
}

// Authed is out recovery point.
export interface RowFlow<Row> {
  /** Runs once. Failure here is fatal (e.g. login). */
  setup: () => Flow
  /** Runs per row. Throwing = this row gets an issue, runner moves on. */
  row: (row: Row, idx: number) => Flow<{ screenshot: string }>
  /** Runs after a failed row to get the page back to a known state. */
  recover?: () => Flow
}
