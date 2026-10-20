import { ZSelectFileRow, ZSelectTask, ZSelectTaskIssue, ZSelectTaskProof } from '@shared/db/schema'
import { z } from 'zod'

export const ZReadIncompleteRes = z.array(
  ZSelectTask.extend({
    row: ZSelectFileRow
  })
)
export type TReadIncompleteRes = z.infer<typeof ZReadIncompleteRes>

export const ZTaskWithRelations = ZSelectTask.extend({
  row: ZSelectFileRow,
  proof: ZSelectTaskProof.nullable(),
  issue: ZSelectTaskIssue.nullable()
})
export type TTaskWithRelationsIn = z.input<typeof ZTaskWithRelations>
