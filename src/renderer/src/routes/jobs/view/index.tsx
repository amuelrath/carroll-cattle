import { ViewPage } from '@renderer/pages/jobs'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const ZContextTabs = z.enum(['details', 'validation', 'issues']).default('details')
const ZMainTab = z.enum(['sheet', 'automation']).default('automation')
const ZSummarySearch = z.object({
  jobId: z.number(),
  contextTab: ZContextTabs,
  mainTab: ZMainTab
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
