import { type RefObject, useCallback, useEffect, useRef } from 'react'
import { useActiveCellStore } from '../hooks/store'

type UseTableScrolljacker = {
  for: 'table'
}
type UseSidebarScrolljacker = {
  for: 'sidebar'
}

interface TableControls {
  handleMouseEnter: () => void
  handleMouseLeave: () => void
  cellRefs: RefObject<Record<string, HTMLTableCellElement | null>>
}

interface SidebarControls {
  handleClick: () => void
  errorItemRefs: RefObject<Record<string, HTMLDivElement | null>>
}

type UseScrolljacker = UseTableScrolljacker | UseSidebarScrolljacker

export function useScrolljacker(params: UseTableScrolljacker): TableControls
export function useScrolljacker(params: UseSidebarScrolljacker): SidebarControls
export function useScrolljacker(params: UseScrolljacker) {
  const mouseInsideRef = useRef(false)
  const errorItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const cellRefs = useRef<Record<string, HTMLTableCellElement | null>>({})

  useEffect(() => {
    const unsub = useActiveCellStore.subscribe(
      (s) => s.activeCellId,
      (activeId) => {
        if (mouseInsideRef.current) return
        if (!activeId) return

        const refs = params.for === 'sidebar' ? errorItemRefs : cellRefs
        refs.current[activeId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      }
    )

    return () => unsub()
  }, [params])

  const handleMouseEnter = () => {
    mouseInsideRef.current = true
  }
  const handleMouseLeave = useCallback(() => {
    mouseInsideRef.current = false
  }, [])

  const handleClick = useCallback(() => {
    mouseInsideRef.current = true
  }, [])

  if (params.for === 'sidebar') return { handleClick, errorItemRefs }
  return { handleMouseEnter, handleMouseLeave, cellRefs }
}
