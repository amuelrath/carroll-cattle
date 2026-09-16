import { IconCircle } from '@renderer/components/common/icon-circle'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { GhostIcon } from 'lucide-react'
import React from 'react'
import { selectSheetCopy as copy } from './_copy'

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
  if (!headRows || !(headRows.length >= 1)) {
    return <SheetEmpty />
  }
  const rows = headRows as Array<Record<string, unknown>>

  return (
    <div className="border-border rounded-md border">
      <Table className="text-xs">
        <TableHeader className="bg-muted">
          <TableRow>
            {Object.keys(rows[0]).map((colName) => (
              <TableHead key={colName} className="max-w-0 truncate">
                {colName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {Object.values(row).map((v, j) => (
                <TableCell key={`row-${i}-col-${j}`} className="h-9 max-w-0 truncate">
                  {String(v)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
