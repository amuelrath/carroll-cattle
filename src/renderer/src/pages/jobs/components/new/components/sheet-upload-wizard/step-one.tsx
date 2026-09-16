import { FormError } from '@renderer/components/common/form-error'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { cn } from '@renderer/lib/utils'
import { TSheetPreviewResponse } from '@shared/schemas/trpc'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { selectSheetCopy as copy } from './_copy'
import { SheetPreviewTable } from './preview-table'
import { TAllStepsInput, TAllStepsOutput } from './wizard.schemas'

interface StepSheetSelectProps {
  sheets: TSheetPreviewResponse['sheets']
}

export function StepSheetSelect({ sheets }: StepSheetSelectProps): React.JSX.Element {
  const {
    control,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<TAllStepsInput, unknown, TAllStepsOutput>()

  const selectedSheetName = watch('stepOne.sheetName')
  const selectedSheet = sheets.find((s) => s.sheetName === selectedSheetName)
  const isMulti = sheets.length > 1
  return (
    <div className="flex flex-1 flex-col gap-2">
      <Controller
        name="stepOne.sheetName"
        control={control}
        render={({ field }) => (
          <Select
            disabled={!isMulti}
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value)
              const sheet = sheets.find((s) => s.sheetName === value)
              if (!sheet) return // WatchMe: This may cause silent issues!
              setValue('stepOne.headRows', sheet.headRows, {
                shouldValidate: true
              })
            }}
          >
            <SelectTrigger
              className={cn(
                'w-full',
                errors.stepOne?.headRows && 'ring-destructive-foreground ring'
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sheets.map(({ sheetName }) => (
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
      {errors.stepOne?.headRows && (
        <FormError message={isMulti ? copy.multi.errors.headRows : copy.single.errors.headRows} />
      )}
    </div>
  )
}
