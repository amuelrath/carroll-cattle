import { iconSizes } from '@renderer/lib/tokens'
import { Link, type LinkProps } from '@tanstack/react-router'
import { BotIcon, PlusIcon } from 'lucide-react'
import React from 'react'

export function ActionSection(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-muted-foreground text-xs font-bold">Quick Start</span>
      <div className="flex flex-row space-x-4">
        <ActionButton to="/jobs/new" title="New Job" icon={<NewJobIcon />} />
      </div>
    </div>
  )
}

interface ActionButtonProps extends LinkProps {
  icon: React.ReactNode
  title: string
}

function ActionButton({ title, icon, ...linkProps }: ActionButtonProps) {
  return (
    <Link className="group" {...linkProps}>
      <div className="bg-muted text-muted-foreground hover:text-primary hover:border-border flex aspect-square size-28 flex-col items-center justify-center space-y-2 rounded-lg border border-transparent text-xs transition">
        <span>{icon}</span>
        <p className="font-bold">{title}</p>
      </div>
    </Link>
  )
}

function NewJobIcon(): React.JSX.Element {
  return (
    <BotIcon className="size-8" viewBox="-4 -1   28 22">
      <rect x="7" y="12" width="10" height="4" fill="var(--muted)" stroke="none" />
      <PlusIcon x={7} y={9} {...iconSizes.xsmall} absoluteStrokeWidth />
    </BotIcon>
  )
}
