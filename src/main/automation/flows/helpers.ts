// This is the way the option label is constructed.
export function getEmbryoName(bullTag: string, donorTag: string, caneNo: string, strawNo: string) {
  return `${bullTag} x ${donorTag} (#: ${strawNo} / CC: ${caneNo})`
}
