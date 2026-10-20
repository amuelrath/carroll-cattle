export function base64ToBuffer(input: string): Buffer {
  // strip "data:image/png;base64," if present
  const b64 = input.replace(/^data:[^;]+;base64,/, '')
  return Buffer.from(b64, 'base64')
}
