import { useCallback, useEffect, useRef } from 'react'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface ActiveCellState {
  activeCellId: string | undefined
  setActive: (cellId: string | undefined) => void
  setInactive: () => void
}

const initialState = { activeCellId: undefined }

export const useActiveCellStore = create<ActiveCellState>()(
  subscribeWithSelector((set) => ({
    ...initialState,
    setActive: (cellId) => set({ activeCellId: cellId }),
    setInactive: () => set(initialState)
  }))
)

interface CellHelperParams {
  rowIdx: number
  columnName: string
}

export function useIsCellActive({ rowIdx, columnName }: CellHelperParams) {
  const cellId = getCellId({ rowIdx, columnName })
  return useActiveCellStore((s) => s.activeCellId === cellId)
}

export function useCellActions({
  rowIdx,
  columnName,
  delayMs = 0
}: CellHelperParams & { delayMs?: number }) {
  const cellId = getCellId({ rowIdx, columnName })

  const setActive = useActiveCellStore((s) => s.setActive)
  const setInactive = useActiveCellStore((s) => s.setInactive)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const debouncedSetActive = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setActive(cellId)
      hoverTimeoutRef.current = null
    }, delayMs)
  }, [cellId, delayMs, setActive])

  const cancelPendingActivation = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }, [])

  return [
    debouncedSetActive,
    () => {
      cancelPendingActivation()
      setInactive()
    }
  ] as const
}
export function getCellId({ rowIdx, columnName }: CellHelperParams) {
  return `${rowIdx}-${columnName}`
}
