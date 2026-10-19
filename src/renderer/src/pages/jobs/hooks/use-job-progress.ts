import { trpc } from '@renderer/lib/trpc'
import { useMemo } from 'react'

export function useJobProgress({ jobId }: { jobId: number }) {
  const { data } = trpc.job.readJobWithTasks.useQuery({ jobId })

  return useMemo(() => {
    const tasks = data?.tasks ?? []
    if (tasks.length === 0) return 0
    const numComplete = tasks.filter((t) => t.status === 'done').length
    return (numComplete / tasks.length) * 100
  }, [data])
}
