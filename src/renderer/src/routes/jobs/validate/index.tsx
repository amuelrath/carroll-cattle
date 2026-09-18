import { ValidatePage } from '@renderer/pages/jobs'
import { ZProcessId } from '@shared/schemas/jobs'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const ZValidateSearch = z.object({
  processId: ZProcessId,
  filePath: z.string().min(1),
  sheetName: z.string().min(1),
  columnMap: z.record(z.string(), z.string())
})

export const Route = createFileRoute('/jobs/validate/')({
  component: RouteComponent,
  staticData: {
    navLabel: 'Validate'
  },
  validateSearch: ZValidateSearch
})

function RouteComponent() {
  return <ValidatePage />
}
