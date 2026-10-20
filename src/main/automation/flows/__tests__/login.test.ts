import { login } from '@main/automation/flows/login'
import { describe, expect, it } from 'vitest'
import { site } from '../../site'
import { fakeFlow, respond } from '../fake-flow'

describe('login', () => {
  it('acts in the correct order', () => {
    const { actions } = fakeFlow(
      login(site),
      respond([{ goto: undefined }, { fill: undefined }, { fill: undefined }, { click: undefined }])
    )

    expect(actions.map((a) => a.type)).toEqual(['goto', 'fill', 'fill', 'click'])
  })
})
