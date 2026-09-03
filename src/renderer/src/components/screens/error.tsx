import { HeartCrackIcon, RefreshCcwIcon } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

export function ErrorScreen(): React.JSX.Element {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <HeartCrackIcon />
      <p className="text-md font-bold">Something went wrong :(</p>
      <Separator className="!w-64" />
      <Button onClick={window.location.reload}>
        <RefreshCcwIcon />
        Refresh
      </Button>
    </div>
  )
}
