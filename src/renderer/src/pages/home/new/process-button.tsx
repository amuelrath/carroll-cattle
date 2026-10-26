import { cn } from '@renderer/lib/utils'
import type { TProcessId } from '@shared/schemas/jobs'
import { Link } from '@tanstack/react-router'
import { ChevronRightIcon } from 'lucide-react'
import React from 'react'

export type ProcessButtonProps = {
  processId: TProcessId
  title: string
  desc: string
  src: string
  tint: string
}

export function ProcessButton({
  processId,
  src,
  tint,
  desc,
  title
}: ProcessButtonProps): React.JSX.Element {
  return (
    <Link to="/jobs" search={{ processId }}>
      <div
        role="button"
        className={cn(
          'group border-border bg-card relative isolate flex h-32 w-full overflow-hidden rounded-lg border p-4 shadow'
        )}
      >
        <div className="flex grow flex-col justify-center space-y-2 transition-all group-hover:-translate-y-1">
          <span
            className={cn(
              'relative flex aspect-square size-10 flex-col items-center justify-center rounded-sm',
              tint
            )}
          >
            <img
              src={src}
              alt="icon"
              className="scale-80 drop-shadow-xl transition-all group-hover:scale-120"
            />
          </span>
          <div className="flex flex-col">
            <p className="font-medium">{title}</p>
            <p className="text-muted-foreground text-xs">{desc}</p>
          </div>
        </div>

        <span className="text-muted-foreground -translate-y-1 opacity-0 mix-blend-multiply transition-all group-hover:translate-y-1 group-hover:opacity-100">
          <ChevronRightIcon className="size-4" />
        </span>
      </div>
    </Link>
  )
}
