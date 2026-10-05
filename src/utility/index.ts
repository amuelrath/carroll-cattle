import { execute } from '@utility/execute'
import { postPortMessage } from '@utility/ipc'
import { MessagePortMain } from 'electron'
import { type Browser, type CDPSession, chromium, type Page } from 'playwright'

const DEFAULT_PLAYWRIGHT_TIMEOUT = 10_000 // ms

let framePort: MessagePortMain
let browser: Browser
let page: Page
let cdp: CDPSession
let queue: Promise<void> = Promise.resolve()

let resolvePort!: (p: MessagePortMain) => void
const portReady = new Promise<MessagePortMain>((r) => (resolvePort = r))

const ready = (async () => {
  browser = await chromium.launch({
    headless: true,
    chromiumSandbox: true,
    handleSIGINT: false,
    args: ['--enable-automation']
  })

  const ctx = await browser.newContext({
    reducedMotion: 'reduce',
    strictSelectors: true
  })

  page = await ctx.newPage()
  ctx.setDefaultTimeout(DEFAULT_PLAYWRIGHT_TIMEOUT)

  // for streaming frames. we can only use jpeg if we use page.screencast()
  cdp = await page.context().newCDPSession(page)

  framePort = await portReady // don't try to stream until port exists

  cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
    // data is base64 png
    const decoded = Uint8Array.from(Buffer.from(data, 'base64'))
    postPortMessage('worker:frame', framePort, { data: decoded })

    // OK to send next frame
    await cdp.send('Page.screencastFrameAck', { sessionId })
  })

  await cdp.send('Page.startScreencast', {
    format: 'png',
    everyNthFrame: 1,
    quality: 100,
    maxHeight: 1080,
    maxWidth: 1920
  })
})()

process.parentPort.on('message', (e) => {
  if (e.data === 'worker:init') {
    const port = e.ports[0]
    port.start()
    resolvePort(port)
    return
  }

  queue = queue
    .then(async () => {
      await ready
      await execute(e.data, page)
    })
    .catch((err) => {
      console.error('[utility] Unexpected failure in handler: ', err)
    })
})

ready.catch((err) => {
  console.error('[utility] failed to initialize:', err)
  process.exit(1)
})
