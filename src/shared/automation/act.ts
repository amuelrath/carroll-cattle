import type { Flow } from '@main/automation/types'
import { parseSelector, type TSelector } from '@shared/automation/sel'
import { z } from 'zod'

export type ActionDef = { target: boolean; input?: z.ZodType; output: z.ZodType }

export const actions = {
  goto: {
    target: false,
    input: z.url(),
    output: z.void()
  },
  fill: {
    target: true,
    input: z.string(),
    output: z.void()
  },
  check: {
    target: true,
    output: z.void()
  },
  uncheck: {
    target: true,
    output: z.void()
  },
  click: {
    target: true,
    output: z.void()
  },
  select: {
    target: true,
    input: z.string(),
    output: z.void()
  },
  getText: {
    target: true,
    output: z.string().nullable()
  },
  screenshot: {
    target: true,
    output: z.base64()
  },
  extractTable: {
    target: true,
    output: z.array(z.record(z.string(), z.unknown()))
  },
  waitForVisible: {
    target: true,
    output: z.void()
  },
  waitForText: {
    target: true,
    input: z.string(),
    output: z.void()
  },
  getIsVisible: {
    target: true,
    output: z.boolean()
  },
  getUrl: {
    target: false,
    output: z.string()
  }
} as const satisfies Record<string, ActionDef>

type Actions = typeof actions
export type TActionType = keyof Actions

export type TActionInput<K extends TActionType> =
  Actions[K] extends (
    {
      input: infer S extends z.ZodType
    }
  ) ?
    z.infer<S>
  : undefined

export type TActionOutput<K extends TActionType> = z.infer<Actions[K]['output']>

/* If an action def has ``{ target: true }``,
 * its request-form has ``{ target: TSelector | TSelector[] }`` */
type HasTargetIn<K extends TActionType> =
  Actions[K]['target'] extends true ? [target: TSelector | TSelector[]] : []

/* If an action def has ``{ target: true }``,
 * its execution-form has ``{ target:  TSelector[] }`` */
type HasTargetOut<K extends TActionType> =
  Actions[K]['target'] extends true ? TSelector[] : undefined

/* The final args  ``{ target?, input? }`` for the request-form */
type Args<K extends TActionType> = [
  // !! Order Matters !!
  ...HasTargetIn<K>,
  ...(Actions[K] extends { input: z.ZodType } ? [input: TActionInput<K>] : [])
]

/* Request-form type */
export type TAction = { type: TActionType; target?: TSelector[]; input?: unknown }

export type ActionOf<K extends TActionType> =
  K extends K ?
    {
      type: K
      target: HasTargetOut<K>
      input: TActionInput<K>
    }
  : never

export type AnyAction = ActionOf<TActionType>

function* makeAct<K extends TActionType>(action: TAction): Flow<TActionOutput<K>> {
  return (yield { kind: 'dispatch', action }) as TActionOutput<K>
}

const toArray = (s: TSelector | TSelector[]) => (Array.isArray(s) ? s : [s])

// what gets called in a flow and crosses wire
export const act = Object.fromEntries(
  (Object.keys(actions) as TActionType[]).map((type) => [
    type,
    (...args: never[]) => {
      const hasTarget = actions[type].target
      return makeAct({
        type,
        // first argument should be the selector if applicable
        target: hasTarget ? toArray(args[0]) : undefined,
        // second argument is the input if a selector exists, else it is the first
        input: hasTarget ? args[1] : args[0]
      })
    }
  ])
) as { [K in TActionType]: (...args: Args<K>) => Flow<TActionOutput<K>> }

// ***********

export const actionTypes = Object.keys(actions) as TActionType[]

const ZActionEnvelope = z.object({
  type: z.enum(actionTypes),
  input: z.unknown(),
  target: z.array(z.unknown()).min(1).optional()
} satisfies Record<keyof TAction, z.ZodType>)

export function parseAction(raw: unknown): AnyAction {
  const parsed = ZActionEnvelope.parse(raw)
  const def: ActionDef = actions[parsed.type]

  if (def.target !== Boolean(parsed.target)) {
    throw new Error(`${parsed.type}: target ${def.target ? 'required' : 'not allowed'}`)
  }

  return {
    type: parsed.type,
    target: parsed.target?.map(parseSelector),
    input: def.input ? def.input.parse(parsed.input) : undefined
  } as AnyAction
}
