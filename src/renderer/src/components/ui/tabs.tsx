'use client'

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { iconSizes } from '@renderer/lib/tokens'

import { cn } from '@renderer/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import React from 'react'

function Tabs({ className, orientation = 'horizontal', ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        inverse: 'bg-muted',
        line: 'gap-1 bg-transparent',
        ghost: 'bg-transparent space-y-1',
        file: cn(
          'flex flex-row group-data-vertical/tabs:flex-row group-data-vertical/tabs:h-10.25',
          'rounded-none w-full p-0'
        )
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function TabsList({
  className,
  variant = 'default',
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "text-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-muted-foreground dark:hover:text-foreground [&_svg:not([class*='size-'])]:size-4'ata-[variant=line]/tabs-list:bg-transparent relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:shadow-none dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0",
        'group-data-[variant=ghost]/tabs-list:data-active:bg-muted group-data-[variant=ghost]/tabs-list:data-active:border-border group-data-[variant=ghost]/tabs-list:data-active:bg-muted data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground group-data-[variant=ghost]/tabs-list:px-2 group-data-[variant=ghost]/tabs-list:py-1.5 group-data-[variant=ghost]/tabs-list:transition-none group-data-[variant=ghost]/tabs-list:data-active:rounded-full',
        'after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        'group-data-[variant=inverse]/tabs-list:rounded-full group-data-[variant=inverse]/tabs-list:px-2 group-data-[variant=inverse]/tabs-list:py-1.5 group-data-[variant=inverse]/tabs-list:transition-none group-data-[variant=inverse]/tabs-list:data-active:bg-white',
        'group-data-[variant=inverse]/tabs-list:data-active:border-border group-data-[variant=inverse]/tabs-list:data-active:border',
        'group-data-[variant=file]/tabs-list:border-r-border group-data-[variant=file]/tabs-list:data-active:bg-muted group-data-[variant=file]/tabs-list:border-b-border group-data-[variant=file]/tabs-list:border-t-none group-data-[variant=file]/tabs-list:bg-card group-data-[variant=file]/tabs-list:justify-center group-data-[variant=file]/tabs-list:rounded-none group-data-[variant=file]/tabs-list:border-r group-data-[variant=file]/tabs-list:data-active:border-b-transparent',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

interface CustomTabTriggerProps {
  value: string
  Icon?: LucideIcon
  label: string
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

function CustomTabsTrigger({
  Icon,
  label,
  children,
  value,
  onClick
}: CustomTabTriggerProps): React.JSX.Element {
  return (
    <TabsTrigger
      onClick={onClick ? () => onClick() : () => undefined}
      value={value}
      className="group/trigger flex flex-row items-center justify-between"
    >
      <div className="flex flex-row items-center space-x-2">
        <div className="relative items-center justify-center">
          {Icon && (
            <>
              <span className="bg-muted group-data-active/trigger:border-border absolute -top-1 -left-1 size-6 rounded-full group-data-active/trigger:border group-data-active/trigger:bg-white" />

              <Icon
                className="group-data-active/trigger:text-primary relative z-10"
                size={iconSizes.medium.size}
                strokeWidth={iconSizes.medium.strokeWidth}
              />
            </>
          )}
        </div>
        <span>{label}</span>
      </div>
      {children}
    </TabsTrigger>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, CustomTabsTrigger, tabsListVariants }
