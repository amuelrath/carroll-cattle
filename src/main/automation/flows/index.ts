import { checkOrFillBreed } from '@main/automation/flows/breed'
import { checkOrFillFlush } from '@main/automation/flows/flush'
import { login } from '@main/automation/flows/login'
import { checkOrFillPreg } from '@main/automation/flows/preg'
import { openBreedingTab, openEmbryoTab, openProfile } from '@main/automation/flows/profile'
import { ROOT_URL, site } from '@main/automation/site'
import type { RowFlow } from '@main/automation/types'
import { credentialsCache } from '@main/core/credentials'
import { act } from '@shared/automation'
import type { TProcessId } from '@shared/schemas/jobs'

export const defineRowFlow = <K extends TProcessId>(def: RowFlow<K>) => def

export const pregCheckRowFlow = defineRowFlow<'pregCheck'>({
  setup: function* () {
    const { username, password } = credentialsCache.get()
    yield* login(site, username, password)
  },
  row: function* (data) {
    const profileScope = yield* openProfile(site.authed, data.recipTag)
    const breedingScope = yield* openBreedingTab(profileScope)
    const screenshot = yield* checkOrFillPreg(breedingScope, data)
    return { screenshot }
  },
  recover: function* () {
    yield* act.goto(ROOT_URL)
  }
})

export const breedingRowFlow = defineRowFlow<'breeding'>({
  setup: function* () {
    const { username, password } = credentialsCache.get()
    yield* login(site, username, password)
  },
  row: function* (data) {
    const profileScope = yield* openProfile(site.authed, data.recipTag)
    const breedingScope = yield* openBreedingTab(profileScope)
    const screenshot = yield* checkOrFillBreed(breedingScope, data)
    return { screenshot }
  },
  recover: function* () {
    yield* act.goto(ROOT_URL)
  }
})

export const flushRowFlow = defineRowFlow<'flush'>({
  setup: function* () {
    const { username, password } = credentialsCache.get()
    yield* login(site, username, password)
  },
  row: function* (data) {
    const profileScope = yield* openProfile(site.authed, data.donorTag)
    const embryoScope = yield* openEmbryoTab(profileScope)
    const screenshot = yield* checkOrFillFlush(embryoScope, data)
    return { screenshot }
  },
  recover: function* () {
    yield* act.goto(ROOT_URL)
  }
})

export type Flows = { [K in TProcessId]: RowFlow<K> }
export const flows: Flows = {
  pregCheck: pregCheckRowFlow,
  breeding: breedingRowFlow,
  flush: flushRowFlow
}
