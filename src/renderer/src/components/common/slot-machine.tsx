import { cn } from '@renderer/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { memo } from 'react'

interface SlotMachineProps {
  label: string
  className?: string
}

export const SlotMachine = memo(function ({ label, className }: SlotMachineProps) {
  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={label}
          className={cn(className)}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30, duration: 0.15 }}
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  )
})

SlotMachine.displayName = 'SlotMachine'
