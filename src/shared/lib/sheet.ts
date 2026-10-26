import { getIssueDetails } from '@shared/lib/get-issue-details'
import type { TRecord } from '@shared/schemas/helper.schemas'
import type { TCellEdit, TCellError, TColumn, TSheetRowIn } from '@shared/schemas/trpc'
import type { TTaskWithRelationsIn } from '@shared/schemas/trpc/task.schemas'
import { utils, writeFile } from 'xlsx'
import { z } from 'zod'

export function nonOptionalKeys<T extends z.core.$ZodShape>(schema: z.ZodObject<T>) {
  const shape = schema._zod.def.shape
  return (Object.keys(shape) as (keyof T & string)[]).filter(
    (key) => shape[key]._zod.optin !== 'optional'
  )
}

export function getColumns(columnMap: Record<string, string>, schema: z.ZodObject): TColumn[] {
  const targetKeys = Object.keys(columnMap)
  const requiredKeys = nonOptionalKeys(schema)

  return targetKeys.map((key) => ({
    key,
    source: columnMap[key],
    required: requiredKeys.includes(key)
  }))
}

/* Must be in the same key space. Will not error if we aren't.  */ export function getCellEdits(
  before: TRecord,
  after: TRecord
): TCellEdit[] {
  const normalize = (value: unknown): string | null => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  const read = (row: TRecord, key: string) => (Object.hasOwn(row, key) ? row[key] : undefined)

  const changes: TCellEdit[] = []
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of keys) {
    const from = normalize(read(before, key))
    const to = normalize(read(after, key))
    if (from !== to) changes.push({ key, from, to })
  }
  return changes
}

export function getCellErrors(
  row: TRecord,
  schema: z.ZodObject,
  columnMap: Record<string, string>
): TCellError[] {
  // project the row
  const projected = projectRow(row, columnMap, { inverse: false })

  const res = schema.safeParse(projected)
  if (res.success) return []

  return res.error.issues.map((issue) => {
    const unmappedKey = issue.path[0] as keyof typeof row
    const key = columnMap[unmappedKey]
    const hint = getIssueDetails(issue)
    return { key, hint }
  })
}

export function projectRow(
  row: TRecord,
  columnMap: Record<string, string>,
  { inverse = false }: { inverse?: boolean }
) {
  if (!inverse) {
    // When we send to the server, we want data in mapped terms
    // Row in Original Terms -> Mapped Terms
    const reverseMap = Object.fromEntries(
      Object.entries(columnMap).map(([newKey, oldKey]) => [oldKey, newKey])
    )

    return Object.fromEntries(
      Object.entries(row).map(([oldKey, value]) => {
        const newKey = reverseMap[oldKey]
        return [newKey, value]
      })
    )
  } else {
    // Row in Mapped Terms -> Original Terms
    return Object.fromEntries(
      Object.entries(row).map(([newKey, value]) => {
        const oldKey = columnMap[newKey]
        return [oldKey, value]
      })
    )
  }
}

export function getSheetRow(
  task: TTaskWithRelationsIn,
  schema: z.ZodObject,
  columnMap: Record<string, string>
): TSheetRowIn {
  const {
    id: taskId,
    rowIdx,
    status,
    issue,
    proof,
    row: { copyRow, originalRow }
  } = task

  const base = {
    rowIdx,
    taskId,
    copyRow,
    edits: getCellEdits(originalRow, copyRow),
    errors: getCellErrors(copyRow, schema, columnMap)
  }

  if (status === 'done') {
    if (!proof) throw new Error(`No proof for completed task (${taskId}).`)
    return {
      ...base,
      state: 'done',
      proof: { completedAt: proof.createdAt, screenshot: proof.image, url: proof.url }
    }
  }

  if (base.errors.length > 0) {
    return { ...base, state: 'invalid' }
  }

  if (issue) {
    const editsSince = getCellEdits(issue.rowSnapshot, copyRow)
    return {
      ...base,
      state: editsSince.length > 0 ? 'issueFixed' : 'issue',
      issue: {
        editsSince,
        screenshot: issue.image,
        hint: issue.hint,
        url: issue.url
      }
    }
  }

  return { ...base, state: 'ready' }
}

export function sheetToJson(rows: TRecord[], title: string) {
  const ws = utils.json_to_sheet(rows)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Sheet1')

  return writeFile(wb, `${title}.xlsx`)
}
