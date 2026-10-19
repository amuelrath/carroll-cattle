import { Page, PageContent } from '@renderer/components/common/page'
import React from 'react'
import { AutomationsSection } from './components/automations'

export function JobsPage(): React.JSX.Element {
  return (
    <Page className="flex-col space-y-4">
      <PageContent className="flex-0">
        <ActiveSection />
      </PageContent>
      <PageContent>
        <RecentSection />
      </PageContent>
    </Page>
  )
}
