import { ROOT_URL, type ScopeConsumer, type Site } from '@main/automation/site'
import { act, narr } from '@shared/automation'

export const login = function* (scope) {
  const email = import.meta.env.MAIN_VITE_CATTLEMAX_USERNAME
  const password = import.meta.env.MAIN_VITE_CATTLEMAX_PASSWORD

  yield narr('Starting up...')
  yield* act.goto(ROOT_URL)

  const { unauthed } = scope

  yield narr('Logging in...')
  yield* act.fill(unauthed.email, email)
  yield* act.fill(unauthed.password, password)
  yield* act.click(unauthed.submit)
} satisfies ScopeConsumer<Site>
