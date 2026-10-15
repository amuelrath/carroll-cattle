import { Dot } from '@renderer/components/common/dot-background'
import { IconCircle } from '@renderer/components/common/icon-circle'
import { cn } from '@renderer/lib/utils'
import { useJobProgress } from '@renderer/pages/jobs/hooks/use-job-progress'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { CheckIcon, MonitorIcon } from 'lucide-react'
import React from 'react'
import { useThisJobStatus } from '../../hooks/use-this-job-status'
import { PlayPauseButton, SlidingPanel, StopButton } from './controls'
import { FramePreview } from './frame'
import { Narrator } from './narrator'

const MotionDot = motion.create(Dot)

export function Viewer(): React.JSX.Element {
  const { thisJobStatus } = useThisJobStatus()
  const percent = useJobProgress()
  const isInactive = thisJobStatus === 'inactive' || thisJobStatus === 'complete'
  const isPaused = thisJobStatus === 'paused'
  return (
    <div className="@container-size flex h-full min-h-0 flex-1 flex-col items-center justify-start py-8 2xl:justify-center">
      <div className="border-border relative aspect-video w-[min(calc(100cqw*6/7),calc(100cqh*16/9))] overflow-hidden rounded-md border">
        <motion.div
          initial={{ y: isInactive || isPaused ? -40 : 0 }}
          animate={{ y: isInactive || isPaused ? -40 : 0 }}
          transition={{ ease: 'circInOut' }}
          className="bg-card/50 border-border absolute top-0 right-0 z-10 w-2/5 rounded-tr-md rounded-bl-md border-b border-l px-4 shadow-md backdrop-blur-md 2xl:w-1/3"
        >
          <Narrator />
        </motion.div>
        <div className="bg-muted absolute inset-0 overflow-hidden rounded-md">
          <AnimatePresence initial={false} mode="wait">
            {isInactive ?
              <ViewerEmpty key="empty" isComplete={percent === 100} />
            : <FramePreview key="preview" />}
          </AnimatePresence>
        </div>
        <motion.div
          className="absolute bottom-0 w-full"
          animate={{ opacity: 1 }}
          transition={{ ease: 'circInOut' }}
        >
          <div
            className={cn(
              'flex flex-row justify-start rounded-b-md p-2 pt-6 transition-colors xl:px-4 xl:pb-4',
              thisJobStatus !== 'inactive' ?
                'from-primary/50 via-primary/30 bg-linear-to-t to-transparent'
              : 'bg-linear-to-t from-transparent to-transparent'
            )}
          >
            <div className="left-0 translate-x-1/2">
              <PlayPauseButton />
              <SlidingPanel side="right" open={thisJobStatus !== 'inactive'}>
                <StopButton />
              </SlidingPanel>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const ease = 'circInOut'

type Slide = { from: number; to: number; enter?: number; exit?: number }

const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { ease } },
  exit: { opacity: 0, transition: { ease } }
}

const slide: Variants = {
  initial: ({ from }: Slide) => ({ y: from, scale: 3 }),
  animate: ({ enter = 0.3 }: Slide) => ({ y: 0, scale: 1, transition: { ease, duration: enter } }),
  exit: ({ to, exit = 0.3 }: Slide) => ({ y: to, scale: 3, transition: { ease, duration: exit } })
}

function ViewerEmpty({ isComplete }: { isComplete: boolean }) {
  return (
    <MotionDot
      variants={fade}
      initial="initial"
      animate="animate"
      exit="exit"
      spacing={5}
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
    >
      <motion.span variants={slide} custom={{ from: -250, to: -250 }}>
        {isComplete ?
          <IconCircle Icon={CheckIcon} size="xlarge" variant="inverse" />
        : <IconCircle Icon={MonitorIcon} size="xlarge" variant="inverse" />}
      </motion.span>
      <motion.h2
        variants={slide}
        custom={{ from: 100, to: 150, enter: 0.4, exit: 0.4 }}
        className="text-primary text-lg font-bold"
      >
        {isComplete ? 'Job is Complete' : 'Browser is Inactive'}
      </motion.h2>
      <motion.p
        variants={slide}
        custom={{ from: 150, to: 200, enter: 0.4, exit: 0.3 }}
        className="font-medium"
      >
        {isComplete ?
          'All tasks are done. Check row details for proof.'
        : 'Start a session to see a live view'}
      </motion.p>
    </MotionDot>
  )
}
