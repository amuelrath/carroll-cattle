import type { Flow } from '@main/automation/types'
import { act, type TSelector } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'

/*
  ToDo: Create waitForAny.
    I think there is some race condition where the page might not load in fast enough so neither selector is visible.
    This results in the RowIssue getting thrown.
*/

/* Returns the key of the first found selector. Checks in order of specification instantly
 * after getting called. Does not wait
 */
export function* findFirst<T extends Record<string, TSelector>>(targets: T): Flow<keyof T> {
  const keys = Object.keys(targets) as (keyof T)[]

  for (const key of keys) {
    if (yield* act.getIsVisible(targets[key])) {
      return key
    }
  }
  throw new RowIssue(
    'INTERNAL',
    'The bot got confused by something unexpected and decided to skip. Please try again.'
  )
}
