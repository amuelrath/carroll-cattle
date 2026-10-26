import { z } from 'zod'

export const ZCredentials = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export type TCredentials = z.infer<typeof ZCredentials>
