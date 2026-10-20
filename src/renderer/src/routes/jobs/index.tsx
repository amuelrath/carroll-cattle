import { JobsPage } from '@renderer/pages/jobs'
import { createFileRoute } from '@tanstack/react-router'
import { BotIcon } from 'lucide-react'
import React from 'react'

export const Route = createFileRoute('/jobs/')({
  component: RouteComponent,
  staticData: {
    icon: BotIcon,
    navOrder: 0,
    navLabel: 'Jobs'
  }
})

function RouteComponent(): React.JSX.Element {
  return <JobsPage />
}
