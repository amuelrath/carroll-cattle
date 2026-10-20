import {
  type ActionOf,
  parseAction,
  type TActionOutput,
  type TActionType
} from '@shared/automation/act'
import { sel, type TSelector } from '@shared/automation/sel'
import { ZWorkerRequest } from '@shared/schemas/protocol.schemas'
import { dehydrateError } from '@utility/dehydrate'
import { elementShot } from '@utility/element-shot'
import { postMainMessage } from '@utility/ipc'
import { resolveTarget } from '@utility/resolve'
import { type Locator, type Page } from 'playwright'

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

type Ctx = {
  page: Page
  // signal: AbortSignal
  locate: (selectors: TSelector[]) => Locator
  ensure: (selectors: TSelector[]) => Promise<Locator>
}

function createCtx(page: Page): Ctx {
  return {
    page,
    // returns a locator. element might not be visible
    locate: (selectors) => {
      return resolveTarget(page, selectors)
    },
    // ensure that the element exists before doing anything
    ensure: async (selectors) => {
      // await page.hideHighlight()
      const loc = resolveTarget(page, selectors)
      // await loc.highlight()
      await loc.waitFor({ state: 'visible' }) // WatchMe Could be useful to add an abort signal.
      await loc.scrollIntoViewIfNeeded()
      return loc
    }
  }
}

type Handler<K extends TActionType> = (ctx: Ctx, action: ActionOf<K>) => Promise<TActionOutput<K>>

const handlers: { [K in TActionType]: Handler<K> } = {
  goto: async ({ page }, action) => {
    await page.goto(action.input)
  },
  fill: async ({ ensure }, action) => {
    const loc = await ensure(action.target)
    await loc.focus()
    for (const char of action.input) await loc.press(char)
  },
  click: async ({ ensure }, action) => {
    await (await ensure(action.target)).click()
  },
  select: async ({ ensure }, action) => {
    await (await ensure(action.target)).selectOption(action.input)
  },
  check: async ({ ensure }, action) => {
    await (await ensure(action.target)).check()
  },
  uncheck: async ({ ensure }, action) => {
    await (await ensure(action.target)).uncheck()
  },
  waitForVisible: async ({ ensure }, action) => {
    await ensure(action.target)
  },
  waitForText: async ({ ensure }, action) => {
    const escaped = action.input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const loc = await ensure(action.target)

    await loc
      .filter({ hasText: new RegExp(`^\\s*${escaped}\\s*$`, 'i') })
      .waitFor({ state: 'visible', timeout: 5_000 })
  },
  getText: async ({ ensure }, action) => {
    return (await ensure(action.target)).textContent()
  },
  getIsVisible: async ({ locate }, action) => {
    return locate(action.target).isVisible()
  },
  screenshot: async ({ page, ensure }, action) => {
    if (action.target) {
      const loc = await ensure(action.target)
      return await elementShot(page, loc)
    }

    const buff = await page.screenshot({ type: 'png' })
    return Buffer.from(buff).toString('base64')
  },
  extractTable: async ({ ensure }, action) => {
    return (await ensure(action.target)).evaluate((t) => {
      const headers = [...t.querySelectorAll('thead th')].map((th) => th.textContent.trim())
      return [...t.querySelectorAll('tbody tr')].map((tr) => {
        const cells = [...tr.querySelectorAll('td')].map((td) => td.textContent.trim())
        return Object.fromEntries(headers.map((h, i) => [h, cells[i]]))
      })
    })
  },
  clickText: async ({ locate }, action) => {
    const loc = locate(action.target)
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(action.input)}\\s*$`, 'i') })
      .first()
    await loc.waitFor({ state: 'visible' }) // also waits for AJAX results to arrive
    await loc.scrollIntoViewIfNeeded()
    await loc.click()
  },
  getUrl: async ({ page }) => {
    return page.url()
  }
}

/* execute an action on the page using the assoc handler and post results to main */
export async function execute(raw: unknown, page: Page) {
  // for making ts happy with mapped type.
  // otherwise it will intersect all ``ActionOf<K>`` which is ``never``
  const dispatch = <K extends TActionType>(
    ctx: Ctx,
    action: ActionOf<K>
  ): Promise<TActionOutput<K>> => {
    const handler: Handler<K> = handlers[action.type as K]
    return handler(ctx, action)
  }

  const req = ZWorkerRequest.parse(raw)
  const action = parseAction(req.payload)
  const ctx = createCtx(page)

  try {
    const res = await dispatch(ctx, action)
    postMainMessage({ id: req.id, kind: 'success', data: res })
  } catch (e) {
    const screenshot = await dispatch(ctx, {
      type: 'screenshot',
      input: undefined,
      target: [sel.css('body')]
    })
    postMainMessage(dehydrateError({ id: req.id, err: e, screenshot }))
  }
}
