import { z } from 'zod'
import { ZPregCheckRow } from './preg-check'

export { ZPregCheckRow } from './preg-check'

export const ZProcessId = z.enum(['pregCheck'])
export type TProcessId = z.infer<typeof ZProcessId>

const schemas = {
  pregCheck: ZPregCheckRow
} satisfies Record<TProcessId, z.ZodObject>

export type TFileRow<K extends TProcessId> = z.infer<(typeof schemas)[K]>

export const uploadSchemas: typeof schemas = schemas
