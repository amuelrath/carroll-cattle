import { IconCircle } from '@renderer/components/common/icon-circle'
import { Button } from '@renderer/components/ui/button'
import { Table, TableBody, TableCell, TableRow } from '@renderer/components/ui/table'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import type { TGetAllJobsWithProcessAndFileResponse } from '@shared/schemas/trpc'
import { Link } from '@tanstack/react-router'
import { formatDate } from 'date-fns'
import { ArrowRightIcon, GhostIcon } from 'lucide-react'
import React from 'react'

export function RecentSection(): React.JSX.Element {
  const { data, isLoading } = trpc.job.fetchAllJobs.useQuery()

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <span className="text-muted-foreground/80 text-xs font-bold">Recent</span>
        <Button variant="link" className="text-muted-foreground/80 text-xs font-bold">
          See History
          <ArrowRightIcon {...iconSizes.xsmall} />
        </Button>
      </div>
      {isLoading || !data ?
        <NoRecentJobs />
      : <RecentSectionBody jobs={data} />}
    </div>
  )
}

export function RecentSectionBody({ jobs }: { jobs: TGetAllJobsWithProcessAndFileResponse }) {
  return (
    <Table className="text-xs">
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id} className="hover:bg-transparent">
            <TableCell>Untitled</TableCell>
            <TableCell>{job.process.name}</TableCell>
            <TableCell>{job.status}</TableCell>
            <TableCell>{formatDate(job.createdAt, 'MMM dd, h:mm b')}</TableCell>
            <TableCell className="text-end">
              <Link to="/jobs/view" search={{ jobId: job.id }}>
                <Button variant="outline" size="sm">
                  <ArrowRightIcon {...iconSizes.medium} />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function NoRecentJobs() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <IconCircle Icon={GhostIcon} size="xlarge" variant="inverse" />
      <div>
        <p className="text-lg font-semibold">No Recent Jobs</p>
        <p className="text-muted-foreground text-base">Jobs you start will be shown here</p>
      </div>
    </div>
  )
}
