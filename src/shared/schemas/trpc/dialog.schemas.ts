import { z } from 'zod'

export const ZOpenFileInput = z.object({
  filePath: z.string().min(1)
})
export type TOpenFileInput = z.infer<typeof ZOpenFileInput>

export const ZOpenFileResponse = z.object({
  filePath: z.string().nullable()
})
export type TOpenFileResponse = z.infer<typeof ZOpenFileResponse>
