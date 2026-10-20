import { SlotMachine } from '@renderer/components/common/slot-machine'
import { trpc } from '@renderer/lib/trpc'
import { useThisJobStatus } from '@renderer/pages/jobs/components/view/hooks/use-this-job-status'
import React from 'react'

// ToDo: Clean this up.
export function Narrator(): React.JSX.Element {
  const { thisJobStatus, thisIsCurrentJob, currJobId } = useThisJobStatus()
  const { data: text } = trpc.automation.state.narration.useSubscription()

  const getLabel = () => {
    if (currJobId && !thisIsCurrentJob) return 'Another Job is Active'
    if (thisJobStatus === 'paused') return ''
    if (thisJobStatus !== 'inactive' && text) return text
    return ''
  }
  const label = getLabel()

  return (
    <div className="relative h-6 overflow-hidden lg:h-8">
      <div className="text-primary absolute line-clamp-1 flex w-full flex-row items-center justify-end truncate text-sm font-medium lg:text-lg">
        <span className="h-6 lg:h-7">
          {!['Paused', 'Another Job is Active'].includes(label) ?
            <SlotMachine label={label} className={'shimmer'} />
          : label}
        </span>
      </div>
    </div>
  )
}
