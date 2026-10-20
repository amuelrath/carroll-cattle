import { PageTitlebar, PageTitlebarButtonGroup } from '@renderer/components/common/page'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@renderer/components/ui/accordion'
import { Button } from '@renderer/components/ui/button'
import { Item, ItemContent, ItemDescription } from '@renderer/components/ui/item'
import { TabsContent } from '@renderer/components/ui/tabs'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'

import { type TProcessId, uploadSchemas } from '@shared/schemas/jobs'
import { DownloadIcon } from 'lucide-react'
import React from 'react'
import * as XLSX from 'xlsx'
import { FileUpload } from '../file-upload'
import { contentCopy as copy } from './_copy'
import { DataDefinitionTable, ExampleDataTable } from './tables'

interface JobContentProps {
  processId: TProcessId
}

function downloadTemplate(processId: TProcessId, name: string) {
  const headers = Object.keys(uploadSchemas[processId].shape)
  const wbName = `${name} Template.xlsx`

  const ws = XLSX.utils.aoa_to_sheet([headers])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, wbName)
}

export function JobContent({ processId }: JobContentProps): React.JSX.Element {
  const { data, isLoading } = trpc.process.fetchProcesses.useQuery()

  if (isLoading || !data) return <></>

  const { name, desc } = data.find((process) => process.id === processId)! // WatchMe: Bang Operator Used

  const handleTemplateDownload = () => {
    downloadTemplate(processId, name)
  }

  return (
    <TabsContent
      key={processId}
      value={processId}
      className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden"
    >
      <PageTitlebar>
        <div>
          <p>{name}</p>
          <p className="text-muted-foreground text-sm font-normal">{desc}</p>
        </div>
        <PageTitlebarButtonGroup>
          <Button size="sm" variant="secondary" onClick={handleTemplateDownload}>
            <DownloadIcon size={iconSizes.small.size} strokeWidth={iconSizes.small.strokeWidth} />
            {copy.downloadTemplate}
          </Button>
        </PageTitlebarButtonGroup>
      </PageTitlebar>
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <FileUpload />
        <Item variant="muted">
          <ItemContent>
            <ItemDescription>{copy.callout}</ItemDescription>
          </ItemContent>
        </Item>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {/* if there is no value, entire content layout width shifts */}
          <Accordion defaultValue={['example-data']}>
            <AccordionItem value="example-data">
              <AccordionTrigger>{copy.exampleData}</AccordionTrigger>
              <AccordionContent>
                <ExampleDataTable processId={processId} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="data-denitions">
              <AccordionTrigger>{copy.columnDefinitions}</AccordionTrigger>
              <AccordionContent>
                <DataDefinitionTable processId={processId} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </TabsContent>
  )
}
