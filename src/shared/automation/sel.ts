import { z } from 'zod'

type SelDef = { input: z.ZodType }

const selectors = {
  label: {
    input: z.string()
  },
  testId: {
    input: z.string()
  },
  altText: {
    input: z.string()
  },
  title: {
    input: z.string()
  },
  placeholder: {
    input: z.string()
  },
  text: {
    input: z.string()
  },
  id: {
    input: z.string()
  },
  css: {
    input: z.string()
  },
  xpath: {
    input: z.string()
  }
} as const satisfies Record<string, SelDef>

type Selectors = typeof selectors
export type TSelectorType = keyof Selectors
type Def<K extends TSelectorType> = Selectors[K]

export type TSelectorInput<K extends TSelectorType> =
  Def<K> extends { input: infer S extends z.ZodType } ? z.infer<S> : undefined

type SelectorOf<K extends TSelectorType> = Extract<TSelector, { type: K }>

export type TSelector = {
  [K in TSelectorType]: { type: K; input: TSelectorInput<K> }
}[TSelectorType]

/* Wraps a raw selector  */
export const sel = Object.fromEntries(
  (Object.keys(selectors) as TSelectorType[]).map((type) => [
    type,
    (input: unknown) => ({ type, input })
  ])
) as { [K in TSelectorType]: (input: TSelectorInput<K>) => SelectorOf<K> }

// ***********

export const selectorTypes = Object.keys(selectors) as TSelectorType[]

export const ZSelectorEnvelope = z.object({
  type: z.enum(selectorTypes),
  input: z.string()
})

export function parseSelector(raw: unknown): TSelector {
  const parsed = ZSelectorEnvelope.parse(raw)
  return {
    type: parsed.type,
    input: parsed.input
  }
}
