import { z } from 'zod'

export const ZOpenPathInput = z.object({
  filePath: z.string().min(1)
})
export type TOpenPathInput = z.infer<typeof ZOpenPathInput>
