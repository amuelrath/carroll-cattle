import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@renderer/components/ui/accordion'
import { Button } from '@renderer/components/ui/button'
import { Item, ItemContent, ItemDescription } from '@renderer/components/ui/item'
import { Separator } from '@renderer/components/ui/separator'
import { TabsContent } from '@renderer/components/ui/tabs'
import { iconSizes } from '@renderer/lib/tokens'
import { PROCESS_COPY } from '@shared/resources/strings'
import type { TJobKey } from '@shared/schemas/jobs'
import { uploadSchemas } from '@shared/schemas/jobs/upload'
import { DownloadIcon } from 'lucide-react'
import React from 'react'
import * as XLSX from 'xlsx'
import { FileUpload } from '../file-upload'
import { contentCopy as copy } from './_copy'
import { DataDefinitionTable, ExampleDataTable } from './tables'

interface JobContentProps {
  jobKey: TJobKey
}

function downloadTemplate(jobKey: TJobKey) {
  const headers = Object.keys(uploadSchemas[jobKey].shape)
  const wbName = `${PROCESS_COPY[jobKey].name} Template.xlsx`

  const ws = XLSX.utils.json_to_sheet([headers])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, wbName)
}

export function JobContent({ jobKey }: JobContentProps): React.JSX.Element {
  const { name, desc } = PROCESS_COPY[jobKey]

  const handleTemplateDownload = () => {
    downloadTemplate(jobKey)
  }

  return (
    <TabsContent
      key={jobKey}
      value={jobKey}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="max-h-10">
          <h2 className="text-md font-medium">{name}</h2>
          <p className="text-muted-foreground">{desc}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={handleTemplateDownload}>
          <DownloadIcon size={iconSizes.small.size} strokeWidth={iconSizes.small.strokeWidth} />
          {copy.downloadTemplate}
        </Button>
      </div>
      <Separator className="my-2" />
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <FileUpload />
        <Item variant="muted">
          <ItemContent>
            <ItemDescription>{copy.callout}</ItemDescription>
          </ItemContent>
        </Item>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <Accordion defaultValue={['example-data']}>
            <AccordionItem value="example-data">
              <AccordionTrigger>{copy.exampleData}</AccordionTrigger>
              <AccordionContent>
                <ExampleDataTable jobKey={jobKey} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="data-denitions">
              <AccordionTrigger>{copy.columnDefinitions}</AccordionTrigger>
              <AccordionContent>
                <DataDefinitionTable jobKey={jobKey} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </TabsContent>
  )
}
