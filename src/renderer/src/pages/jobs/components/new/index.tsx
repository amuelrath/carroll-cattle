import { Page, PageContent, PageSidebar } from '@renderer/components/common/page'
import { Tabs } from '@renderer/components/ui/tabs'
import type { TProcessId } from '@shared/schemas/jobs'
import { useNavigate, useSearch } from '@tanstack/react-router'
import React from 'react'
import { JobContent } from './components/content'
import { JobSidebar } from './components/sidebar'

export function NewJobPage(): React.JSX.Element {
  const { processId } = useSearch({ from: '/jobs/' })
  const navigate = useNavigate({ from: '/jobs/' })

  const handleTabChange = async (tabId: TProcessId) => {
    await navigate({ search: (prev) => ({ ...prev, processId: tabId }), replace: true })
  }
  return (
    <Page>
      <Tabs
        value={processId}
        onValueChange={handleTabChange}
        className="w-full gap-0"
        orientation="vertical"
      >
        <PageSidebar>
          <JobSidebar />
        </PageSidebar>
        <PageContent>
          <JobContent processId={processId} />
        </PageContent>
      </Tabs>
    </Page>
  )
}
