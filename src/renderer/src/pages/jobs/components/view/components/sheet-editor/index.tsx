import { EmptyState } from '@renderer/components/common/empty-state'
import { TableBody, TableHead, TableHeader, TableRow } from '@renderer/components/ui/table'
import { CustomTabsTrigger } from '@renderer/components/ui/tabs'
import { trpc } from '@renderer/lib/trpc'
import { cn } from '@renderer/lib/utils'
import { Row } from '@renderer/pages/jobs/components/view/components/sheet-editor/row'
import { RowContext } from '@renderer/pages/jobs/components/view/components/sheet-editor/row-context'
import { type TColumn, type TSheet, UNUSED } from '@shared/schemas/trpc'
import { motion } from 'framer-motion'
import { SheetIcon } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface SheetTabTriggerProps {
  sheet: TSheet
}

export function SheetTabTrigger({ sheet }: SheetTabTriggerProps): React.JSX.Element {
  const count = useMemo(
    () => (sheet.mapped ? sheet.rows.filter((row) => row.state === 'issue').length : 0),
    [sheet]
  )

  const prevCountRef = useRef(count)
  const [pingKey, setPingKey] = useState(0)

  useEffect(() => {
    if (count > prevCountRef.current) setPingKey((k) => k + 1)
    prevCountRef.current = count
  }, [count])

  return (
    <CustomTabsTrigger value="sheet" Icon={SheetIcon} label="Sheet">
      <div className="flex w-full flex-row items-center justify-end">
        {count > 0 && (
          <span className="relative flex size-4">
            {/* Expanding ring, only after an increase */}
            {pingKey > 0 && (
              <motion.span
                key={pingKey}
                className="bg-destructive-foreground pointer-events-none absolute inset-0 rounded-full"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )}

            {/* The badge itself gets a small pop */}
            <motion.span
              key={`badge-${pingKey}`}
              className="bg-destructive-foreground relative flex size-4 items-center justify-center rounded-full text-xs text-white"
              initial={pingKey === 0 ? false : { scale: 1 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {count}
            </motion.span>
          </span>
        )}
      </div>
    </CustomTabsTrigger>
  )
}

export interface OnCellUpdateArgs {
  value: string | null
  columnName: string
  rowIdx: number
}

export type OnCellUpdate = (data: OnCellUpdateArgs) => Promise<void>

interface SheetEditorProps {
  sheet: TSheet
}

const useCellUpdates = ({ jobId }: { jobId: number }) => {
  const utils = trpc.useUtils()
  const { mutateAsync: updateRow } = trpc.file.updateRow.useMutation({
    onSuccess: async () => {
      await utils.sheet.getSheet.refetch({ jobId })
    }
  })
  return { updateRow }
}

export function SheetEditor({ sheet }: SheetEditorProps) {
  const { mapped, job, file } = sheet

  const { updateRow } = useCellUpdates({ jobId: job.id })

  const onCellUpdate = useCallback<OnCellUpdate>(
    async (args) => {
      // Bug in Zod: Will remove undefined values along with their key.
      // Therefore, we have to convert it to null
      const value = args.value === undefined ? null : String(args.value)
      await updateRow({ ...args, value, fileId: file.id })
    },
    [updateRow, file.id]
  )

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
      {mapped ?
        <>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <SheetTable sheet={sheet} onCellUpdate={onCellUpdate} />
          </div>
        </>
      : <EmptyState title="Columns Unmapped" desc="Please map column names to continue." />}
    </div>
  )
}

interface SheetTableProps {
  sheet: TSheet
  onCellUpdate: OnCellUpdate
}

function SheetTable({ sheet, onCellUpdate }: SheetTableProps) {
  if (!sheet.mapped) return null
  const { columns, rows } = sheet

  return (
    <div className="@container flex min-h-0 min-w-0 flex-1 grow flex-row">
      <div
        className={cn(
          'relative min-h-0 min-w-0 flex-1 overflow-x-auto',
          '[&::-webkit-scrollbar]:w-1.5',
          '[&::-webkit-scrollbar]:h-1.5',
          '[&::-webkit-scrollbar-button]:hidden',
          '[&::-webkit-scrollbar-thumb]:rounded-none',
          '[&::-webkit-scrollbar-thumb]:bg-okay-foreground/80',
          '[&::-webkit-scrollbar-track]:bg-okay/50'
        )}
      >
        <table className="relative w-max min-w-[100cqw] caption-bottom border-separate border-spacing-0 text-sm [&_td]:border-b [&_th]:border-b">
          <SheetTableHeader columns={columns} />
          <TableBody>
            {rows.map((row, rowIdx) => (
              <Row
                key={`row-${rowIdx}`}
                row={row}
                rowIdx={rowIdx}
                columns={columns}
                onCellUpdate={onCellUpdate}
              />
            ))}
          </TableBody>
        </table>
      </div>
      <RowContext sheet={sheet} />
    </div>
  )
}

function SheetTableHeader({ columns }: { columns: TColumn[] }) {
  const usedColumnsLength = columns.filter((col) => col.source !== UNUSED).length

  return (
    <TableHeader className="">
      <TableRow className="bg-muted">
        <TableHead className="border-r-border bg-border text-muted-foreground sticky top-0 left-0 z-40 border-r font-semibold" />
        <TableHead className="border-r-border bg-muted text-muted-foreground sticky top-0 z-30 border-r font-semibold">
          Status
        </TableHead>
        {columns.map(({ source }, colIdx) => {
          if (source === UNUSED) return
          return (
            <TableHead
              key={source}
              className={cn(
                'border-border bg-muted text-muted-foreground sticky top-0 z-30 font-semibold',
                colIdx !== usedColumnsLength + 1 && 'border-r'
              )}
            >
              {source}
            </TableHead>
          )
        })}
      </TableRow>
    </TableHeader>
  )
}
