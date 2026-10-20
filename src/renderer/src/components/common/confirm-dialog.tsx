import { Button, buttonVariants } from '@renderer/components/ui/button'
import {
  CustomDialogHeader,
  Dialog,
  DialogClose,
  DialogContent
} from '@renderer/components/ui/dialog'
import type { VariantProps } from 'class-variance-authority'
import { type LucideIcon } from 'lucide-react'
import React from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  desc: string
  confirmLabel: string
  confirmVariant: VariantProps<typeof buttonVariants>['variant']
  onConfirm: () => void
  setOpen: (o: boolean) => void
  icon: LucideIcon
}

export function ConfirmDialog({
  title,
  desc,
  icon,
  confirmLabel,
  onConfirm,
  setOpen,
  open,
  confirmVariant
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <CustomDialogHeader icon={icon} title={title} description={desc} />
        <Button onClick={onConfirm} variant={confirmVariant}>
          {confirmLabel}
        </Button>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
      </DialogContent>
    </Dialog>
  )
}
