import type {
  FramePortChannel,
  FramePortMessageChannels,
  MainToRenderChannel,
  MainToRenderMessageChannels
} from '@shared/ipc'
import { ipcRenderer } from 'electron'

let framePort: MessagePort | null = null
const portHandlers = new Map<FramePortChannel, Set<(msg: any) => void>>()

ipcRenderer.on('worker:entered', (event) => {
  framePort?.close()
  framePort = event.ports[0]
  framePort.onmessage = (e: MessageEvent<{ channel: FramePortChannel; message: unknown }>) => {
    portHandlers.get(e.data.channel)?.forEach((fn) => fn(e.data.message))
  }
  framePort.start()
})

ipcRenderer.on('worker:exited', () => {
  framePort?.close()
  framePort = null
})

function onPortPost<C extends FramePortChannel>(
  channel: C,
  handler: (msg: FramePortMessageChannels[C]) => void
): () => void {
  let set = portHandlers.get(channel)
  if (!set) portHandlers.set(channel, (set = new Set()))
  set.add(handler)
  return () => set!.delete(handler)
}

function onMainPost<C extends MainToRenderChannel>(
  channel: C,
  handler: (msg: MainToRenderMessageChannels[C]) => void
): () => void {
  const listener = (_e: Electron.IpcRendererEvent, msg: MainToRenderMessageChannels[C]) =>
    handler(msg)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

export const api = { onMainPost, onPortPost }
export type Api = typeof api
