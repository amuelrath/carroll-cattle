import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { cn } from '@renderer/lib/utils'
import { TFetchSheetResponse, type TValidateSheetResponse } from '@shared/schemas/trpc'
import { useSearch } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useCallback } from 'react'
import { getCellId, useCellActions, useIsCellActive } from '../../hooks/store'
import { useScrolljacker } from '../../hooks/use-scrolljacker'

interface SheetTableProps {
  sheet: TFetchSheetResponse | undefined
  validation: TValidateSheetResponse
}

// ToDo: If an entire column has errors, the user probably mapped it wrong.
// Include some extra info in the explanation dialog which explains this and
// tells them what to do. (re upload, or maybe build in a remap?)
export function SheetTable({ sheet, validation, isScrollAtTop }: SheetTableProps) {
  const { columnMap } = useSearch({ from: '/jobs/validate/' })

  const { handleMouseEnter, handleMouseLeave, cellRefs } = useScrolljacker({
    for: 'table'
  })

  const setCellRef = useCallback(
    (cellId: string) => (el: HTMLTableCellElement | null) => {
      cellRefs.current[cellId] = el
    },
    [cellRefs]
  )

  const errors = validation.status === 'invalid' ? validation.errors : undefined

  if (!sheet || sheet.rows.length === 0) return <p>err! no rows</p>
  const rows = sheet.rows

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="no-scrollbar relative flex min-h-0 flex-1 overflow-y-scroll"
    >
      <Table className="animate-in fade-in relative table-fixed border-b text-xs duration-200">
        <TableHeader className="bg-muted sticky top-0 z-50 shadow-[inset_0_1px_0_var(--border),inset_0_-1px_0_var(--border)]">
          <TableRow className="border-b border-transparent">
            {Object.keys(rows[0]).map((k) => (
              <TableHead key={k} className="truncate border-r">
                {k}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIdx) => (
            <TableRow key={`row-${rowIdx}`}>
              {Object.values(row).map((v, colIdx) => {
                const columnName = Object.keys(row)[colIdx]
                // only include columns that got mapped
                if (!Object.values(columnMap).includes(columnName)) return <></>
                const err = errors?.find((e) => e.rowIdx === rowIdx && e.columnName === columnName)
                const cellId = getCellId({ rowIdx, columnName })

                if (!err) return <SheetTableCell key={cellId} value={v} />

                return (
                  <SheetTableCellWithError
                    key={cellId}
                    ref={setCellRef(cellId)}
                    value={v}
                    rowIdx={rowIdx}
                    columnName={columnName}
                  />
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface SheetTableCellProps {
  value: unknown
}

export function SheetTableCell({ value }: SheetTableCellProps) {
  return (
    <TableCell className={cn('hover:bg-muted relative h-8 truncate border-r')}>
      {String(value)}
    </TableCell>
  )
}

interface SheetTableCellWithErrorProps {
  ref?: React.Ref<HTMLTableCellElement>
  rowIdx: number
  columnName: string
  value: unknown
}

export const SheetTableCellWithError = React.memo(function SheetTableCellWithError({
  rowIdx,
  columnName,
  value,
  ref
}: SheetTableCellWithErrorProps) {
  const isActive = useIsCellActive({ rowIdx, columnName })
  const [setActive] = useCellActions({ rowIdx, columnName, delayMs: 0 })

  return (
    <TableCell
      ref={ref}
      onClick={setActive}
      className={cn(
        'hover:bg-destructive/80 bg-destructive/50 relative h-8 cursor-pointer truncate border-r transition',
        isActive && 'ring-destructive-foreground z-30 ring-2 ring-inset'
      )}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.095 }}
            className="bg-destructive-foreground absolute top-0 left-0 h-3 w-3 [clip-path:polygon(0%_0%,100%_0%,0%_100%)]"
          />
        )}
      </AnimatePresence>

      {String(value)}
    </TableCell>
  )
})
