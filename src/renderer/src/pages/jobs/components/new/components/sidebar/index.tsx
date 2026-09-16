import { TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { iconSizes } from '@renderer/lib/tokens'
import { PROCESS_COPY } from '@shared/resources/strings'
import React from 'react'

export function JobSidebar(): React.JSX.Element {
  return (
    <aside className="h-full w-52 border-r p-1">
      <TabsList variant="ghost" className="w-full">
        {Object.entries(PROCESS_COPY).map(([k, { name, Icon }]) => (
          <TabsTrigger
            key={k}
            className="group/trigger flex flex-row items-center space-x-1"
            value={k}
          >
            <div className="relative items-center justify-center">
              <span className="bg-muted group-data-active/trigger:border-border absolute -top-1 -left-1 size-6 rounded-full group-data-active/trigger:border group-data-active/trigger:bg-white" />
              <Icon
                className="group-data-active/trigger:text-primary relative z-10"
                size={iconSizes.medium.size}
                strokeWidth={iconSizes.medium.strokeWidth}
              />
            </div>
            <span>{name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </aside>
  )
}
