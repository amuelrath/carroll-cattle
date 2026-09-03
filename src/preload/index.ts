import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge } from 'electron'
import { exposeElectronTRPC } from 'trpc-electron/main'

// Custom APIs for renderer

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}

process.once('loaded', async () => {
  exposeElectronTRPC()
})
