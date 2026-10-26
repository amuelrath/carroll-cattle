import { act, type TSelector } from '@shared/automation'

export const exitModal = function* (valid: boolean, content: TSelector, cancel: TSelector) {
  const screenshot = yield* act.screenshot(content)
  yield* act.click(cancel)
  return { valid, screenshot }
}
