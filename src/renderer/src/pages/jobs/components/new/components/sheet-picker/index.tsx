import { zodResolver } from '@hookform/resolvers/zod'
import { FormError } from '@renderer/components/common/form-error'
import { Button } from '@renderer/components/ui/button'
import {
  CustomDialogHeader,
  Dialog,
  DialogContent,
  DialogFooter
} from '@renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Spinner } from '@renderer/components/ui/spinner'
import { trpc } from '@renderer/lib/trpc'
import { cn } from '@renderer/lib/utils'
import { selectSheetCopy as copy } from '@renderer/pages/jobs/components/new/components/sheet-picker/_copy'
import { SheetPreviewTable } from '@renderer/pages/jobs/components/new/components/sheet-picker/preview-table'
import { TSheetPreviewResponse } from '@shared/schemas/trpc'
import { useNavigate, useSearch } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

interface SheetPickerProps {
  sheets: TSheetPreviewResponse['sheets'] | null
  filePath: string | null
  cancel: () => void
}

const ZSheetPickerForm = z.object({
  filePath: z.string(),
  sheetName: z.string(),
  headRows: z
    .array(z.record(z.string(), z.unknown()))
    .nullable()
    .refine((val) => val !== null && val.length >= 1)
})

type TSheetPickerForm = z.infer<typeof ZSheetPickerForm>

export function SheetPicker({ sheets, filePath, cancel }: SheetPickerProps): React.JSX.Element {
  const { processId } = useSearch({ from: '/jobs/new/' })
  const { mutateAsync: mutateCreateJob } = trpc.job.create.useMutation()
  const navigate = useNavigate()

  const {
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<TSheetPickerForm>({
    resolver: zodResolver(ZSheetPickerForm),
    defaultValues: {
      filePath: filePath ?? '',
      sheetName: sheets?.[0].sheetName ?? '',
      headRows: sheets?.[0].headRows ?? []
    }
  })

  useEffect(() => {
    // data is usually undefined on first render?
    // sync whenever real data arrives
    if (!sheets || !filePath || sheets.length === 0) return
    reset({
      filePath,
      sheetName: sheets[0]?.sheetName || '',
      headRows: sheets[0]?.headRows || null
    })
  }, [sheets, filePath, reset])

  const selectedSheetName = useWatch({
    control,
    name: 'sheetName'
  })
  const selectedSheet = sheets?.find((s) => s.sheetName === selectedSheetName)
  const isMulti = (sheets?.length || 0) > 1

  const onSubmit = async (data: TSheetPickerForm) => {
    const { jobId } = await mutateCreateJob({ processId, ...data })
    await navigate({
      to: '/jobs/view',
      search: { jobId, tab: 'sheet' }
    })
  }
  return (
    <Dialog open={!!sheets && !!filePath && !!sheets.length} onOpenChange={cancel}>
      <DialogContent className="flex max-h-150 min-h-156.25 min-w-162.5">
        <CustomDialogHeader
          icon={copy.icon}
          title={isMulti ? copy.multi.title : copy.single.title}
          description={isMulti ? copy.multi.description : copy.single.description}
        />
        <form id="sheet" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-2">
          <Controller
            name="sheetName"
            control={control}
            render={({ field }) => (
              <Select
                disabled={!isMulti}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  const sheet = sheets?.find((s) => s.sheetName === value)
                  if (!sheet) return // WatchMe: This may cause silent issues!
                  setValue('headRows', sheet.headRows, {
                    shouldValidate: true
                  })
                }}
              >
                <SelectTrigger
                  className={cn('w-full', errors?.headRows && 'ring-destructive-foreground ring')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {sheets?.map(({ sheetName }) => (
                      <SelectItem key={sheetName} value={sheetName}>
                        {sheetName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <span className="text-muted-foreground px-2 text-center text-xs">
            {isMulti ? copy.previewLabel : copy.previewLabel}
          </span>
          <SheetPreviewTable headRows={selectedSheet?.headRows} />
          {errors?.headRows && (
            <FormError
              message={isMulti ? copy.multi.errors.headRows : copy.single.errors.headRows}
            />
          )}
        </form>
        <DialogFooter>
          <div className="flex w-full flex-row items-center justify-end">
            <div className="space-x-2">
              <Button type="button" onClick={cancel} variant="outline" className="w-20">
                {copy.cancelButton}
              </Button>
              <Button type="submit" form="sheet" className="w-40">
                {isSubmitting ?
                  <Spinner />
                : copy.submitButton}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
