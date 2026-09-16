import { Tabs } from '@renderer/components/ui/tabs'
import type { TJobKey } from '@shared/schemas/jobs'
import { useNavigate, useSearch } from '@tanstack/react-router'
import React from 'react'
import { JobContent } from './components/content'
import { JobSidebar } from './components/sidebar'

export function NewJobPage(): React.JSX.Element {
  const { jobTab } = useSearch({ from: '/jobs/new/' })
  const navigate = useNavigate({ from: '/jobs/new/' })

  const handleTabChange = async (tabId: TJobKey) => {
    await navigate({ search: (prev) => ({ ...prev, jobTab: tabId }) })
  }
  return (
    <Tabs
      value={jobTab}
      onValueChange={handleTabChange}
      className="h-full gap-0"
      orientation="vertical"
    >
      <JobSidebar />
      <JobContent jobKey={jobTab} />
    </Tabs>
  )
}
