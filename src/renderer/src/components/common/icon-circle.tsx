import { iconSizes } from '@renderer/lib/tokens'
import { cn } from '@renderer/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { LucideIcon } from 'lucide-react'
import React from 'react'

const iconCircleVariants = cva(
  'relative aspect-square inline-flex items-center border border-border justify-center rounded-full ',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        inverse: 'bg-white',
        destructive: 'bg-destructive border-destructive-foreground text-destructive-foreground',
        warn: 'bg-warn text-warn-foreground border-warn-foreground',
        okay: 'bg-okay text-okay-foreground border-okay-foreground'
      },
      size: {
        xsmall: 'size-4',
        small: 'size-6',
        medium: 'size-8',
        large: 'size-10',
        xlarge: 'size-14'
      }
    },
    defaultVariants: {
      size: 'medium',
      variant: 'default'
    }
  }
)

export interface IconCircleProps extends VariantProps<typeof iconCircleVariants> {
  Icon: LucideIcon
  size: keyof typeof iconSizes
  className?: string
}

export function IconCircle({
  Icon,
  size = 'medium',
  className,
  variant
}: IconCircleProps): React.JSX.Element {
  const { size: iconSize, strokeWidth } = iconSizes[size]

  return (
    <div className={cn(iconCircleVariants({ size, variant }), className)}>
      <Icon size={iconSize} strokeWidth={strokeWidth} className={cn('relative z-10')} />
    </div>
  )
}
