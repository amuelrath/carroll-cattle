import type { TAction } from '@shared/automation/act'

/* Send an action to the utility */
export type DispatchDirective = {
  kind: 'dispatch'
  action: TAction
}

/* Emit some text to the renderer */
export type NarrateDirective = {
  kind: 'narrate'
  narration: string
}

export type WarnDirective = {
  kind: 'warn'
  warning: string
}

/* What gets handed to the flow runner  */
export type Directive = DispatchDirective | NarrateDirective | WarnDirective

export function narr(narration: string): NarrateDirective {
  return { kind: 'narrate', narration }
}

export function warn(warning: string): WarnDirective {
  return { kind: 'warn', warning }
}
