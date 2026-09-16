import { SummaryPage } from '@renderer/pages/jobs'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const ZSummarySearch = z.object({
  jobId: z.number()
})

export const Route = createFileRoute('/jobs/summary/')({
  component: RouteComponent,
  staticData: {
    navLabel: 'Summary'
  },
  validateSearch: ZSummarySearch
})

function RouteComponent() {
  return <SummaryPage />
}
