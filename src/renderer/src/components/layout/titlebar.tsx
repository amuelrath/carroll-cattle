import React from 'react'
import { trpc } from '@renderer/lib/trpc'
import { Button } from '../ui/button'
import { ArrowLeftIcon, ArrowRightIcon, MinusIcon, SquareIcon, XIcon } from 'lucide-react'
import { Location, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { capitalize } from '@renderer/lib/helpers'

const formatLocation = (loc: Location<unknown>): string => {
  return capitalize(loc.pathname.split('/')[1])
}

function TitleBar(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="z-10 flex h-10 w-full shrink-0 justify-between bg-transparent pl-10 select-none [-webkit-app-region:drag]">
      <div className="flex shrink-0 items-center">
        <nav className="flex items-center justify-center [-webkit-app-region:no-drag]">
          <Button
            onClick={() => navigate(-1)}
            data-test-id="nav-back"
            variant="ghost"
            size="sm"
            className="text-muted-foreground rounded-none rounded-l pl-0 hover:bg-transparent"
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            onClick={() => navigate(1)}
            data-test-id="nav-forward"
            variant="ghost"
            size="sm"
            className="text-muted-foreground rounded-none rounded-r hover:bg-transparent"
          >
            <ArrowRightIcon />
          </Button>
        </nav>
        <h1 className="text-sm font-bold">{formatLocation(location)}</h1>
      </div>
      <div className="flex flex-row items-center justify-end [-webkit-app-region:no-drag]">
        <Button
          onClick={() => trpc.window.minimize.mutate().catch((err) => console.log(err))}
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-full rounded-none"
        >
          <MinusIcon />
        </Button>
        <Button
          onClick={() => trpc.window.maximize.mutate()}
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-full rounded-none"
        >
          <SquareIcon className="!size-[11px]" />
        </Button>
        <Button
          onClick={() => trpc.window.close.mutate()}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-destructive h-full rounded-none rounded-tr hover:text-white"
        >
          <XIcon />
        </Button>
      </div>
    </header>
  )
}

export { TitleBar }
