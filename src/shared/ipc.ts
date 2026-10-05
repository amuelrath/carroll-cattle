export interface MainToRenderMessageChannels {
  'worker:entered': '*'
  'worker:exited': undefined
}

export type MainToRenderChannel = keyof MainToRenderMessageChannels

export interface FramePortMessageChannels {
  'worker:frame': { data: Uint8Array<ArrayBufferLike> }
}
export type FramePortChannel = keyof FramePortMessageChannels
