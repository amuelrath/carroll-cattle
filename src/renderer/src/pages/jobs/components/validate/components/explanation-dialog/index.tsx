import { Button } from '@renderer/components/ui/button'
import {
  CustomDialogHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { iconSizes } from '@renderer/lib/tokens'
import type { TValidateSheetResponse } from '@shared/schemas/trpc'
import { InfoIcon } from 'lucide-react'
import React, { useState } from 'react'
import { ValidDialogContent } from '../valid-dialog'
import { explanationCopy as copy } from './_copy'

interface ExplanationDialogProps {
  validation: TValidateSheetResponse | undefined
  onContinue: () => void
}

export function ExplanationDialog({
  validation,
  onContinue
}: ExplanationDialogProps): React.JSX.Element {
  const isValid = !!(validation?.status && validation?.status === 'valid')
  const [open, setOpen] = useState<boolean>(!isValid)
  const [manuallyOpened, setManuallyOpened] = useState<boolean>(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="ghost" onClick={() => setManuallyOpened(true)}>
          <InfoIcon {...iconSizes.small} />
        </Button>
      </DialogTrigger>
      {!isValid ? (
        <ExplanationDialogContent manuallyOpened={manuallyOpened} />
      ) : (
        <ValidDialogContent onContinue={onContinue} />
      )}
    </Dialog>
  )
}

export function ExplanationDialogContent({ manuallyOpened }: { manuallyOpened: boolean }) {
  return (
    <DialogContent className="flex min-w-150">
      <CustomDialogHeader icon={InfoIcon} title={copy.title} description={copy.description} />
      <DialogClose
        render={<Button>{manuallyOpened ? copy.buttonManual : copy.buttonDefault}</Button>}
      />
    </DialogContent>
  )
}
