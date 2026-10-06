import { cn } from '@renderer/lib/utils'
import React from 'react'

export function CircleGrid({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'absolute inset-0 z-10 h-full w-full bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,_#000_30%,_transparent_70%)] bg-[size:32px_32px]',
        className
      )}
    >
      {children}
    </div>
  )
}
