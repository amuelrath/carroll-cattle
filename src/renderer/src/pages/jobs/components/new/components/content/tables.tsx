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
import { isDate } from '@renderer/lib/strings'
import { PROCESS_COPY } from '@shared/resources/strings'
import type { TJobKey } from '@shared/schemas/jobs'
import { uploadSchemas } from '@shared/schemas/jobs/upload'
import React from 'react'

interface ExampleDataTableProps {
  jobKey: TJobKey
}

export function ExampleDataTable({ jobKey }: ExampleDataTableProps): React.JSX.Element {
  const exampleRows = PROCESS_COPY[jobKey].exampleData
  return (
    <div className="border-border rounded-md border">
      <Table className="table-fixed text-xs">
        <TableCaption>
          <Tooltip>
            <TooltipTrigger className="cursor-pointer opacity-75 transition hover:opacity-100">
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
            {Object.keys(exampleRows[0]).map((k) => (
              <TableHead key={k} className="truncate">
                {k}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {exampleRows.map((r, i) => (
            <TableRow key={i}>
              {Object.values(r).map((v, k) => {
                let display = v
                // if the value is a date, show it in a string format
                if (isDate(v)) {
                  const d = v instanceof Date ? v : new Date(v as string)
                  display = d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit'
                  })
                }

                return (
                  <TableCell key={`row-${i}-cell-${k}`} className="truncate">
                    {String(display)}
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
  jobKey: TJobKey
}

export function DataDefinitionTable({ jobKey }: DataDefinitionTableProps): React.JSX.Element {
  const schema = uploadSchemas[jobKey]
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
