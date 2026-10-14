import { FormError } from '@renderer/components/common/form-error'
import { Button } from '@renderer/components/ui/button'
import {
  CustomDialogHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Separator } from '@renderer/components/ui/separator'
import { Spinner } from '@renderer/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import { cn } from '@renderer/lib/utils'
import {
  type ColumnMap,
  getSheetKeys
} from '@renderer/pages/jobs/components/view/components/column-mapper/_helpers'
import { useColumnMapForm } from '@renderer/pages/jobs/components/view/components/column-mapper/use-column-map-form'
import { nonOptionalKeys } from '@shared/lib/sheet'
import { ZRecord } from '@shared/schemas/helper.schemas'
import { type TProcessId, uploadSchemas } from '@shared/schemas/jobs'
import { UNUSED } from '@shared/schemas/trpc'
import { useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeftRightIcon, ArrowRightIcon, SparkleIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { z } from 'zod'

export function ColumnMapperDialog({
  variant = 'secondary'
}: {
  variant?: 'default' | 'secondary'
}): React.JSX.Element {
  const { jobId } = useSearch({ from: '/jobs/view/' })
  const [job] = trpc.job.fetchJobWithTasks.useSuspenseQuery({ jobId })
  const upsert = trpc.file.upsertColumnMap.useMutation()
  const utils = trpc.useUtils()

  const hasExisting = !!job?.file.columnMap
  const [open, setOpen] = useState<boolean>(!hasExisting)

  const schema = uploadSchemas[job?.processId as TProcessId]
  const targets = useMemo(() => schema.keyof().options, [schema])
  const required = useMemo(() => nonOptionalKeys(schema as z.ZodObject), [schema])
  const sheetKeys = useMemo(
    () => getSheetKeys(job?.tasks.map((t) => ZRecord.parse(t.row.copyRow))),
    [job]
  )

  const onSubmit = async (data: ColumnMap) => {
    if (!job) {
      // This should never happen
      return
    }
    await upsert.mutateAsync({
      fileId: job.file.id,
      columnMap: data
    })
    await utils.job.fetchJobWithTasks.refetch({ jobId })
    await utils.sheet.getSheet.refetch({ jobId })
    setOpen(false)
    return
  }

  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={<Button size="sm" variant={variant} aria-label="Map Columns" />}
            />
          }
        >
          <ArrowLeftRightIcon {...iconSizes.medium} />
        </TooltipTrigger>
        <TooltipContent side="bottom">Map Columns</TooltipContent>
      </Tooltip>
      <DialogContent className="flex max-h-150 min-h-156.25 min-w-162.5">
        <CustomDialogHeader
          icon={ArrowLeftRightIcon}
          title="Map Columns"
          description="Match columns from the uploaded sheet to the required columns"
        />
        <div className="flex min-h-0 grow overflow-x-hidden overflow-y-auto pr-2">
          <ColumnMapForm
            id="col-map"
            targets={targets}
            required={required}
            sheetKeys={sheetKeys}
            onSubmit={onSubmit}
            initial={job?.file.columnMap}
          />
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="secondary" className="w-20">
                Cancel
              </Button>
            }
          />
          <Button type="submit" form="col-map" className="w-40" disabled={upsert.isPending}>
            {upsert.isPending ?
              <Spinner />
            : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ColumnMapFormProps {
  id: string
  targets: string[]
  required: string[]
  sheetKeys: string[]
  initial?: unknown
  onSubmit: (map: ColumnMap) => Promise<void>
}

function ColumnMapForm({
  id,
  targets,
  required,
  sheetKeys,
  initial,
  onSubmit
}: ColumnMapFormProps) {
  const { form, assign, suggested } = useColumnMapForm({ targets, required, sheetKeys, initial })
  const values = useWatch({ control: form.control })
  const used = Object.values(values).filter((v) => v !== undefined)
  const { errors, dirtyFields } = form.formState

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-2">
      {targets.map((t, idx) => (
        <>
          <ColumnMapperRow
            key={t}
            target={t}
            value={values[t] ?? ''}
            onChange={(v) => assign(t, v)}
            options={sheetKeys}
            usedOptions={used}
            required={required.includes(t)}
            suggested={suggested.has(t) && !dirtyFields[t]}
            error={errors[t]?.message}
          />
          {idx !== targets.length - 1 && <hr />}
        </>
      ))}
      {errors.root && <FormError message={errors.root.message} />}
    </form>
  )
}

interface ColumnMapperRowProps {
  target: string
  value: string
  onChange: (v: string) => void
  options: string[]
  usedOptions: string[] | undefined
  required: boolean
  suggested: boolean
  error: string | undefined
}

function ColumnMapperRow({
  target,
  value,
  onChange,
  options,
  usedOptions,
  required,
  suggested,
  error
}: ColumnMapperRowProps) {
  return (
    <div className={cn('grid grid-cols-[40%_10%_40%_10%] items-center gap-y-2')}>
      <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
        <SelectTrigger
          className={cn('w-full justify-self-start', error && 'ring-destructive-foreground ring')}
        >
          <SelectValue
            placeholder="Select column..."
            className={cn(value === UNUSED && 'text-muted-foreground italic')}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {!required && (
              <>
                <SelectItem value={UNUSED} className="italic">
                  Unused
                </SelectItem>
                <Separator className="my-1" />
              </>
            )}
            {options.map((k) => (
              <SelectItem
                key={k}
                value={k}
                className={cn(
                  usedOptions?.includes(k) && 'text-muted-foreground/80 hover:opacity-50'
                )}
              >
                {k}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <ArrowRightIcon {...iconSizes.medium} className="justify-self-center" />
      <span className="text-base font-medium">
        {target}
        {required && <span className="text-destructive-foreground font-extrabold"> *</span>}
      </span>
      {suggested && (
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
