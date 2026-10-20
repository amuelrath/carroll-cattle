import { Button } from '@renderer/components/ui/button'
import { toast } from '@renderer/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { iconSizes } from '@renderer/lib/tokens'
import { sheetToJson } from '@shared/lib/sheet'
import type { TSheet } from '@shared/schemas/trpc'
import { DownloadIcon } from 'lucide-react'
import React from 'react'

export function DownloadButton({ sheet }: { sheet: TSheet | undefined }): React.JSX.Element {
  const downloadSheet = () => {
    if (!sheet)
      return toast.add({
        type: 'warning',
        title: 'Cannot Export Sheet',
        description: 'The sheet you are trying to export does not exist.'
      })

    if (!sheet.mapped)
      return toast.add({
        type: 'warning',
        title: 'Cannot Export Sheet',
        description: 'The sheet you are trying to export has not been mapped.'
      })
    const rows = sheet.rows.map((row) => row.copyRow)
    const title = `${sheet.file.fileName} (Revised)`
    return sheetToJson(rows, title)
  }

  const hasEdits = sheet?.mapped ? sheet.rows.some((row) => row.edits.length > 0) : false

  return (
    <Tooltip>
      <TooltipTrigger
        className="relative"
        onClick={() => downloadSheet()}
        render={<Button variant="ghost" aria-label="Export" />}
      >
        <DownloadIcon {...iconSizes.medium} />
        {hasEdits && (
          <span className="bg-warn-foreground absolute top-1 right-1 size-1.5 rounded-full" />
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom">Export Sheet</TooltipContent>
    </Tooltip>
  )
}
