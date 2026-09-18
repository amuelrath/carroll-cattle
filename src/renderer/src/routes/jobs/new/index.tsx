import { NewJobPage } from '@renderer/pages/jobs'
import { ZProcessId } from '@shared/schemas/jobs'
import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { z } from 'zod'

const ZProcedureSearch = z.object({
  processId: ZProcessId.default('penguins')
})

export const Route = createFileRoute('/jobs/new/')({
  component: RouteComponent,
  staticData: {
    navLabel: 'New Procedure'
  },
  validateSearch: ZProcedureSearch
})

function RouteComponent(): React.JSX.Element {
  return <NewJobPage />
}
