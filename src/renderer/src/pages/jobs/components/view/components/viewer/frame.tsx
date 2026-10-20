import { useThisJobStatus } from '@renderer/pages/jobs/components/view/hooks/use-this-job-status'
import { motion } from 'framer-motion'
import React, { useEffect, useRef } from 'react'

/* Simple Band-Aid for not having to wait for another frame after re-sub
 * allows for a frame to be ready instantly, even if it isn't totally up-to-speed */
let lastFrame: Uint8Array<ArrayBufferLike> | undefined = undefined
window.api.onMainPost('worker:exited', () => {
  lastFrame = undefined
})

export function FramePreview(): React.JSX.Element {
  const { thisIsCurrentJob } = useThisJobStatus()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!thisIsCurrentJob) return // stop receiving frames, but leave the canvas as-is

    const renderer = createFrameRenderer(() => canvasRef.current)
    lastFrame && renderer.push(lastFrame)
    const unsub = window.api.onPortPost('worker:frame', ({ data }) => renderer.push(data))
    return () => {
      unsub()
      renderer.dispose()
    }
  }, [thisIsCurrentJob])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: 'circInOut' }}
      className="absolute inset-0"
    >
      <canvas ref={canvasRef} className="h-full w-full rounded-md object-contain" />
    </motion.div>
  )
}

/* WatchMe: (Mostly) Vibe coded */
function createFrameRenderer(getCanvas: () => HTMLCanvasElement | null) {
  let pending: Uint8Array | null = null
  let busy = false
  let disposed = false

  const pump = async () => {
    busy = true
    while (pending && !disposed) {
      const bytes = pending
      pending = null
      try {
        const bmp = await createImageBitmap(
          new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'image/png' })
        )
        const canvas = getCanvas()
        if (!disposed && canvas) {
          if (canvas.width !== bmp.width || canvas.height !== bmp.height) {
            canvas.width = bmp.width
            canvas.height = bmp.height
          }
          canvas.getContext('2d')?.drawImage(bmp, 0, 0)
        }
        bmp.close()
      } catch (e) {
        console.warn('[FramePreview] failed to decode frame', e)
      }
    }
    busy = false
  }

  return {
    push(bytes: Uint8Array) {
      pending = bytes
      lastFrame = bytes
      if (!busy) void pump()
    },
    dispose() {
      disposed = true
      pending = null
    }
  }
}
