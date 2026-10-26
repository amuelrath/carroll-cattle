import { ZBreedingRow } from '@shared/schemas/jobs/breeding.schemas'
import { ZFlushRow } from '@shared/schemas/jobs/flush.schemas'
import { ZPregCheckRow } from '@shared/schemas/jobs/preg-check.schemas'
import { z } from 'zod'

export { ZPregCheckRow }
export { ZBreedingRow }

export const ZProcessId = z.enum(['pregCheck', 'breeding', 'flush'])
export type TProcessId = z.infer<typeof ZProcessId>

const schemas = {
  pregCheck: ZPregCheckRow,
  breeding: ZBreedingRow,
  flush: ZFlushRow
} satisfies Record<TProcessId, z.ZodObject>

export type TFileRow<K extends TProcessId> = z.infer<(typeof schemas)[K]>

export const uploadSchemas: typeof schemas = schemas
