import { NewJobPage } from '@renderer/pages/jobs'
import { ZProcessId } from '@shared/schemas/jobs'
import { createFileRoute } from '@tanstack/react-router'
import { BotIcon } from 'lucide-react'
import React from 'react'
import { z } from 'zod'

const ZProcedureSearch = z.object({
  processId: z.union([ZProcessId]).default('pregCheck')
})

export const Route = createFileRoute('/jobs/')({
  component: RouteComponent,
  staticData: {
    navLabel: 'New Procedure',
    navOrder: 0,
    icon: BotIcon
  },
  validateSearch: ZProcedureSearch
})

function RouteComponent(): React.JSX.Element {
  return <NewJobPage />
}
