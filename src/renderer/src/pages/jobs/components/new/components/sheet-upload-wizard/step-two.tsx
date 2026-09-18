import { FormError } from '@renderer/components/common/form-error'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { normalize } from '@renderer/lib/strings'
import { iconSizes } from '@renderer/lib/tokens'
import { cn } from '@renderer/lib/utils'
import { useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRightIcon, SparkleIcon } from 'lucide-react'
import React, { useEffect, useMemo } from 'react'
import { Controller, get, Path, useFormContext, useWatch } from 'react-hook-form'
import { findBestMatch } from 'string-similarity'
import { z } from 'zod'
import { mapColumnCopy as copy } from './_copy'
import { buildFullSchema, TAllStepsInput, TAllStepsOutput } from './wizard.schemas'

// MaybeToDo: Consider the case we have optional fields.
export function StepMapColumns(): React.JSX.Element {
  const { processId } = useSearch({ from: '/jobs/new/' })
  const {
    getValues,
    setValue,
    control,
    resetField,
    formState: { errors }
  } = useFormContext<TAllStepsInput, unknown, TAllStepsOutput>()

  const currentColumnMap = useWatch({
    control,
    name: 'stepTwo.columnMap'
  })

  // this should always be defined
  const sheetKeys = useMemo(() => {
    return Object.keys(getValues('stepOne.headRows')?.[0] ?? {})
  }, [getValues])

  const usedSheetKeys = Object.values(currentColumnMap) as string[]

  // rebuild the schema
  const schema = useMemo(() => buildFullSchema(processId, sheetKeys), [processId, sheetKeys])

  // there has to be a cleaner way to get this. still works though
  const targetKeys = useMemo(() => {
    const entries = schema.shape['stepTwo'].unwrap().shape['columnMap'].keyType.def.entries
    return Object.keys(entries) as KeysOf<typeof entries>[]
  }, [schema])

  const onAssign = (name: Path<z.output<typeof schema>>, value: string) => {
    const currentColumnMap = getValues('stepTwo.columnMap')
    // if this assignment would be this sheetKey's second usage
    const conflictKey = (Object.entries(currentColumnMap) as Entries<typeof currentColumnMap>).find(
      ([k, v]) => v === value && `stepTwo.columnMap.${k}` !== name
    )?.[0]

    if (conflictKey) {
      // remove the previous assignment
      // new assignment handled in onValueChange
      setValue(`stepTwo.columnMap.${conflictKey}`, '')
    }
  }

  const defaults = useMemo(() => buildDefaultValues(targetKeys, sheetKeys), [sheetKeys, targetKeys])

  useEffect(() => {
    const setDefaults = () => {
      resetField('stepTwo.columnMap')
      setValue('stepTwo.columnMap', defaults)
    }

    setDefaults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columnMapErrors = errors.stepTwo?.columnMap

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex-1 space-y-2.25">
        {targetKeys.map((k, idx) => (
          <React.Fragment key={k}>
            <ColumnMapRow
              name={`stepTwo.columnMap.${k}`}
              sheetKeys={sheetKeys}
              usedSheetKeys={usedSheetKeys}
              targetKey={k}
              onAssign={onAssign}
            />
            {idx !== targetKeys.length - 1 && <hr />}
          </React.Fragment>
        ))}
      </div>
      {columnMapErrors && <FormError message={copy.error} />}
    </div>
  )
}

interface ColumnMapRowProps {
  name: Path<TAllStepsOutput>
  sheetKeys: string[]
  usedSheetKeys: string[]
  targetKey: KeysOf<TAllStepsOutput['stepTwo']['columnMap']>
  onAssign: (name: Path<TAllStepsOutput>, value: string) => void
}

function ColumnMapRow({
  name,
  sheetKeys,
  usedSheetKeys,
  targetKey,
  onAssign
}: ColumnMapRowProps): React.JSX.Element {
  const {
    control,
    formState: { errors },
    getFieldState,
    getValues
  } = useFormContext<TAllStepsInput, unknown, TAllStepsOutput>()

  const error = get(errors, name)?.message

  const fieldState = getFieldState(name)
  const fieldValue = getValues(name)
  const wasDefaultSet = !fieldState.isDirty && fieldValue !== ''

  return (
    <div className={cn('grid grid-cols-[40%_10%_40%_10%] items-center gap-y-2', wasDefaultSet)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value ?? ''} name={field.name} onValueChange={field.onChange}>
            <SelectTrigger
              className={cn(
                'w-full justify-self-start',
                error && 'ring-destructive-foreground ring'
              )}
            >
              <SelectValue placeholder="Select column..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sheetKeys.map((k) => (
                  <SelectItem
                    key={k}
                    value={k}
                    className={cn(
                      usedSheetKeys.includes(k) && 'text-muted-foreground/80 hover:opacity-50'
                    )}
                    onClick={() => onAssign(name, k)}
                  >
                    {k}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      <ArrowRightIcon {...iconSizes.medium} className="justify-self-center" />
      <span className="">{targetKey}</span>
      {wasDefaultSet && (
        <motion.span
          className="inline-block origin-center"
          initial={{ opacity: 0, scaleX: 0, scaleY: 0, rotate: 45 }}
          animate={{ opacity: 1, scaleX: 1, scaleY: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.3 }}
        >
          <SparkleIcon {...iconSizes.large} className="text-okay-foreground" />
        </motion.span>
      )}
    </div>
  )
}

function buildDefaultValues(
  targetKeys: string[],
  sheetKeys: string[],
  threshold = 0.6
): Record<string, string> {
  const columnMap: Record<string, string> = {}
  const usedSheetKeys = new Set<string>()

  targetKeys.forEach((tk) => {
    const available = sheetKeys.filter((sk) => !usedSheetKeys.has(sk))
    if (available.length === 0) {
      columnMap[tk] = ''
      return
    }

    const { bestMatch } = findBestMatch(normalize(tk), available.map(normalize))
    const bestIndex = bestMatch ? available.map(normalize).indexOf(bestMatch.target) : -1

    if (bestIndex !== -1 && bestMatch.rating >= threshold) {
      const matched = available[bestIndex]
      columnMap[tk] = matched
      usedSheetKeys.add(matched)
    } else {
      columnMap[tk] = ''
    }
  })
  return columnMap
}
