import { trpc } from '@renderer/lib/trpc'
import { useNavigate } from '@tanstack/react-router'

export function useCreateJobMutation() {
  const navigate = useNavigate()
  const utils = trpc.useUtils()

  const { mutateAsync: mutateCreateJob } = trpc.job.create.useMutation({
    onSuccess: async ({ jobId }) => {
      await utils.job.fetchAllJobs.invalidate()
      await navigate({ to: '/jobs/view', search: { jobId }, replace: true })
    }
  })

  return {
    mutateCreateJob
  }
}
