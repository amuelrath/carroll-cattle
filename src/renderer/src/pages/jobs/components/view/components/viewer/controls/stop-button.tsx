import { Button } from '@renderer/components/ui/button'
import { trpc } from '@renderer/lib/trpc'
import { SquareIcon } from 'lucide-react'

export function StopButton() {
  const { mutate: mutateStop } = trpc.automation.stop.useMutation()

  return (
    <div className="flex flex-row items-center space-x-2">
      <Button
        onClick={() => mutateStop()}
        variant="destructive"
        size="sm"
        className="relative aspect-square size-10 rounded-full"
      >
        <SquareIcon className="absolute top-1/2 size-5 origin-center -translate-y-1/2 fill-white stroke-white" />
      </Button>
    </div>
  )
}
