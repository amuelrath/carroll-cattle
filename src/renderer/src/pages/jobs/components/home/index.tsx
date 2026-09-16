import React from 'react'
import { ActiveJobsSection } from './components/active-jobs-section'
import { HistoryOverviewSection } from './components/history-overview-section'

export function JobsPage(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-1 flex-col space-y-4">
        <ActiveJobsSection />
        <HistoryOverviewSection />
      </div>
    </div>
  )
}
