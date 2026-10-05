import type { Locator, Page } from 'playwright'
import sharp from 'sharp'

/* Helper for screenshotting that doesn't interfere with screencast.
 Screenshot an element without having it become the entire viewport for a frame. */
export async function elementShot(page: Page, locator: Locator) {
  const isRoot = await locator.evaluate(
    (el) => el === document.body || el === document.documentElement
  )
  if (isRoot) {
    return (await page.screenshot({ caret: 'initial', animations: 'allow' })).toString('base64')
  }
  const box = await locator.boundingBox()
  if (!box) throw new Error('element not visible')

  const dpr = await page.evaluate(() => window.devicePixelRatio)
  const full = await page.screenshot({ caret: 'initial', animations: 'allow' }) // no clip

  return (
    await sharp(full)
      .extract({
        left: Math.round(box.x * dpr),
        top: Math.round(box.y * dpr),
        width: Math.round(box.width * dpr),
        height: Math.round(box.height * dpr)
      })
      .png()
      .toBuffer()
  ).toString('base64')
}
