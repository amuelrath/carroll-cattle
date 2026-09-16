import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@renderer/components/ui/button'
import {
  CustomDialogHeader,
  Dialog,
  DialogContent,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Spinner } from '@renderer/components/ui/spinner'
import { trpc } from '@renderer/lib/trpc'
import { useCreateJobMutation } from '@renderer/pages/jobs/hooks/use-create-job-mutation'
import { TSheetPreviewResponse } from '@shared/schemas/trpc'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { LucideIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { mapColumnCopy, selectSheetCopy, stepMeta } from './_copy'
import { StepSheetSelect } from './step-one'
import { StepMapColumns } from './step-two'
import { buildFullSchema, TAllStepsInput, TAllStepsOutput } from './wizard.schemas'

export type Step = 'select-sheet' | 'map-columns'

interface SheetUploadWiardProps {
  sheets: TSheetPreviewResponse['sheets'] | null | undefined
  filePath: string | null
  cancel: () => void
}

export function SheetUploadWizard({
  sheets,
  cancel,
  filePath
}: SheetUploadWiardProps): React.JSX.Element {
  const [step, setStep] = useState<Step>('select-sheet')

  const { jobTab } = useSearch({ from: '/jobs/new/' })
  const navigate = useNavigate()
  const utils = trpc.useUtils()
  const { mutateCreateJob } = useCreateJobMutation()

  const methods = useForm<TAllStepsInput, unknown, TAllStepsOutput>({
    resolver: async (vals, ctx, opts) => {
      const sheetKeys = Object.keys(vals.stepOne.headRows?.[0] || {})
      const schema = buildFullSchema(jobTab, sheetKeys)
      return zodResolver(schema)(vals, ctx, opts)
    }
  })

  // sync whenever real data arrives
  useEffect(() => {
    if (!sheets || !filePath || sheets.length === 0) return
    methods.reset({
      stepOne: {
        filePath,
        sheetName: sheets[0]?.sheetName || '',
        headRows: sheets[0]?.headRows || null
      },
      stepTwo: { columnMap: {} }
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStep('select-sheet')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheets, filePath])

  const handleNext = async () => {
    if (step === 'select-sheet') {
      const valid = await methods.trigger('stepOne')
      if (valid) {
        setStep('map-columns')
      }
    }
  }

  const handleBack = () => {
    if (step === 'select-sheet') cancel()
    setStep('select-sheet')
  }

  const onSubmit = async (data: TAllStepsOutput) => {
    const res = await utils.sheet.validateSheet.fetch({
      filePath: data.stepOne.filePath,
      jobKey: jobTab,
      sheetName: data.stepOne.sheetName,
      columnMap: data.stepTwo.columnMap
    })

    if (res.status === 'valid') {
      // skip /jobs/validate
      // go straight to a dispatch confirmation step
      await mutateCreateJob({
        filePath: data.stepOne.filePath,
        jobKey: jobTab,
        sheetName: data.stepOne.sheetName,
        columnMap: data.stepTwo.columnMap
      })
      return
    }

    await navigate({
      to: '/jobs/validate',
      search: {
        jobKey: jobTab,
        sheetName: data.stepOne.sheetName,
        filePath: data.stepOne.filePath,
        columnMap: data.stepTwo.columnMap
      }
    })
  }

  const handleSubmit = async () => {
    if (step === 'select-sheet') return await handleNext()
    return methods.handleSubmit(onSubmit)()
  }

  const isMulti = (sheets && sheets.length > 1) || false
  const copy = getStepCopy(isMulti, step)

  return (
    <Dialog open={!!sheets && !!filePath && !!sheets.length} onOpenChange={cancel}>
      <FormProvider {...methods}>
        <form className="hidden">
          <DialogContent className="flex max-h-150 min-h-156.25 min-w-162.5">
            <CustomDialogHeader
              icon={copy.icon}
              title={copy.title}
              description={copy.description}
            />
            <div className="flex flex-1">
              {sheets && sheets.length > 0 ? (
                step === 'select-sheet' ? (
                  <StepSheetSelect sheets={sheets} />
                ) : (
                  <StepMapColumns />
                )
              ) : null}
            </div>
            <DialogFooter>
              <div className="flex w-full flex-row items-center justify-between">
                <span className="text-muted-foreground w-20 font-bold">{copy.step}</span>
                <div className="space-x-2">
                  <Button variant="outline" className="w-20" onClick={handleBack}>
                    {copy.backButton}
                  </Button>
                  <Button type="button" className="w-40" onClick={handleSubmit}>
                    {methods.formState.isSubmitting ? <Spinner /> : copy.submitButton}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  )
}

function getStepCopy(
  isMulti: boolean,
  step: Step
): {
  icon: LucideIcon
  title: string
  description: string
  submitButton: string
  backButton: string
  step: string
} {
  const meta = stepMeta[step]

  if (step === 'select-sheet') {
    const variant = isMulti ? selectSheetCopy.multi : selectSheetCopy.single
    return {
      ...meta,
      title: variant.title,
      description: variant.description,
      submitButton: selectSheetCopy.submitButton,
      backButton: selectSheetCopy.backButton
    }
  }

  return {
    ...meta,
    title: mapColumnCopy.title,
    description: mapColumnCopy.description,
    submitButton: mapColumnCopy.submitButton,
    backButton: mapColumnCopy.backButton
  }
}
