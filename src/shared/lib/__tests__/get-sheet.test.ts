import { ZSelectTaskIssue, ZSelectTaskProof } from '@shared/db/schema'
import { getCellEdits, getSheetRow } from '@shared/lib/sheet'
import { ZTaskWithRelations } from '@shared/schemas/trpc/task.schemas'
import { fuzz } from '@traversable/zod-test'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

const PassSchema = z.looseObject({}) // nothing required → no errors
const FailSchema = z.looseObject({ __mustExist: z.string().min(1) })
const failColumnMap = { __mustExist: 'Must Exist' }

const ZTask = ZTaskWithRelations.extend({
  proof: ZSelectTaskProof.extend({ image: z.base64() }).nullable(),
  issue: ZSelectTaskIssue.extend({ image: z.base64() }).nullable()
})

const TaskArb = fuzz(ZTask)

const doneTask = TaskArb.map((t) => ({ ...t, status: 'done' as const }))
const notDoneTask = TaskArb.filter((t) => t.status !== 'done')

// Biased toward "snapshot equals current row" so both issue states actually get generated
const withIssue = notDoneTask
  .filter((t) => t.issue !== null)
  .chain((t) =>
    fc.oneof(
      fc.constant({ ...t, issue: { ...t.issue!, rowSnapshot: t.row.copyRow } }),
      fc.constant(t)
    )
  )

describe('getSheetRow', () => {
  it('always carries through the base fields', () => {
    fc.assert(
      fc.property(
        TaskArb.filter((t) => t.status !== 'done' || t.proof !== null),
        (t) => {
          const r = getSheetRow(t, PassSchema, {})
          expect(r.rowIdx).toBe(t.rowIdx)
          expect(r.taskId).toBe(t.id)
          expect(r.copyRow).toBe(t.row.copyRow)
        }
      )
    )
  })

  it('done + proof → done, with proof mapped', () => {
    fc.assert(
      fc.property(
        doneTask.filter((t) => t.proof !== null),
        (t) => {
          const r = getSheetRow(t, PassSchema, {})
          expect(r.state).toBe('done')
          expect(r).toMatchObject({
            proof: {
              completedAt: t.proof!.createdAt,
              screenshot: t.proof!.image,
              url: t.proof!.url
            }
          })
        }
      )
    )
  })

  it('done without proof throws', () => {
    fc.assert(
      fc.property(
        doneTask.map((t) => ({ ...t, proof: null })),
        (t) => {
          expect(() => getSheetRow(t, PassSchema, {})).toThrow(/No proof/)
        }
      )
    )
  })

  it('done wins over validation errors', () => {
    fc.assert(
      fc.property(
        doneTask.filter((t) => t.proof !== null),
        (t) => {
          expect(getSheetRow(t, FailSchema, failColumnMap).state).toBe('done')
        }
      )
    )
  })

  it('errors → invalid, even when there is an issue', () => {
    fc.assert(
      fc.property(notDoneTask, (t) => {
        expect(getSheetRow(t, FailSchema, failColumnMap).state).toBe('invalid')
      })
    )
  })

  it('issue → issue / issueFixed depending on edits since snapshot', () => {
    fc.assert(
      fc.property(withIssue, (t) => {
        const r = getSheetRow(t, PassSchema, {})
        const editsSince = getCellEdits(t.issue!.rowSnapshot, t.row.copyRow)
        expect(r.state).toBe(editsSince.length > 0 ? 'issueFixed' : 'issue')
        expect(r).toMatchObject({
          issue: { editsSince, screenshot: t.issue!.image, hint: t.issue!.hint, url: t.issue!.url }
        })
      })
    )
  })

  it('snapshot identical to current row → issue (not fixed)', () => {
    fc.assert(
      fc.property(
        notDoneTask.filter((t) => t.issue !== null),
        (t) => {
          const task = { ...t, issue: { ...t.issue!, rowSnapshot: t.row.copyRow } }
          expect(getSheetRow(task, PassSchema, {}).state).toBe('issue')
        }
      )
    )
  })

  it('no issue, no errors, not done → ready', () => {
    fc.assert(
      fc.property(
        notDoneTask.map((t) => ({ ...t, issue: null })),
        (t) => {
          expect(getSheetRow(t, PassSchema, {}).state).toBe('ready')
        }
      )
    )
  })
})
