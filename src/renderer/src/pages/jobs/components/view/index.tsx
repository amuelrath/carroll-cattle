import { CircularProgress } from '@renderer/components/common/circular-progress'
import {
  Page,
  PageContent,
  PageSidebar,
  PageTitlebar,
  PageTitlebarButtonGroup
} from '@renderer/components/common/page'
import { Button } from '@renderer/components/ui/button'
import { CustomTabsTrigger, Tabs, TabsContent, TabsList } from '@renderer/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import { ColumnMapperDialog } from '@renderer/pages/jobs/components/view/components/column-mapper'
import { InfoModal } from '@renderer/pages/jobs/components/view/components/info-modal/view-info'
import {
  SheetEditor,
  SheetTabTrigger
} from '@renderer/pages/jobs/components/view/components/sheet-editor'
import { useThisJobStatus } from '@renderer/pages/jobs/components/view/hooks/use-this-job-status'
import { useJobProgress } from '@renderer/pages/jobs/hooks/use-job-progress'
import { useSearch } from '@tanstack/react-router'
import { Check, type IconNode, Pause, Play, Square } from 'lucide'
import { BotIcon, DownloadIcon } from 'lucide-react'
import { MorphIcon } from 'morphicons/react'
import React, { useEffect } from 'react'
import { Viewer } from './components/viewer'

const statusIconStyles = {
  active: 'fill-okay-foreground animate-pulse stroke-okay-foreground size-3.75',
  inactive: 'fill-muted-foreground stroke-muted-foreground size-3.75',
  paused: 'fill-muted-foreground animate-pulse stroke-muted-foreground size-3.75'
}

const statusVariant = {
  active: 'okay',
  inactive: 'muted',
  paused: 'muted'
} as const

interface ViewPageTitleProps {
  processName: string
  fileName: string
  isComplete: boolean
}

function ViewPageTitle({ processName, fileName, isComplete }: ViewPageTitleProps) {
  const percent = useJobProgress()
  const { thisJobStatus } = useThisJobStatus()

  let icon: IconNode
  switch (thisJobStatus) {
    case 'active':
      icon = Play
      break
    case 'paused':
      icon = Pause
      break
    default:
      icon = Square
      break
  }

  const variant = statusVariant[thisJobStatus]
  const iconStyle = statusIconStyles[thisJobStatus]
  return (
    <div className="flex flex-row items-center space-x-4">
      <div className="relative flex flex-col items-center justify-center">
        <CircularProgress
          value={percent}
          variant={variant}
          size="lg"
          strokeWidth={12}
          className={thisJobStatus !== 'inactive' ? 'animate-pulse' : ''}
        />
        <span className="absolute top-1/3">
          <MorphIcon
            icon={isComplete ? Check : icon}
            className={isComplete ? 'size-3.75 stroke-3' : iconStyle}
          />
        </span>
      </div>
      <div>
        <p>{fileName}</p>
        <p className="text-muted-foreground text-sm font-normal">{processName}</p>
      </div>
    </div>
  )
}

export function ViewPage(): React.JSX.Element {
  const { jobId } = useSearch({ from: '/jobs/view/' })
  const utils = trpc.useUtils()
  const { data: sheet } = trpc.sheet.getSheet.useQuery({ jobId })
  const { data: shouldRefetch } = trpc.automation.onCommitOrIssue.useSubscription()

  const isComplete = sheet?.mapped ? sheet.rows.every((row) => row.state === 'done') : false

  useEffect(() => {
    if (shouldRefetch) {
      utils.job.fetchJobWithTasks.refetch({ jobId: shouldRefetch.jobId }).then(() => undefined)
      utils.sheet.getSheet.refetch({ jobId: shouldRefetch.jobId }).then(() => undefined)
    }
  }, [shouldRefetch, utils.job.fetchJobWithTasks, utils.sheet.getSheet])

  return (
    <Page direction="vertical">
      <PageTitlebar>
        <ViewPageTitle
          processName={sheet?.job.processName ?? ''}
          fileName={sheet?.file.fileName ?? ''}
          isComplete={isComplete}
        />
        <PageTitlebarButtonGroup>
          <ColumnMapperDialog />
          <Tooltip>
            {/* ToDo: Export Edited Sheet */}
            <TooltipTrigger render={<Button size="sm" variant="ghost" aria-label="Export" />}>
              <DownloadIcon {...iconSizes.medium} />
            </TooltipTrigger>
            <TooltipContent side="bottom">Export Sheet</TooltipContent>
          </Tooltip>
          <InfoModal />
        </PageTitlebarButtonGroup>
      </PageTitlebar>
      <Tabs orientation="vertical" className="min-h-0 min-w-0 flex-1 gap-0">
        <PageSidebar className="bg-card z-20 h-full">
          <TabsList className="w-full" variant="ghost">
            <CustomTabsTrigger value="live" Icon={BotIcon} label="Automation" />
            {sheet && <SheetTabTrigger sheet={sheet} />}
          </TabsList>
        </PageSidebar>
        <PageContent className="grow">
          <TabsContent value="live" className="flex flex-1">
            <Viewer />
          </TabsContent>
          <TabsContent value="sheet" className="flex min-h-0 min-w-0 flex-1">
            {sheet && <SheetEditor sheet={sheet} />}
          </TabsContent>
        </PageContent>
      </Tabs>
    </Page>
  )
}
