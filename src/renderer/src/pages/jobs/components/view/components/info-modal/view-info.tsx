import { Button } from '@renderer/components/ui/button'
import {
  CustomDialogHeader,
  Dialog,
  DialogContent,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { iconSizes } from '@renderer/lib/tokens'
import { InfoIcon } from 'lucide-react'
import React from 'react'

export function InfoModal(): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm" variant="ghost">
            <InfoIcon {...iconSizes.small} />
          </Button>
        }
      />
      <DialogContent>
        <CustomDialogHeader icon={InfoIcon} title={'Info'} description={'Instructions/Help here'} />
      </DialogContent>
    </Dialog>
  )
}
