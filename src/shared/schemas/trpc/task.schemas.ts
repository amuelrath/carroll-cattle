import { ZSelectFileRow, ZSelectTask } from '@shared/db/schema'
import { z } from 'zod'

export const ZReadIncompleteTasksWithRowsResponse = z.array(
  ZSelectTask.extend({
    row: ZSelectFileRow.nullable()
  })
)
export type TReadIncompleteTasksWithRowsResponse = z.infer<
  typeof ZReadIncompleteTasksWithRowsResponse
>
