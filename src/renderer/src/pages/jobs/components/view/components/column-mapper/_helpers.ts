import { normalize } from '@shared/lib/strings'
import type { TRecord } from '@shared/schemas/helper.schemas'
import { UNUSED } from '@shared/schemas/trpc'
import { findBestMatch } from 'string-similarity'
import { z } from 'zod'

export type ColumnMap = Record<string, string>

export const getSheetKeys = (rows: TRecord[] | undefined): string[] => {
  if (!rows) return []
  return [...new Set(rows.flatMap((row) => Object.keys(row)))]
}

export const emptyValueFor = (target: string, required: string[]): string => {
  return required.includes(target) ? '' : UNUSED
}

export function assignColumn(
  map: ColumnMap,
  target: string,
  sheetKey: string,
  required: string[]
): ColumnMap {
  const next = { ...map }
  if (sheetKey !== UNUSED) {
    for (const [t, s] of Object.entries(next)) {
      if (t !== target && s === sheetKey) next[t] = emptyValueFor(t, required)
    }
  }
  next[target] = sheetKey
  return next
}

export function suggestMapping(
  targets: string[],
  sheetKeys: string[],
  required: string[],
  threshold = 0.6
) {
  const map: ColumnMap = {}
  const suggested = new Set<string>()
  const used = new Set<string>()
  for (const t of targets) {
    const available = sheetKeys.filter((s) => !used.has(s))
    if (available.length === 0) {
      map[t] = emptyValueFor(t, required)
      continue
    }
    const { bestMatch, bestMatchIndex } = findBestMatch(normalize(t), available.map(normalize))
    if (bestMatch.rating >= threshold) {
      const original = available[bestMatchIndex]
      map[t] = original
      used.add(original)
      suggested.add(t)
    } else {
      map[t] = emptyValueFor(t, required)
    }
  }
  return { map, suggested }
}

export function buildMappingSchema(targets: string[], required: string[]) {
  return z.record(z.enum(targets), z.string()).superRefine((val, ctx) => {
    for (const k of required) {
      if (!val[k] || val[k] === UNUSED)
        ctx.addIssue({ code: 'custom', path: [k], message: `"${k}" must be mapped to a column` })
    }
    const assigned = Object.values(val).filter((v) => v && v !== UNUSED)
    if (new Set(assigned).size !== assigned.length)
      ctx.addIssue({ code: 'custom', path: ['root'], message: 'Each column can only be used once' })
  })
}
