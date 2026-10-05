import { IconCircle, type IconCircleProps } from '@renderer/components/common/icon-circle'
import { Button } from '@renderer/components/ui/button'
import { Item, ItemContent } from '@renderer/components/ui/item'
import { Separator } from '@renderer/components/ui/separator'
import { iconSizes } from '@renderer/lib/tokens'
import type { TProcessId } from '@shared/schemas/jobs'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  BotIcon,
  ClockIcon,
  GhostIcon,
  type LucideIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon
} from 'lucide-react'
import React from 'react'

export function ActiveSection(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-muted-foreground text-xs font-bold">In Progress</span>
      <NoActiveJobItem />
    </div>
  )
}

interface ActiveJobItemProps {
  // status of the most recent action
  status: Exclude<TStatus, 'complete'>
  processId?: TProcessId
  // ToDo: Row Tracking
}

function ActiveJobItem({ status }: ActiveJobItemProps) {
  let variant: Exclude<IconCircleProps['variant'], null | undefined> = 'okay'
  let icon: LucideIcon = PauseIcon
  switch (status) {
    case 'running':
      variant = 'okay'
      icon = PlayIcon
      break
    case 'paused':
      variant = 'warn'
      icon = PauseIcon
      break
    case 'failed':
      variant = 'destructive'
      icon = AlertTriangleIcon
      break
  }

  return (
    <Item className="shadow-sm" variant="muted" size="lg">
      <ItemContent className="flex flex-col space-y-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center space-x-2">
            <IconCircle Icon={icon} size="large" variant={variant} />
            <Separator orientation="vertical" />
            <div className="flex flex-col space-y-0.5">
              <span className="flex flex-row items-center space-x-2 text-base font-semibold">
                <span>Penguins</span>
              </span>
              <div className="flex flex-row items-center space-x-2 text-xs font-medium">
                <span className="text-muted-foreground">Row 8 of 32</span>
                <Separator orientation="vertical" />
                <span className="text-muted-foreground flex flex-row items-center gap-1.5">
                  <ClockIcon {...iconSizes.xsmall} />
                  <p>8m 32s remaining</p>
                </span>
              </div>
            </div>
          </div>
          <Button variant="okay" className="">
            Watch Live
          </Button>
        </div>
        {/*<Progress className="animate-pulse" variant={variant} value={70} />*/}
      </ItemContent>
    </Item>
  )
}

function NoActiveJobItem() {
  return (
    <Item variant="muted" className="shadow-sm" size="lg">
      <ItemContent className="flex flex-col space-y-2 pb-0.5">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center space-x-2">
            <IconCircle Icon={GhostIcon} size="large" variant="inverse" />
            <Separator orientation="vertical" />
            <div className="flex flex-col space-y-0.5">
              <span className="text-muted-foreground flex flex-row items-center space-x-2 text-base font-semibold">
                <span>No Active Job</span>
              </span>
            </div>
          </div>
          <Link to="/jobs/new">
            <Button>
              <NewJobIcon />
              New Job
            </Button>
          </Link>
        </div>
        {/*<Progress variant="okay" value={0} />*/}
      </ItemContent>
    </Item>
  )
}

function NewJobIcon(): React.JSX.Element {
  return (
    <BotIcon className="size-6" viewBox="-4 1   28 22">
      <rect x="7" y="12" width="10" height="4" fill="var(--primary)" stroke="none" />
      <PlusIcon x={7} y={9} {...iconSizes.xsmall} absoluteStrokeWidth />
    </BotIcon>
  )
}
