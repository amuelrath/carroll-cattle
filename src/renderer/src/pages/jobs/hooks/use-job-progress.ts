import { trpc } from '@renderer/lib/trpc'
import { useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'

export function useJobProgress() {
  const { jobId } = useSearch({ from: '/jobs/view/' })
  const { data } = trpc.job.fetchJobWithTasks.useQuery({ jobId })

  return useMemo(() => {
    const numTasks = data?.tasks.length || 0
    const numComplete = data?.tasks.filter((t) => t.status === 'done')?.length || 0
    return (numComplete / numTasks) * 100
  }, [data])
}
