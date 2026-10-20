import Folder from '@renderer/assets/folder.png'
import { EmptyState } from '@renderer/components/common/empty-state'
import { trpc } from '@renderer/lib/trpc'
import { JobItem } from '@renderer/pages/history/components/job-item/item'
import { dayLabel, daysAgo } from '@shared/lib/dates'
import type { TProcessId } from '@shared/schemas/jobs'
import React from 'react'

interface JobResultsProps {
  searchValue?: string
  processValue?: TProcessId
}

export function JobResults({ searchValue, processValue }: JobResultsProps): React.JSX.Element {
  const { data: jobs, isLoading } = trpc.job.readAllJobs.useQuery()

  // ToDo!!!!
  if (isLoading) return <></>
  if ((!isLoading && !jobs) || (jobs?.length || 0) < 1 || jobs === undefined) {
    return (
      <EmptyState
        title="No Jobs Found"
        desc="Jobs you create will appear here"
        Icon={<img src={Folder} alt="folder" className="size-20" />}
      />
    )
  }

  // sort by day
  const q = searchValue?.trim().toLowerCase() ?? ''

  const filtered = jobs.filter(
    (job) =>
      (!processValue || job.processId === processValue) &&
      (!q ||
        [job.process.name, job.file.fileName, job.file.sheetName, job.title].some((s) =>
          s.toLowerCase().includes(q)
        ))
  )

  if (filtered.length === 0) {
    return (
      <EmptyState
        title="No matching jobs"
        desc="Try a different search or filter"
        Icon={<img src={Folder} alt="folder" className="size-20" />}
      />
    )
  }

  const sortedGroups = Object.entries(Object.groupBy(filtered, (job) => daysAgo(job.createdAt)))
    .map(([days, items = []]) => ({
      days: Number(days),
      items: items.toSorted((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    }))
    .sort((a, b) => a.days - b.days)

  return (
    <div className="space-y-4">
      {sortedGroups.map(({ days, items }) => (
        <JobItemGroup key={days} when={dayLabel(days, items?.[0].createdAt || new Date())}>
          {items?.map((job) => (
            <JobItem key={job.id} job={job} />
          ))}
        </JobItemGroup>
      ))}
    </div>
  )
}

export function JobItemGroup({ when, children }: { when: string; children: React.ReactNode }) {
  return (
    <>
      <p className="text-muted-foreground text-xs font-bold capitalize">{when}</p>
      <section className="flex flex-col">
        {Array.isArray(children) &&
          children.map((Child) => (
            <>
              {Child}
              <hr />
            </>
          ))}
      </section>
    </>
  )
}
