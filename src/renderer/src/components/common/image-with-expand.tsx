import { Dialog, DialogContent, DialogTrigger } from '@renderer/components/ui/dialog'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

function useImageBitmap(imgString: string): ImageBitmap | null {
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null)

  useEffect(() => {
    let cancelled = false
    const bytes = Uint8Array.from(atob(imgString), (c) => c.charCodeAt(0))

    createImageBitmap(new Blob([bytes], { type: 'image/png' }))
      .then((bmp) => {
        if (!cancelled) setBitmap(bmp)
      })
      .catch(console.error)

    return () => {
      cancelled = true
    }
  }, [imgString])

  return bitmap
}

function BitmapCanvas({
  bitmap,
  ...props
}: { bitmap: ImageBitmap | null } & React.ComponentProps<'canvas'>): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Layout effect: draws before paint, so a newly mounted canvas is never shown empty
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !bitmap) return
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
  }, [bitmap])

  return <canvas ref={canvasRef} {...props} />
}

interface Base64ImageProps {
  imgString: string
  alt?: string
  className?: string
}

export function ImageWithExpand({
  imgString,
  className,
  alt
}: Base64ImageProps): React.JSX.Element {
  const bitmap = useImageBitmap(imgString)

  return (
    <Dialog>
      <DialogTrigger className="transition-opacity hover:opacity-80">
        <BitmapCanvas bitmap={bitmap} role="img" aria-label={alt} className={className} />
      </DialogTrigger>
      <DialogContent className="flex min-w-[85vw] flex-col items-center justify-center">
        <div className="border-border max-w-[80vw] overflow-hidden rounded-md border-2 object-contain">
          <BitmapCanvas
            bitmap={bitmap}
            role="img"
            aria-label={alt}
            className="w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
