import { login } from '@main/automation/flows/login'
import { checkOrFill, openBreedingTab, openProfile } from '@main/automation/flows/preg-check'
import { ROOT_URL, site } from '@main/automation/site'
import type { RowFlow } from '@main/automation/types'
import { act } from '@shared/automation'
import type { TFileRow, TProcessId } from '@shared/schemas/jobs'

export const defineRowFlow = <Row>(def: RowFlow<Row>) => def

const pregCheckRowFlow = defineRowFlow<TFileRow<'pregCheck'>>({
  setup: function* () {
    yield* login(site)
  },
  row: function* (data) {
    const profileScope = yield* openProfile(site.authed, data.recipTag)
    const breedingScope = yield* openBreedingTab(profileScope)
    const screenshot = yield* checkOrFill(breedingScope, data)
    return { screenshot }
  },
  recover: function* () {
    yield* act.goto(ROOT_URL)
  }
})

export const flows = {
  pregCheck: pregCheckRowFlow
} satisfies { [K in TProcessId]: RowFlow<TFileRow<K>> }
