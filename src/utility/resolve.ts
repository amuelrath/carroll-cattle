import type { TSelector } from '@shared/automation/sel'
import { type Locator, type Page } from 'playwright'

export function locate(root: Page | Locator, selector: TSelector): Locator {
  const { type, input } = selector
  switch (type) {
    case 'role':
      return root.getByRole(input, { ...selector.options })
    case 'label':
      return root.getByLabel(input)
    case 'title':
      return root.getByTitle(input)
    case 'altText':
      return root.getByAltText(input)
    case 'testId':
      return root.getByTestId(input)
    case 'placeholder':
      return root.getByPlaceholder(input)
    case 'text':
      return root.getByText(input, { exact: true })
    case 'id':
      return root.locator(input)
    case 'css':
      return root.locator(input)
    case 'xpath':
      return root.locator(input)
    default: {
      throw new Error(`Unhandled selector type: ${selector satisfies never}`)
    }
  }
}

/* Returns a locator by chaining all selectors passed in */
export function resolveTarget(page: Page, target: TSelector[]): Locator {
  const [first, ...rest] = target
  return rest.reduce((loc, s) => loc.and(locate(page, s)), locate(page, first))
}
