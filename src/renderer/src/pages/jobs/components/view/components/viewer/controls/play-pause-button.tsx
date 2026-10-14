import { Button } from '@renderer/components/ui/button'
import { trpc } from '@renderer/lib/trpc'
import { useThisJobStatus } from '@renderer/pages/jobs/components/view/hooks/use-this-job-status'
import { motion } from 'framer-motion'
import { Pause, Play, Power } from 'lucide'
import { MorphIcon } from 'morphicons/react'
import React from 'react'

const MotionButton = motion(Button)

const icons = {
  active: Pause,
  inactive: Power,
  paused: Play
} as const

const iconStyles = {
  active: 'size-6 fill-white stroke-white',
  paused: 'size-6 fill-white stroke-white',
  inactive: 'size-6 stroke-white'
} as const

export function PlayPauseButton(): React.JSX.Element {
  const { jobId, currJobId, thisIsCurrentJob, thisJobStatus } = useThisJobStatus()

  const { mutateAsync: mutateStart } = trpc.automation.start.useMutation()
  const { mutateAsync: mutatePause } = trpc.automation.pause.useMutation()
  const { mutateAsync: mutateResume } = trpc.automation.resume.useMutation()

  const canStart = !currJobId
  if (currJobId && !thisIsCurrentJob) {
    return <p>anotha job running</p>
  }

  const handleClick = () => {
    if (canStart) return mutateStart({ jobId })
    if (thisJobStatus === 'active') return mutatePause()
    if (thisJobStatus === 'paused') return mutateResume()
    return
  }

  return (
    <div className="relative">
      <MotionButton
        onClick={handleClick}
        className="relative z-20 size-14 -translate-x-1/2 rounded-full"
      >
        <MorphIcon icon={icons[thisJobStatus]} className={iconStyles[thisJobStatus]} />
      </MotionButton>
      <div className="bg-background absolute top-0 z-10 size-14 -translate-x-1/2 rounded-full" />
    </div>
  )
}
