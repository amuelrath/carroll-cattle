import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { type TProcessId, uploadSchemas } from '@shared/schemas/jobs'
import React from 'react'
import { exampleRows } from './_copy'

interface ExampleDataTableProps {
  processId: TProcessId
}

export function ExampleDataTable({ processId }: ExampleDataTableProps): React.JSX.Element {
  const rows = exampleRows[processId]
  return (
    <div className="border-border rounded-md border">
      <Table className="table-fixed text-xs">
        <TableCaption>
          <Tooltip>
            <TooltipTrigger className="opacity-75 transition hover:opacity-100">
              <span className="flex flex-row items-center justify-center space-x-1 pb-2">
                What does this mean?
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Your sheet needs these columns, in any order. Exact header names don&apos;t matter,
              you&apos;ll be able to match them after upload.
            </TooltipContent>
          </Tooltip>
        </TableCaption>
        <TableHeader className="bg-muted/80">
          <TableRow>
            {Object.keys(rows[0]).map((k) => (
              <TableHead key={k} className="truncate">
                {k}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              {Object.values(r).map((v, k) => {
                return (
                  <TableCell key={`row-${i}-cell-${k}`} className="truncate">
                    {String(v)}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface DataDefinitionTableProps {
  processId: TProcessId
}

export function DataDefinitionTable({ processId }: DataDefinitionTableProps): React.JSX.Element {
  const schema = uploadSchemas[processId]
  return (
    <div className="border-border rounded-md border">
      <Table className="table-fixed text-xs">
        <TableHeader className="bg-muted/80">
          <TableRow>
            <TableHead className="w-1/4 truncate">Column Name</TableHead>
            <TableHead className="truncate">Definition</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.keys(schema.shape).map((k) => (
            <TableRow key={k} className="select-text">
              <TableCell className="truncate">{k}</TableCell>
              <TableCell className="break-words whitespace-normal">
                {schema.shape[k].description ? schema.shape[k].description : 'Definition not found'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
