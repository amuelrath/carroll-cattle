import { trpc } from '@renderer/lib/trpc'
import type { TJobStatus } from '@shared/db/schema'
import { useSearch } from '@tanstack/react-router'

type UseThisJobStatus = () => {
  /* The status stored in AutomationService state IF thisIsCurrentJob, else 'inactive' */
  thisJobStatus: TJobStatus
  thisIsCurrentJob: boolean
  /* JobId stored in AutomationService state */
  currJobId: number | undefined
  /* Search parameter */
  jobId: number
}

export const useThisJobStatus: UseThisJobStatus = () => {
  const jobId = useSearch({ select: (p) => p.jobId, from: '/jobs/view/' })
  const { data: currJobId } = trpc.automation.state.jobId.useSubscription()
  const { data: currStatus } = trpc.automation.state.status.useSubscription()

  const thisIsCurrentJob = currJobId === jobId
  const thisJobStatus = thisIsCurrentJob ? (currStatus ?? 'inactive') : 'inactive'
  return {
    thisJobStatus,
    thisIsCurrentJob,
    currJobId,
    jobId
  }
}
