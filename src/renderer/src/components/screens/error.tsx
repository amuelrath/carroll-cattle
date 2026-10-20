import { errors } from '@shared/resources/strings'
import { ErrorComponentProps } from '@tanstack/react-router'
import { ArrowLeftIcon, CheckIcon, CopyIcon, HeartCrackIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

export function ErrorScreen({ error }: ErrorComponentProps): React.JSX.Element {
  const message = error instanceof Error ? error.message : errors.unknown
  const [copied, setCopied] = useState(false)
  const details = error instanceof Error ? `${error.message}\n${error.stack}` : String(error)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(details)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGoBack = () => {
    // reset()
    window.history.back()
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-4">
      <HeartCrackIcon />
      <div>
        <h1 className="text-lg font-bold">Something went wrong :(</h1>
        <p className="text-muted-foreground max-w-md text-center text-sm">{message}</p>
      </div>
      <Button variant="outline" size="sm" className="w-40" onClick={handleCopy}>
        {copied ?
          <CheckIcon />
        : <CopyIcon />}
        {copied ? 'Copied!' : 'Copy error details'}
      </Button>
      <Separator className="!w-64" />
      <Button onClick={handleGoBack} size="lg">
        <ArrowLeftIcon />
        Go Back
      </Button>
    </div>
  )
}
