import { EmptyState } from '@renderer/components/common/empty-state'
import { cn } from '@renderer/lib/utils'
import { motion } from 'framer-motion'
import React from 'react'
import { useThisJobStatus } from '../../hooks/use-this-job-status'
import { PlayPauseButton, SlidingPanel, StopButton } from './controls'
import { FramePreview } from './frame'
import { Narrator } from './narrator'

export function Viewer(): React.JSX.Element {
  const { thisJobStatus } = useThisJobStatus()
  const isInactive = thisJobStatus !== 'active'

  return (
    <div className="@container-size flex h-full min-h-0 flex-1 flex-col items-center justify-start py-8 2xl:justify-center">
      <div className="border-border relative aspect-video w-[min(calc(100cqw*6/7),calc(100cqh*16/9))] overflow-hidden rounded-md border">
        <motion.div
          initial={{ y: isInactive ? -40 : 0 }}
          animate={{ y: isInactive ? -40 : 0 }}
          transition={{ ease: 'circInOut' }}
          className="bg-card/50 border-border absolute top-0 right-0 z-10 w-2/5 rounded-tr-md rounded-bl-md border-b border-l px-4 shadow-md backdrop-blur-md 2xl:w-1/3"
        >
          <Narrator />
        </motion.div>
        <div className="bg-muted absolute inset-0 overflow-hidden rounded-md">
          <FramePreview />
          <div className="pointer-events-none flex h-full w-full grow flex-col justify-center outline drop-shadow-xs">
            <EmptyState title="Press Play to Start" desc="" />
          </div>
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
              <SlidingPanel side="right" open={thisJobStatus && thisJobStatus !== 'inactive'}>
                <StopButton />
              </SlidingPanel>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
