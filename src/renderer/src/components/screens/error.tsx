import { ArrowLeftIcon, HeartCrackIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

export function ErrorScreen(): React.JSX.Element {
  const navigate = useNavigate()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <HeartCrackIcon />
      <p className="text-md font-bold">Something went wrong :(</p>
      <Separator className="!w-64" />
      <Button onClick={() => navigate(-1)}>
        <ArrowLeftIcon />
        Go Back
      </Button>
    </div>
  )
}
