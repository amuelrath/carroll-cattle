import { BrowserWindow, dialog, webUtils } from 'electron'
import { CreateContextOptions } from 'trpc-electron/main'

export async function createContext({ event }: CreateContextOptions) {
  return {
    window: BrowserWindow.fromWebContents(event.sender),
    dialog: dialog,
    webUtils: webUtils,
    sender: event.sender
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
