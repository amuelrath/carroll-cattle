import type { MainToRenderChannel, MainToRenderMessageChannels } from '@shared/ipc'
import { type MessagePortMain, type WebContents } from 'electron'

export function postWcMessage<C extends MainToRenderChannel>(
  channel: C,
  webContents: WebContents,
  message: MainToRenderMessageChannels[C],
  transfer?: MessagePortMain[]
): void {
  webContents.postMessage(channel, message, transfer)
}
