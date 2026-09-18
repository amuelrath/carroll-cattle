import { TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import React from 'react'
import { processIcons } from './_copy'

export function JobSidebar(): React.JSX.Element {
  const { data, isLoading } = trpc.process.fetchProcesses.useQuery()

  return (
    <aside className="h-full w-52 border-r p-1">
      <TabsList variant="ghost" className="w-full">
        {isLoading || !data ? (
          <JobSidebarSkeleton />
        ) : (
          data.map((process) => {
            const Icon = processIcons[process.id]
            return (
              <TabsTrigger
                key={process.id}
                className="group/trigger flex flex-row items-center space-x-1"
                value={process.id}
              >
                <div className="relative items-center justify-center">
                  <span className="bg-muted group-data-active/trigger:border-border absolute -top-1 -left-1 size-6 rounded-full group-data-active/trigger:border group-data-active/trigger:bg-white" />
                  <Icon
                    className="group-data-active/trigger:text-primary relative z-10"
                    size={iconSizes.medium.size}
                    strokeWidth={iconSizes.medium.strokeWidth}
                  />
                </div>
                <span>{process.name}</span>
              </TabsTrigger>
            )
          })
        )}
      </TabsList>
    </aside>
  )
}

function JobSidebarSkeleton() {
  return <aside className="h-full w-52 border-r p-1" />
}
