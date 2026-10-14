import { ViewPage } from '@renderer/pages/jobs'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const ZContextTabs = z.enum(['details', 'validation', 'issues']).default('validation')

const ZSummarySearch = z.object({
  jobId: z.number(),
  contextTab: ZContextTabs
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
