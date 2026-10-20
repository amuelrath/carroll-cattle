import { cn } from '@renderer/lib/utils'
import type { TJobStatus } from '@shared/db/schema'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, Pause, Play, Square } from 'lucide'
import { MorphIcon } from 'morphicons/react'
import * as React from 'react'

const VIEWBOX = 100
const CENTER = VIEWBOX / 2

const circularProgressVariants = cva(
  'relative transition-colors inline-flex shrink-0 items-center justify-center',
  {
    variants: {
      size: {
        sm: 'size-6',
        md: 'size-8',
        lg: 'size-10',
        xl: 'size-16'
      }
    },
    defaultVariants: {
      size: 'lg'
    }
  }
)

const trackVariants = cva('', {
  variants: {
    variant: {
      default: 'stroke-muted-foreground/20',
      okay: 'stroke-okay',
      muted: 'stroke-muted-foreground/20'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const indicatorVariants = cva('transition-[stroke-dashoffset] duration-500 ease-out', {
  variants: {
    variant: {
      default: 'stroke-primary',
      okay: 'stroke-okay-foreground',
      muted: 'stroke-muted-foreground'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

interface CircularProgressProps
  extends
    Omit<React.ComponentProps<'div'>, 'children'>,
    VariantProps<typeof circularProgressVariants>,
    VariantProps<typeof indicatorVariants> {
  value?: number
  /** Stroke width in viewBox units (viewBox is 100×100), scales with size */
  strokeWidth?: number
  children?: React.ReactNode
}

export function CircularProgress({
  value = 0,
  size,
  variant,
  strokeWidth = 8,
  className,
  children,
  ...props
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (VIEWBOX - strokeWidth) / 2

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(circularProgressVariants({ size }), className)}
      {...props}
    >
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="size-full -rotate-90">
        {/* Track */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className={trackVariants({ variant })}
        />
        {/* Progress */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - clamped}
          className={indicatorVariants({ variant })}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  )
}

const statusIconStyles = {
  active: 'fill-okay-foreground animate-pulse stroke-okay-foreground size-3.75',
  inactive: 'fill-muted-foreground stroke-muted-foreground size-3.75',
  paused: 'fill-muted-foreground animate-pulse stroke-muted-foreground size-3.75',
  complete: 'stroke-okay-foreground size-3.75 stroke-3'
}

const statusVariant = {
  active: 'okay',
  inactive: 'muted',
  paused: 'muted',
  complete: 'okay'
} as const

interface CircularProgressWithIndicatorProps {
  value: number
  status: TJobStatus
}

export function CircularProgressWithIndicator({
  value,
  status
}: CircularProgressWithIndicatorProps) {
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0
  const isComplete = safeValue >= 100

  const icon =
    isComplete ? Check
    : status === 'active' ? Play
    : status === 'paused' ? Pause
    : Square
  const variant = isComplete ? 'okay' : statusVariant[status === 'complete' ? 'active' : status]
  const styles = isComplete ? statusIconStyles['complete'] : statusIconStyles[status]

  return (
    <div className="relative flex flex-col items-center justify-center">
      <CircularProgress
        value={value}
        variant={isComplete ? 'okay' : variant}
        size="lg"
        strokeWidth={12}
      />
      <span className="absolute top-1/3">
        <MorphIcon icon={isComplete ? Check : icon} className={styles} />
      </span>
    </div>
  )
}
