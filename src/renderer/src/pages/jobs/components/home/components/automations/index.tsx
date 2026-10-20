import Bag from '@renderer/assets/bag.png'
import Eyedropper from '@renderer/assets/eyedropper.png'
import Magnifying from '@renderer/assets/magnify.png'
import TestTube from '@renderer/assets/test-tube.png'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'
import type { TProcessId } from '@shared/schemas/jobs'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'
import React from 'react'

interface Process {
  label: string
  description: string
  src: string
  processId: TProcessId
  tint: string // icon background + color
}

const processes: Process[] = [
  {
    label: 'Breeding',
    description: 'Record breeding events',
    src: TestTube,
    processId: 'breeding',
    tint: 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
  },
  {
    label: 'Pregnancy Check',
    description: 'Log preg check results',
    src: Magnifying,
    processId: 'pregCheck',
    tint: 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
  },
  {
    label: 'Flush',
    description: 'Track flush outcomes',
    src: Eyedropper,
    processId: 'breeding', // TODO: real id
    tint: 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
  },
  {
    label: 'Inventory',
    description: 'Update stock counts',
    src: Bag,
    processId: 'breeding', // TODO: real id
    tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  }
]

function ProcessButton({ label, description, src, processId, tint }: Process) {
  return (
    <Link
      to="/jobs/new"
      search={{ processId }}
      className="group focus-visible:ring-ring group rounded-xl outline-none focus-visible:ring-2"
    >
      <Button
        variant="outline"
        tabIndex={-1}
        className={cn(
          'bg-card h-auto w-full flex-col items-start gap-3 rounded-xl p-4 text-left whitespace-normal shadow-sm',
          'transition-all group-hover:-translate-y-0.5 group-hover:shadow-md'
        )}
      >
        <div className="flex w-full items-start justify-between">
          <div className={cn('flex size-10 items-center justify-center rounded-lg', tint)}>
            <img
              alt="icon"
              src={src}
              className="size-7 drop-shadow-lg transition group-hover:scale-200"
            />
          </div>
          <ArrowRightIcon className="text-muted-foreground size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-muted-foreground text-xs font-normal">{description}</span>
        </div>
      </Button>
    </Link>
  )
}

export function AutomationsSection(): React.JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col">
        <h2 className="text-sm font-semibold">Automations</h2>
        <p className="text-muted-foreground text-xs">Start a new job from a process</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {processes.map((p) => (
          <ProcessButton key={p.label} {...p} />
        ))}
      </div>
    </section>
  )
}
