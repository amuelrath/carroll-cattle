import { ZSelectFileRow, ZSelectTask, ZSelectTaskIssue, ZSelectTaskProof } from '@shared/db/schema'
import { z } from 'zod'

export const ZReadIncompleteTasksWithRowsResponse = z.array(
  ZSelectTask.extend({
    row: ZSelectFileRow.nullable()
  })
)
export type TReadIncompleteTasksWithRowsResponse = z.infer<
  typeof ZReadIncompleteTasksWithRowsResponse
>

export const ZTaskWithIssueAndProof = ZSelectTask.extend({
  issue: ZSelectTaskIssue.nullable(),
  proof: ZSelectTaskProof.nullable()
})

export type TTaskWithIssueAndProof = z.infer<typeof ZTaskWithIssueAndProof>
