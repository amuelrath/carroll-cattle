import { cn } from '@renderer/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

interface SlidingPanelProps {
  side: 'left' | 'right'
  open: boolean
  children: React.ReactNode
}

const containerStyles = {
  left: '-translate-x-[100%]',
  right: ''
}

const sliderStyles = {
  left: 'rounded-l-md justify-start',
  right: 'rounded-r-md justify-end'
}

const animateStyles = {
  left: '100%',
  right: '-100%'
}

export function SlidingPanel({ side, open = false, children }: SlidingPanelProps) {
  return (
    <div
      className={cn(
        'absolute bottom-1/2 z-0 w-24 origin-center translate-y-1/2 overflow-hidden',
        containerStyles[side]
      )}
    >
      <AnimatePresence initial={false}>
        <motion.div
          animate={{ x: open ? '0%' : animateStyles[side] }}
          transition={{ ease: 'circInOut' }}
          className="relative"
        >
          <div
            className={cn(
              'text-primary flex h-12 flex-row items-center py-0.5 pr-4 font-semibold',
              sliderStyles[side],
              'bg-card/50 border-border border backdrop-blur-xl'
            )}
          >
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
