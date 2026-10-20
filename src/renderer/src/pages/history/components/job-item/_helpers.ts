import type { TSelectTask } from '@shared/db/schema'
import { formatDuration } from 'date-fns'

export function getJobDuration({ tasks }: { tasks: TSelectTask[] }) {
  if (tasks.length === 0 || !tasks.every((t) => t.status === 'done')) {
    return 'Not Completed'
  }

  const totalMs = tasks.reduce((sum, { startedAt, completedAt }) => {
    if (!startedAt || !completedAt) {
      throw new Error('A task marked "done" is missing a start or end time.')
    }
    return sum + (new Date(completedAt).getTime() - new Date(startedAt).getTime())
  }, 0)

  const totalSeconds = Math.floor(totalMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return formatDuration({ minutes, seconds }) || 'Less than a second'
}
