import { CircularProgressWithIndicator } from '@renderer/components/common/circular-progress'
import { PageTitlebar, PageTitlebarButtonGroup } from '@renderer/components/common/page'
import { Separator } from '@renderer/components/ui/separator'
import { ColumnMapperDialog } from '@renderer/pages/jobs/components/view/components/column-mapper'
import { InfoModal } from '@renderer/pages/jobs/components/view/components/info-modal/view-info'
import { ReviewerTrigger } from '@renderer/pages/jobs/components/view/components/reviewer'
import { DownloadButton } from '@renderer/pages/jobs/components/view/components/ribbon/download-button'
import { SpeedControls } from '@renderer/pages/jobs/components/view/components/ribbon/speed-controls'
import { useThisJobStatus } from '@renderer/pages/jobs/components/view/hooks/use-this-job-status'
import { useJobProgress } from '@renderer/pages/jobs/hooks/use-job-progress'
import type { TSheet } from '@shared/schemas/trpc'
import React from 'react'

interface ViewPageTitlebarProps {
  sheet: TSheet | undefined
}

export function ViewPageTitleBar({ sheet }: ViewPageTitlebarProps): React.JSX.Element {
  return (
    <PageTitlebar className="space-x-4">
      <ViewPageTitle
        processName={sheet?.job.processName ?? ''}
        fileName={sheet?.file.fileName ?? ''}
      />
      <Separator orientation="vertical" />
      <PageTitlebarButtonGroup side="left" className="flex grow flex-row justify-between">
        <div className="flex h-full flex-row items-center space-x-4">
          <SpeedControls />
          <ReviewerTrigger sheet={sheet} />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <ColumnMapperDialog />
          <DownloadButton sheet={sheet} />
          <InfoModal />
        </div>
      </PageTitlebarButtonGroup>
    </PageTitlebar>
  )
}

interface ViewPageTitleProps {
  processName: string
  fileName: string
}

function ViewPageTitle({ processName, fileName }: ViewPageTitleProps) {
  const { thisJobStatus, jobId } = useThisJobStatus()
  const percent = useJobProgress({ jobId })

  return (
    <div className="line-clamp-1 flex w-72 flex-row items-center space-x-4 truncate">
      <CircularProgressWithIndicator value={percent} status={thisJobStatus} />
      <div>
        <p>{fileName}</p>
        <p className="text-muted-foreground text-sm font-normal">{processName}</p>
      </div>
    </div>
  )
}
