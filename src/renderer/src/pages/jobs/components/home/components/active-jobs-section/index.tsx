import { IconCircle, type IconCircleProps } from '@renderer/components/common/icon-circle'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Item, ItemContent } from '@renderer/components/ui/item'
import { Progress } from '@renderer/components/ui/progress'
import { Separator } from '@renderer/components/ui/separator'
import { iconSizes } from '@renderer/lib/tokens'
import type { TStatus } from '@shared/db/schema'
import type { TJobKey } from '@shared/schemas/jobs'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BotIcon,
  ClockIcon,
  GhostIcon,
  type LucideIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon
} from 'lucide-react'
import React from 'react'

export function ActiveJobsSection(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground flex flex-row items-center justify-between text-xs font-bold">
          <span>In progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ActiveJobItem status="running" />
      </CardContent>
      <CardFooter>
        <Link to="/jobs/new">
          <Button className="w-32" size="lg">
            <NewJobIcon />
            <span>New Job</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

interface ActiveJobItemProps {
  // status of the most recent action
  status: Exclude<TStatus, 'complete'>
  jobKey: TJobKey
  // ToDo: Row Tracking
}

function ActiveJobItem({ status, jobKey }: ActiveJobItemProps) {
  let variant: Exclude<IconCircleProps['variant'], null | undefined>
  let icon: LucideIcon
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
    <Item variant="muted" size="md">
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
          <Button variant="link" className="text-primary">
            Watch Live
            <ArrowRightIcon {...iconSizes.small} />
          </Button>
        </div>
        <Progress className="animate-pulse" variant={variant} value={70} />
      </ItemContent>
    </Item>
  )
}

function NoActiveJobItem() {
  return (
    <Item variant="muted" size="md">
      <ItemContent className="flex flex-col space-y-2">
        <div className="flex flex-row items-center space-x-2">
          <IconCircle Icon={GhostIcon} size="large" variant="inverse" />
          <Separator orientation="vertical" />
          <div className="flex flex-col space-y-0.5">
            <span className="text-muted-foreground flex flex-row items-center space-x-2 text-base font-semibold">
              <span>No Active Job</span>
            </span>
          </div>
        </div>
        {/* for spacing */}
        <Progress className="" value={0} />
      </ItemContent>
    </Item>
  )
}

function NewJobIcon(): React.JSX.Element {
  return (
    <BotIcon className="size-7" viewBox="-4 -4 32 32">
      <rect x="7" y="12" width="10" height="4" fill="var(--primary)" stroke="none" />
      <PlusIcon x={7} y={9} {...iconSizes.xsmall} absoluteStrokeWidth />
    </BotIcon>
  )
}
