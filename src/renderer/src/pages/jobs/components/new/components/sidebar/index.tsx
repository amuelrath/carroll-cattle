import { CustomTabsTrigger, TabsList } from '@renderer/components/ui/tabs'
import { trpc } from '@renderer/lib/trpc'
import React from 'react'
import { processIcons } from './_copy'

export function JobSidebar(): React.JSX.Element {
  const { data, isLoading } = trpc.process.readAutomationProcesses.useQuery()

  return (
    <TabsList variant="ghost" className="w-full">
      {isLoading || !data ?
        <JobSidebarSkeleton />
      : data.map((process) => {
          const Icon = processIcons[process.id]
          return (
            <CustomTabsTrigger
              key={process.id}
              value={process.id}
              Icon={Icon}
              label={process.name}
            />
          )
        })
      }
    </TabsList>
  )
}

function JobSidebarSkeleton() {
  return <aside className="h-full w-52 border-r p-1" />
}
