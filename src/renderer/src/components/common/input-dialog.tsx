import { Button } from '@renderer/components/ui/button'
import {
  CustomDialogHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { toast } from '@renderer/components/ui/toast'
import { type LucideIcon } from 'lucide-react'
import React, { useState } from 'react'

interface InputDialogProps {
  open: boolean
  setOpen: (o: boolean) => void
  icon: LucideIcon
  title: string
  desc: string
  confirmLabel: string
  defaultValue: string
  onSubmit: (val: string) => void
}

export function InputDialog({
  open,
  setOpen,
  icon,
  title,
  desc,
  confirmLabel,
  defaultValue,
  onSubmit
}: InputDialogProps): React.JSX.Element {
  const [val, setVal] = useState(defaultValue)

  const handleClick = () => {
    if (val.length < 1) {
      setOpen(false)
      return toast.add({
        type: 'error',
        title: 'Cannot update title',
        description: 'Title must be at least one charater.'
      })
    }
    return onSubmit(val)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <CustomDialogHeader icon={icon} title={title} description={desc} />
        <Input
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          defaultValue={defaultValue}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleClick()
          }}
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleClick}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
