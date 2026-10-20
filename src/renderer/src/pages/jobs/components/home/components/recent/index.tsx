import Folder from '@renderer/assets/folder.png'
import { EmptyState } from '@renderer/components/common/empty-state'
import { Button } from '@renderer/components/ui/button'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import { cn } from '@renderer/lib/utils'
import { recentCopy as copy } from '@renderer/pages/jobs/components/home/components/recent/_copy'
import { useJobProgress } from '@renderer/pages/jobs/hooks/use-job-progress'
import type { TJobStatus } from '@shared/db/schema'
import type { TReadAllJobsRes } from '@shared/schemas/trpc'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClockIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  PauseIcon
} from 'lucide-react'
import React from 'react'

export function RecentSection(): React.JSX.Element {
  const { data, isLoading } = trpc.job.readRecentJobs.useQuery()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="bg-card flex flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">Recent jobs</h2>
            <p className="text-muted-foreground text-xs">Your latest processing runs</p>
          </div>
          <Link to="/history">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
              See history
              <ArrowRightIcon {...iconSizes.xsmall} />
            </Button>
          </Link>
        </header>

        <div className="scrollbar-custom">
          {isLoading ?
            <></>
          : !data || data.length < 1 ?
            <NoRecentJobs />
          : <RecentSectionBody jobs={data} />}
        </div>
      </section>
    </div>
  )
}

export function RecentSectionBody({ jobs }: { jobs: TReadAllJobsRes }) {
  return (
    <ul className={cn('divide-y transition-opacity')}>
      {jobs.map((job) => (
        <li key={job.id}>
          <JobItem
            id={job.id}
            status={job.status}
            processName={job.process.name}
            fileName={job.file.fileName}
            sheetName={job.file.sheetName}
          />
        </li>
      ))}
    </ul>
  )
}

interface JobItemProps {
  id: number
  status: TJobStatus
  processName: string
  fileName: string
  sheetName: string
}

function JobItem({ id, status, processName, fileName, sheetName }: JobItemProps) {
  const percent = useJobProgress({ jobId: id })
  const navigate = useNavigate()
  const isRunning = status === 'active'

  return (
    <button
      type="button"
      onClick={() => navigate({ to: '/jobs/view', search: { jobId: id } })}
      className="group hover:bg-muted/60 focus-visible:bg-muted/60 flex h-17 w-full items-center gap-3 px-4 text-left transition-colors outline-none"
    >
      {/* File icon */}
      <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <FileSpreadsheetIcon className="size-4" />
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium">{fileName}</p>
        <p className="text-muted-foreground truncate text-xs">
          {sheetName}
          <span className="mx-1.5">·</span>
          {processName}
        </p>
        {isRunning && (
          <div className="bg-muted mt-1 h-1 w-full max-w-48 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-300"
              style={{ width: `${percent ?? 0}%` }}
            />
          </div>
        )}
      </div>

      {/* Status + chevron */}
      <StatusBadge status={status} percent={isRunning ? percent : undefined} />
      <ChevronRightIcon className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}

const statusStyles: Partial<
  Record<TJobStatus, { label: string; className: string; Icon: typeof ClockIcon; spin?: boolean }>
> = {
  active: {
    label: 'Running',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Icon: Loader2Icon,
    spin: true
  },
  paused: {
    label: 'Paused',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Icon: PauseIcon
  },
  complete: {
    label: 'Done',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2Icon
  }
}

function StatusBadge({ status, percent }: { status: TJobStatus; percent?: number }) {
  const s = statusStyles[status] ?? {
    label: String(status),
    className: 'bg-muted text-muted-foreground',
    Icon: ClockIcon
  }
  const { Icon } = s

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        s.className
      )}
    >
      <Icon className={cn('size-3', s.spin && 'animate-spin')} />
      {percent != null ? `${Math.round(percent)}%` : s.label}
    </span>
  )
}

function NoRecentJobs() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        title={copy.emptyTitle}
        desc={copy.emptyDescription}
        className="p-30"
        Icon={<img src={Folder} alt="folder" className="size-20" />}
      ></EmptyState>
    </div>
  )
}
