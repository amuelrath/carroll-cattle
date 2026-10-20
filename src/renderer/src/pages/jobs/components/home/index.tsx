import { Page, PageContent } from '@renderer/components/common/page'
import React from 'react'
import { AutomationsSection } from './components/automations'

export function JobsPage(): React.JSX.Element {
  return (
    <Page className="flex min-h-0 flex-1 flex-col gap-4">
      <PageContent className="flex-none">
        <AutomationsSection />
      </PageContent>
    </Page>
  )
}
