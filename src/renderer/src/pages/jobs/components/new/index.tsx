import { Tabs } from '@renderer/components/ui/tabs'
import type { TProcessId } from '@shared/schemas/jobs'
import { useNavigate, useSearch } from '@tanstack/react-router'
import React from 'react'
import { JobContent } from './components/content'
import { JobSidebar } from './components/sidebar'

export function NewJobPage(): React.JSX.Element {
  const { processId } = useSearch({ from: '/jobs/new/' })
  const navigate = useNavigate({ from: '/jobs/new/' })

  const handleTabChange = async (tabId: TProcessId) => {
    await navigate({ search: (prev) => ({ ...prev, processId: tabId }) })
  }
  return (
    <Tabs
      value={processId}
      onValueChange={handleTabChange}
      className="h-full gap-0"
      orientation="vertical"
    >
      <JobSidebar />
      <JobContent processId={processId} />
    </Tabs>
  )
}
