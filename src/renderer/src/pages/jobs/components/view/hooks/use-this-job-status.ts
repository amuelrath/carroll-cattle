import { trpc } from '@renderer/lib/trpc'
import type { TJobStatus } from '@shared/db/schema'
import type { TSpeed } from '@shared/schemas/trpc'
import { useSearch } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'

/* Last known AutomationService state. Lives outside React so the first render after
 * a remount matches what was showing, instead of flashing 'inactive'. */
type Snapshot = {
  jobId?: number
  status?: TJobStatus
  speed?: TSpeed
  hasJobId: boolean
  hasStatus: boolean
}

let snapshot: Snapshot = { hasJobId: false, hasStatus: false }
const listeners = new Set<() => void>()

const setSnapshot = (patch: Partial<Snapshot>) => {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const getSnapshot = () => snapshot

type UseThisJobStatus = () => {
  /* The status stored in AutomationService state IF thisIsCurrentJob, else 'inactive'.
   * undefined until the first values have been received. */
  thisJobStatus: TJobStatus
  thisIsCurrentJob: boolean
  /* JobId stored in AutomationService state */
  currJobId: number | undefined
  /* Search parameter */
  jobId: number
}

export const useThisJobStatus: UseThisJobStatus = () => {
  const jobId = useSearch({ select: (p) => p.jobId, from: '/jobs/view/' })

  trpc.automation.state.jobId.useSubscription(undefined, {
    onData: (d) => setSnapshot({ jobId: d, hasJobId: true })
  })
  trpc.automation.state.status.useSubscription(undefined, {
    onData: (d) => setSnapshot({ status: d, hasStatus: true })
  })

  const s = useSyncExternalStore(subscribe, getSnapshot)

  const currJobId = s.jobId
  const thisIsCurrentJob = currJobId === jobId
  const speed = s.speed
  const thisJobStatus =
    !s.hasJobId || !s.hasStatus ? 'inactive'
    : thisIsCurrentJob ? (s.status ?? 'inactive')
    : 'inactive'

  return { thisJobStatus, thisIsCurrentJob, currJobId, jobId, speed }
}
