import { z } from 'zod'

type SelDef = { input: z.ZodType; options?: z.ZodOptional }

const selectors = {
  role: {
    input: z.enum([
      'alert',
      'alertdialog',
      'application',
      'article',
      'banner',
      'blockquote',
      'button',
      'caption',
      'cell',
      'checkbox',
      'code',
      'columnheader',
      'combobox',
      'complementary',
      'contentinfo',
      'definition',
      'deletion',
      'dialog',
      'directory',
      'document',
      'emphasis',
      'feed',
      'figure',
      'form',
      'generic',
      'grid',
      'gridcell',
      'group',
      'heading',
      'img',
      'insertion',
      'link',
      'list',
      'listbox',
      'listitem',
      'log',
      'main',
      'marquee',
      'math',
      'meter',
      'menu',
      'menubar',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'navigation',
      'none',
      'note',
      'option',
      'paragraph',
      'presentation',
      'progressbar',
      'radio',
      'radiogroup',
      'region',
      'row',
      'rowgroup',
      'rowheader',
      'scrollbar',
      'search',
      'searchbox',
      'separator',
      'slider',
      'spinbutton',
      'status',
      'strong',
      'subscript',
      'superscript',
      'switch',
      'tab',
      'table',
      'tablist',
      'tabpanel',
      'term',
      'textbox',
      'time',
      'timer',
      'toolbar',
      'tooltip',
      'tree',
      'treegrid',
      'treeitem'
    ]),
    options: z
      .strictObject({
        hasText: z.string().optional(),
        exact: z.boolean().optional(),
        name: z.string().optional()
      })
      .optional()
  },
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

export type TSelectorOptions<K extends TSelectorType> =
  Def<K> extends { options: infer S extends z.ZodOptional } ? z.infer<S> : undefined

type SelectorOf<K extends TSelectorType> = Extract<TSelector, { type: K }>

export type TSelector = {
  [K in TSelectorType]: { type: K; input: TSelectorInput<K>; options?: TSelectorOptions<K> }
}[TSelectorType]

/* Wraps a raw selector  */
export const sel = Object.fromEntries(
  (Object.keys(selectors) as TSelectorType[]).map((type) => [
    type,
    (input: unknown, options?: unknown) => ({ type, input, options })
  ])
) as {
  [K in TSelectorType]: (input: TSelectorInput<K>, options?: TSelectorOptions<K>) => SelectorOf<K>
}

// ***********

export const selectorTypes = Object.keys(selectors) as TSelectorType[]

export const ZSelectorEnvelope = z.object({
  type: z.enum(selectorTypes),
  input: z.string(),
  options: z.unknown().optional()
})

export function parseSelector(raw: unknown): TSelector {
  const parsed = ZSelectorEnvelope.parse(raw)
  const def: SelDef = selectors[parsed.type]

  if (!def.options && parsed.options !== undefined) {
    throw new Error(`${parsed.type}: options not allowed`)
  }

  return {
    type: parsed.type,
    input: def.input.parse(parsed.input),
    options: def.options ? def.options.parse(parsed.options) : undefined
  } as TSelector
}
