import { cn } from '@renderer/lib/utils'
import { motion } from 'framer-motion'
import React, { type Ref } from 'react'

interface PageProps {
  children: React.ReactNode
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export function Page({
  children,
  className,
  direction = 'horizontal'
}: PageProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'ap-2 flex h-full p-4',
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        'has-data-[slot=sidebar]:gap-0 has-data-[slot=sidebar]:p-0 has-data-[slot=titlebar]:gap-0 has-data-[slot=titlebar]:p-0',
        className
      )}
    >
      {children}
    </div>
  )
}

interface PageSidebarProps {
  children: React.ReactNode
  className?: string
  side?: 'left' | 'right'
  ref?: Ref<HTMLDivElement>
}

export function PageSidebar({ children, className, ref, side = 'left' }: PageSidebarProps) {
  return (
    <aside
      ref={ref}
      data-slot="sidebar"
      className={cn(
        'border-border z-20 flex h-full max-w-52 min-w-52 flex-1 flex-col overflow-x-hidden p-2',
        side === 'left' ? 'border-r' : 'border-l',
        className
      )}
    >
      {children}
    </aside>
  )
}

interface PageSidebarSubProps {
  children?: React.ReactElement
  className?: string
  // side?: 'left' | 'right'
  open?: boolean
}

export function PageSidebarSub({ children, className }: PageSidebarSubProps) {
  return (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: '0%' }}
      transition={{ ease: 'circOut', duration: 0.15 }}
      data-slot="sidebar-sub"
      className={cn(
        'border-border bg-muted z-0 flex h-full max-w-52 min-w-52 flex-1 flex-col overflow-x-hidden p-2',
        'border-r',
        className
      )}
    >
      {children}
    </motion.aside>
  )
}

interface PageContentProps {
  children: React.ReactNode
  className?: string
  ref?: React.Ref<HTMLDivElement>
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
}

export function PageContent({ children, className, ref, onScroll }: PageContentProps) {
  return (
    <div
      ref={ref}
      onScroll={onScroll}
      data-slot="content"
      className={cn('flex min-w-0 flex-1 flex-col', className)}
    >
      {children}
    </div>
  )
}

interface PageTitlebarProps {
  children: React.ReactNode
  className?: string
}

interface PageTitlebarButtonGroupProps {
  children: React.ReactNode
  className?: string
  side?: 'right' | 'left'
}

export function PageTitlebar({ children, className }: PageTitlebarProps) {
  return (
    <div
      data-slot="titlebar"
      className={cn(
        'flex h-20 w-full items-center gap-2 border-b px-4 py-1.5 text-base font-semibold',
        className
      )}
    >
      {children}
    </div>
  )
}

export function PageTitlebarButtonGroup({
  children,
  className,
  side = 'right'
}: PageTitlebarButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      data-side={side}
      className={cn(
        'flex flex-row items-center gap-2',
        'data-[side=right]:ml-auto',
        'data-[side=left]:order-second',
        className
      )}
    >
      {children}
    </div>
  )
}
