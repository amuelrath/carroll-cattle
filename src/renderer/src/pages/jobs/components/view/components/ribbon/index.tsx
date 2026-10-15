import { CircularProgress } from '@renderer/components/common/circular-progress'
import { PageTitlebar, PageTitlebarButtonGroup } from '@renderer/components/common/page'
import { Button } from '@renderer/components/ui/button'
import { ButtonGroup } from '@renderer/components/ui/button-group'
import { Separator } from '@renderer/components/ui/separator'
import { toast } from '@renderer/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import { ColumnMapperDialog } from '@renderer/pages/jobs/components/view/components/column-mapper'
import { InfoModal } from '@renderer/pages/jobs/components/view/components/info-modal/view-info'
import { useThisJobStatus } from '@renderer/pages/jobs/components/view/hooks/use-this-job-status'
import { useJobProgress } from '@renderer/pages/jobs/hooks/use-job-progress'
import { sheetToJson } from '@shared/lib/sheet'
import type { TSheet } from '@shared/schemas/trpc'
import { Check, type IconNode, Pause, Play, Square } from 'lucide'
import { DownloadIcon } from 'lucide-react'
import { MorphIcon } from 'morphicons/react'
import React from 'react'

interface ViewPageTitlebarProps {
  sheet: TSheet | undefined
}

export function ViewPageTitleBar({ sheet }: ViewPageTitlebarProps): React.JSX.Element {
  const isComplete = sheet?.mapped ? sheet.rows.every((row) => row.state === 'done') : false

  return (
    <PageTitlebar className="space-x-4">
      <ViewPageTitle
        processName={sheet?.job.processName ?? ''}
        fileName={sheet?.file.fileName ?? ''}
        isComplete={isComplete}
      />
      <Separator orientation="vertical" />
      <PageTitlebarButtonGroup side="left" className="flex grow flex-row justify-between">
        <div className="flex flex-row items-center space-x-4">
          <SpeedControls />
          <Separator orientation="vertical" />
          <ColumnMapperDialog />
        </div>
        <div className="">
          <DownloadButton sheet={sheet} />
          <InfoModal />
        </div>
      </PageTitlebarButtonGroup>
    </PageTitlebar>
  )
}

function SpeedControls() {
  const { data: speed } = trpc.automation.state.speed.useSubscription()
  const { mutateAsync: changeSpeed } = trpc.automation.changeSpeed.useMutation()

  return (
    <div role="group" className="flex flex-col items-center justify-between space-y-1">
      <ButtonGroup className="text-muted-foreground">
        <Button
          onClick={() => changeSpeed({ speed: 'slow' })}

          variant={speed === 'slow' ? 'default' : 'secondary'}
          size="lg"
          className={'w-12 text-xs'}
        >
          0.5x
        </Button>
        <Button
          onClick={() => changeSpeed({ speed: 'normal' })}
          variant={speed === 'normal' ? 'default' : 'secondary'}
          size="lg"
          className={'w-12 text-xs'}
        >
          1x
        </Button>
        <Button
          onClick={() => changeSpeed({ speed: 'max' })}
          variant={speed === 'max' ? 'default' : 'secondary'}
          size="lg"
          className={'w-12 text-xs'}
        >
          3x
        </Button>
      </ButtonGroup>
    </div>
  )
}

function DownloadButton({ sheet }: { sheet: TSheet | undefined }) {
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

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={() => downloadSheet()}
        render={<Button variant="ghost" aria-label="Export" />}
      >
        <DownloadIcon {...iconSizes.medium} />
      </TooltipTrigger>
      <TooltipContent side="bottom">Export Sheet</TooltipContent>
    </Tooltip>
  )
}

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

  const variant = statusVariant[thisJobStatus ?? 'inactive']
  const iconStyle = statusIconStyles[thisJobStatus ?? 'inactive']
  return (
    <div className="line-clamp-1 flex w-72 flex-row items-center space-x-4 truncate">
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
