import { z } from 'zod'
import { ZBreedingRow } from './breeding'
import { ZPregCheckRow } from './preg-check'

export { ZPregCheckRow }
export { ZBreedingRow }

export const ZProcessId = z.enum(['pregCheck', 'breeding'])
export type TProcessId = z.infer<typeof ZProcessId>

const schemas = {
  pregCheck: ZPregCheckRow,
  breeding: ZBreedingRow
} satisfies Record<TProcessId, z.ZodObject>

export type TFileRow<K extends TProcessId> = z.infer<(typeof schemas)[K]>

export const uploadSchemas: typeof schemas = schemas
