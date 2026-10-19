import Magnify from '@renderer/assets/magnify.png'
import TestTube from '@renderer/assets/test-tube.png'
import { Badge } from '@renderer/components/ui/badge'
import { Spinner } from '@renderer/components/ui/spinner'
import { iconSizes } from '@renderer/lib/tokens'
import { getJobDuration } from '@renderer/pages/history/components/job-item/_helpers'
import { JobProvider, useJobItem } from '@renderer/pages/history/components/job-item/context'
import { JobDropdown } from '@renderer/pages/history/components/job-item/menu'
import type { TJobStatus } from '@shared/db/schema'
import type { TProcessId } from '@shared/schemas/jobs'
import type { TReadAllJobsRes } from '@shared/schemas/trpc'
import { Link } from '@tanstack/react-router'
import { CheckIcon, ClockIcon, FileTextIcon, PauseIcon, SquareIcon } from 'lucide-react'
import React from 'react'

export function JobItem({ job }: { job: TReadAllJobsRes[number] }): React.JSX.Element {
  return (
    <JobProvider job={job}>
      <div className="group hover:bg-muted/80 grid w-full grid-cols-2 p-4 transition-colors">
        <div className="">
          <Link to="/jobs/view" search={{ jobId: job.id }}>
            <div className="flex flex-row items-center space-x-4">
              <JobIcon />
              <JobTitle />
            </div>
          </Link>
        </div>
        <div className="flex flex-row items-center space-x-4 justify-self-end">
          <JobStatus />
          <JobDropdown />
        </div>
      </div>
    </JobProvider>
  )
}

const processIcons = {
  breeding: TestTube,
  pregCheck: Magnify
} satisfies Record<TProcessId, string>

function JobIcon() {
  const {
    job: { processId }
  } = useJobItem()
  const src = processIcons[processId]
  return (
    <div className="bg-muted group-hover:bg-card flex aspect-square size-10 flex-col items-center justify-center rounded-lg transition-colors">
      <img src={src} alt="icon" className="transition-all group-hover:scale-150" />
    </div>
  )
}

function JobTitle() {
  const {
    job: { tasks, file, title }
  } = useJobItem()
  const duration = getJobDuration({ tasks })

  return (
    <div className="col-span-3 flex-col space-y-1 self-center">
      <p className="truncate text-sm font-medium">{title}</p>
      <div className="text-muted-foreground flex w-full flex-row items-center space-x-2 text-xs">
        <p className="flex flex-row items-center space-x-1">
          <FileTextIcon {...iconSizes.xsmall} />
          <p>{file.fileName}</p>
        </p>
        <p className="flex flex-row items-center space-x-1">
          <ClockIcon {...iconSizes.xsmall} />
          <p>{duration}</p>
        </p>
      </div>
    </div>
  )
}

const statusVariants = {
  active: {
    Icon: <Spinner />,
    variant: 'outline'
  },
  paused: {
    Icon: <PauseIcon {...iconSizes.xsmall} className="fill-yellow-600 stroke-yellow-600" />,
    label: 'Paused',
    variant: 'warn'
  },
  complete: {
    Icon: <CheckIcon {...iconSizes.xsmall} className="stroke-white stroke-6" />,
    variant: 'okay'
  },
  inactive: {
    Icon: <SquareIcon {...iconSizes.xsmall} className="fill-white" />,
    variant: 'default'
  }
} as const satisfies Record<TJobStatus, unknown>

function JobStatus() {
  const {
    job: { status }
  } = useJobItem()
  const { variant, Icon } = statusVariants[status]
  return (
    <Badge variant={variant} className="flex items-center self-center">
      <span>{Icon}</span>
    </Badge>
  )
}
