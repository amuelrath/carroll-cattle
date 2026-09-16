import type { TJobKey } from '@shared/schemas/jobs'
import { uploadSchemas } from '@shared/schemas/jobs/upload'
import { z } from 'zod'

export const ZStepOne = z.object({
  filePath: z.string().min(1),
  sheetName: z.string().min(1),
  headRows: z
    .array(z.record(z.string(), z.unknown()))
    .nullable()
    .refine((val) => val !== null && val.length >= 1)
})
export type TStepOneInput = z.input<typeof ZStepOne>
export type TStepOneOutput = z.output<typeof ZStepOne>

export function buildStepTwoSchema(processId: TJobKey, colNames: string[]) {
  const reqKeys = uploadSchemas[processId].keyof()
  const sheetKeys = z.enum(colNames)
  return z
    .object({
      columnMap: z.record(reqKeys, sheetKeys)
    })
    .nullable()
    .refine((val) => val !== null, { message: 'All required columns must have assignments' })
}

export type TStepTwoInput = z.input<ReturnType<typeof buildStepTwoSchema>>
export type TStepTwoOutput = z.output<ReturnType<typeof buildStepTwoSchema>>

export function buildFullSchema(jobKey: TJobKey, sheetKeys: string[]) {
  return z.object({
    stepOne: ZStepOne,
    stepTwo: buildStepTwoSchema(jobKey, sheetKeys)
  })
}

export type TAllStepsInput = {
  stepOne: TStepOneInput
  stepTwo: TStepTwoInput
}

export type TAllStepsOutput = {
  stepOne: TStepOneOutput
  stepTwo: TStepTwoOutput
}
