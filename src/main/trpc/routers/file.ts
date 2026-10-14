import { fileService } from '@main/services'
import { procedure, router } from '@main/trpc/trpc'
import { unwrap } from '@main/trpc/unwrap'
import { ZUpdateRowValueInput, ZUpsertColumnMapInput } from '@shared/schemas/trpc/file.schemas'

export const fileRouter = router({
  upsertColumnMap: procedure.input(ZUpsertColumnMapInput).mutation(async ({ input }) => {
    return await unwrap(fileService.upsertColumnMap(input))
  }),
  updateRow: procedure.input(ZUpdateRowValueInput).mutation(async ({ input }) => {
    return await unwrap(fileService.updateRow(input))
  })
})
