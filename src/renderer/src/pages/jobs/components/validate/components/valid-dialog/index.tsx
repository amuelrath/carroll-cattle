import { Button } from '@renderer/components/ui/button'
import {
  CustomDialogHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { CheckIcon } from 'lucide-react'
import React from 'react'
import { validCopy as copy } from './_copy'

interface ValidDialogProps {
  onContinue: () => void
}

export function ValidDialog({ onContinue }: ValidDialogProps): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger>
        <div className="space-y-1">
          <p className="text-muted-foreground font-bold">{copy.ready}</p>
          <Button size="lg" variant="okay" className="animate-pulse hover:animate-none">
            {copy.trigger}
          </Button>
        </div>
      </DialogTrigger>
      <ValidDialogContent onContinue={onContinue} />
    </Dialog>
  )
}

export function ValidDialogContent({ onContinue }: ValidDialogProps) {
  return (
    <DialogContent className="flex min-w-150">
      <CustomDialogHeader icon={CheckIcon} title={copy.title} description={copy.description} />
      <div className="flex flex-row items-center justify-end space-x-2">
        <DialogClose render={<Button variant="secondary">{copy.cancel}</Button>} />
        <Button onClick={onContinue}>{copy.confirm}</Button>
      </div>
    </DialogContent>
  )
}
