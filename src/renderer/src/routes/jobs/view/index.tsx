import { ViewPage } from '@renderer/pages/jobs'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const ZSummarySearch = z.object({
  jobId: z.number()
})

export const Route = createFileRoute('/jobs/view/')({
  component: RouteComponent,
  staticData: {
    navLabel: 'View'
  },
  validateSearch: ZSummarySearch
})

function RouteComponent() {
  return <ViewPage />
}
