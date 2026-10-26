import { IconCircle } from '@renderer/components/common/icon-circle'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { cn } from '@renderer/lib/utils'
import { selectSheetCopy as copy } from '@renderer/pages/jobs/components/new/components/sheet-picker/_copy'
import { GhostIcon } from 'lucide-react'
import React from 'react'

function SheetEmpty(): React.JSX.Element {
  return (
    <div className="border-border bg-muted flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-md border p-2">
      <IconCircle Icon={GhostIcon} size="medium" variant="inverse" />
      <p className="text-muted-foreground">{copy.empty.message}</p>
    </div>
  )
}

interface SheetPreviewProps {
  headRows: unknown[] | null | undefined
}

export function SheetPreviewTable({ headRows }: SheetPreviewProps): React.JSX.Element {
  if (!headRows || headRows.length < 1) {
    return <SheetEmpty />
  }
  const rows = headRows as Array<Record<string, unknown>>

  // flatMap so keys from *all* rows are collected (see note below)
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))]

  return (
    <div
      className={cn(
        'scrollbar-custom border-border min-h-0 min-w-0 flex-1 overflow-auto rounded border',
        // let this div be the only scroll container (shadcn's Table adds its own overflow-x wrapper)
        '**:data-[slot=table-container]:overflow-visible'
      )}
    >
      <Table className="w-max min-w-full text-xs">
        <TableHeader className="bg-muted sticky top-0 z-10">
          <TableRow>
            {columns.map((colName) => (
              <TableHead key={colName} className="max-w-60 truncate border-r">
                {colName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="border-b">
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((colName) => (
                <TableCell key={colName} className="h-9 max-w-60 truncate border-r">
                  {String(row?.[colName] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
