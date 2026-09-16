import { trpc } from '@renderer/lib/trpc'
import { useNavigate } from '@tanstack/react-router'

export function useCreateJobMutation() {
  const navigate = useNavigate()

  const { mutateAsync: mutateCreateJob } = trpc.job.create.useMutation({
    onSuccess: async ({ jobId }) => {
      await navigate({ to: '/jobs/summary', search: { jobId }, replace: true })
    }
  })

  return {
    mutateCreateJob
  }
}
