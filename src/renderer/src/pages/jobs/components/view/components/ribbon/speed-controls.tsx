import { Button } from '@renderer/components/ui/button'
import { ButtonGroup } from '@renderer/components/ui/button-group'
import { trpc } from '@renderer/lib/trpc'
import React from 'react'

export function SpeedControls(): React.JSX.Element {
  const { data: speed } = trpc.automation.state.speed.useSubscription()
  const { mutateAsync: changeSpeed } = trpc.automation.changeSpeed.useMutation()

  return (
    <div role="group" className="flex flex-col items-center justify-between space-y-1">
      <ButtonGroup className="text-muted-foreground">
        <Button
          onClick={() => changeSpeed({ speed: 'slow' })}
          variant={speed === 'slow' ? 'secondary' : 'outline'}
          size="lg"
          className={'w-12 text-xs transition-none'}
        >
          0.5x
        </Button>
        <Button
          onClick={() => changeSpeed({ speed: 'normal' })}
          variant={speed === 'normal' ? 'secondary' : 'outline'}
          size="lg"
          className={'w-12 text-xs transition-none'}
        >
          1x
        </Button>
        <Button
          onClick={() => changeSpeed({ speed: 'max' })}
          variant={speed === 'max' ? 'secondary' : 'outline'}
          size="lg"
          className={'w-12 text-xs transition-none'}
        >
          3x
        </Button>
      </ButtonGroup>
    </div>
  )
}
