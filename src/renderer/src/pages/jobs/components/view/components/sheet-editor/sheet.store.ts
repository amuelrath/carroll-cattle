import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface SheetEditorState {
  activeRow: number
  selectRow: (rowIdx: number) => void
  contextOpen: boolean
  setContextOpen: (open: boolean) => void
}

export const useSheetEditorStore = create<SheetEditorState>()(
  subscribeWithSelector((set) => {
    return {
      activeRow: 0,
      selectRow: (cellId) => set({ activeRow: cellId }),
      contextOpen: true,
      setContextOpen: (open) => set({ contextOpen: open })
    }
  })
)
