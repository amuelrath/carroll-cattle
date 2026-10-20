import { checkOrFillBreeding } from '@main/automation/flows/breeding'
import { login } from '@main/automation/flows/login'
import { checkOrFillPregCheck } from '@main/automation/flows/preg-check'
import { openBreedingTab, openProfile } from '@main/automation/flows/profile'
import { ROOT_URL, site } from '@main/automation/site'
import type { RowFlow } from '@main/automation/types'
import { act } from '@shared/automation'
import type { TProcessId } from '@shared/schemas/jobs'

export const defineRowFlow = <K extends TProcessId>(def: RowFlow<K>) => def

export const pregCheckRowFlow = defineRowFlow<'pregCheck'>({
  setup: function* () {
    yield* login(site)
  },
  row: function* (data) {
    const profileScope = yield* openProfile(site.authed, data.recipTag)
    const breedingScope = yield* openBreedingTab(profileScope)
    const screenshot = yield* checkOrFillPregCheck(breedingScope, data)
    return { screenshot }
  },
  recover: function* () {
    yield* act.goto(ROOT_URL)
  }
})

export const breedingRowFlow = defineRowFlow<'breeding'>({
  setup: function* () {
    yield* login(site)
  },
  row: function* (data) {
    const profileScope = yield* openProfile(site.authed, data.recipTag)
    const breedingScope = yield* openBreedingTab(profileScope)
    const screenshot = yield* checkOrFillBreeding(breedingScope, data)
    return { screenshot }
  },
  recover: function* () {
    yield* act.goto(ROOT_URL)
  }
})

export type Flows = { [K in TProcessId]: RowFlow<K> }
export const flows: Flows = {
  pregCheck: pregCheckRowFlow,
  breeding: breedingRowFlow
}
