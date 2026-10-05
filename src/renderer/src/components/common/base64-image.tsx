import React, { useMemo } from 'react'

export function Base64Image({ imgBase64 }: { imgBase64: string }): React.JSX.Element {
  const url = useMemo(() => {
    const binary = atob(imgBase64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return URL.createObjectURL(new Blob([bytes], { type: 'image/png' }))
  }, [imgBase64])

  // useEffect(() => () => URL.revokeObjectURL(url), [url])

  return (
    <div>
      <img src={url} alt="" className="max-w-256" />
    </div>
  )
}
