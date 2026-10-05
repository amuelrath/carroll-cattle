import { Page, PageContent } from '@renderer/components/common/page'
import React from 'react'
import { ActiveSection } from './components/active'
import { RecentSection } from './components/recent'

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
