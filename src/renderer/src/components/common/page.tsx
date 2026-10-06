import { cn } from '@renderer/lib/utils'
import { motion } from 'framer-motion'
import React from 'react'

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
  collapsed?: boolean
}

export function PageSidebar({
  children,
  className,
  side = 'left',
  collapsed = true
}: PageSidebarProps) {
  return (
    <motion.aside
      animate={{ x: collapsed ? '-80%' : '0%' }}
      data-slot="sidebar"
      className={cn(
        'border-border flex h-full max-w-52 min-w-52 flex-1 flex-col overflow-x-hidden p-2',
        side === 'left' ? 'border-r' : 'border-l',
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
      className={cn('flex flex-1 flex-col', className)}
    >
      {children}
    </div>
  )
}

interface PageTitlebarProps {
  children: React.ReactNode
  className?: string
}

export function PageTitlebar({ children, className }: PageTitlebarProps) {
  return (
    <div
      data-slot="titlebar"
      className={cn(
        'flex max-h-14 min-h-14 w-full border-b px-2 py-1.5 text-base font-semibold',
        'has-data-[slot=button-group]:flex-row has-data-[slot=button-group]:items-center has-data-[slot=button-group]:justify-between',
        className
      )}
    >
      {children}
    </div>
  )
}

interface PageTitlebarButtonGroupProps {
  children: React.ReactNode
  className?: string
}

export function PageTitlebarButtonGroup({ children, className }: PageTitlebarButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      className={cn('flex flex-row items-center space-x-1.5 space-x-2', className)}
    >
      {children}
    </div>
  )
}
