import { capitalize } from '@renderer/lib/strings'
import { trpc } from '@renderer/lib/trpc'
import { useRouterState } from '@tanstack/react-router'
import { ArrowLeftIcon, ArrowRightIcon, MinusIcon, SquareIcon, XIcon } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'

const formatLocation = (pathname: string): string[] => {
  const cleanPath = pathname.split('?')[0]
  const segments = cleanPath.split('/').filter(Boolean)

  return segments.map((r, idx) =>
    idx === segments.length - 1 ? capitalize(r) : capitalize(r) + ' > '
  )
}

function TitleBar(): React.JSX.Element {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const { mutate: minimize } = trpc.window.minimize.useMutation()
  const { mutate: maximize } = trpc.window.maximize.useMutation()
  const { mutate: close } = trpc.window.close.useMutation()

  return (
    <header className="z-10 flex h-10 w-full shrink-0 justify-between bg-transparent pl-10 select-none [-webkit-app-region:drag]">
      <div className="flex shrink-0 items-center">
        <nav className="flex items-center justify-center [-webkit-app-region:no-drag]">
          <Button
            onClick={() => window.history.back()}
            data-test-id="nav-back"
            variant="ghost"
            size="sm"
            className="text-muted-foreground rounded-none rounded-l pl-0 hover:bg-transparent"
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            onClick={() => window.history.forward()}
            data-test-id="nav-forward"
            variant="ghost"
            size="sm"
            className="text-muted-foreground rounded-none rounded-r hover:bg-transparent"
          >
            <ArrowRightIcon />
          </Button>
        </nav>
        <h1 className="text-sm font-bold">{formatLocation(pathname)}</h1>
      </div>
      <div className="flex flex-row items-center justify-end [-webkit-app-region:no-drag]">
        <Button
          onClick={() => minimize()}
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-full rounded-none"
        >
          <MinusIcon />
        </Button>
        <Button
          onClick={() => maximize()}
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-full rounded-none"
        >
          <SquareIcon className="size-2.75!" />
        </Button>
        <Button
          onClick={() => close()}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-destructive-foreground h-full rounded-none rounded-tr hover:text-white"
        >
          <XIcon />
        </Button>
      </div>
    </header>
  )
}

export { TitleBar }
