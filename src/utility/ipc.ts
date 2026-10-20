import type { FramePortChannel, FramePortMessageChannels } from '@shared/ipc'
import type { TWorkerResponse } from '@shared/schemas/protocol.schemas'
import type { MessagePortMain } from 'electron'

export function postPortMessage<C extends FramePortChannel>(
  channel: C,
  port: MessagePortMain,
  message: FramePortMessageChannels[C]
) {
  port.postMessage({ channel, message })
}

export function postMainMessage(res: TWorkerResponse) {
  process.parentPort.postMessage(res)
}
