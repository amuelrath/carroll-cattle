import { fakeFlow, fakePage } from '@main/automation/flows/fake-flow'
import { fillPregCheck } from '@main/automation/flows/preg-check'
import { site } from '@main/automation/site'
import type { TFileRow } from '@shared/schemas/jobs'
import { describe, expect, it } from 'vitest'

const form = site.authed.profile.breedingTab

describe('fillPregCheck', () => {
  it('should enter base values', () => {
    const row: TFileRow<'pregCheck'> = {
      recipTag: '1234',
      date: '09-26-2026',
      method: 'Observation',
      technician: 'Dr. White',
      result: 'Pregnant',
      // extra fields that shouldn't be added
      timePreg: 6,
      sex: 'Heifer'
    }

    const { actions } = fakeFlow(fillPregCheck(form, row), fakePage())

    expect(actions.some((act) => act.input === '6')).toBe(false)
    expect(actions.some((act) => act.input === 'Heifer')).toBe(false)
    expect(actions.map((act) => act.type)).toMatchInlineSnapshot(`
      [
        "click",
        "fill",
        "select",
        "select",
        "select",
        "click",
      ]
    `)
  })

  it('should enter timePreg when method != observation', () => {
    const row: TFileRow<'pregCheck'> = {
      recipTag: '1234',
      date: '09-26-2026',
      method: 'Palpation',
      technician: 'Dr. White',
      result: 'Pregnant',
      // extra fields that should be added
      timePreg: 6,
      sex: 'Heifer',
      comments: 'Test Comment!'
    }

    const { actions } = fakeFlow(fillPregCheck(form, row), fakePage())

    expect(actions.some((act) => act.input === '6')).toBe(true)
    expect(actions.some((act) => act.input === 'Test Comment!')).toBe(true)
    expect(actions.some((act) => act.input === 'Heifer')).toBe(false)
    expect(actions.map((act) => act.type)).toMatchInlineSnapshot(`
      [
        "click",
        "fill",
        "select",
        "select",
        "select",
        "fill",
        "fill",
        "click",
      ]
    `)
  })

  it('should enter the sex when method = ultrasound', () => {
    const row: TFileRow<'pregCheck'> = {
      recipTag: '1234',
      date: '09-26-2026',
      method: 'Ultrasound',
      technician: 'Dr. White',
      result: 'Pregnant',
      sex: 'Heifer'
    }

    const { actions } = fakeFlow(fillPregCheck(form, row), fakePage())
    expect(actions.some((act) => act.input === 'Heifer')).toBe(true)
    expect(actions.map((act) => act.type)).toMatchInlineSnapshot(`
      [
        "click",
        "fill",
        "select",
        "select",
        "select",
        "select",
        "click",
      ]
    `)
  })

  it('should submit after inputting all values', () => {
    const row: TFileRow<'pregCheck'> = {
      recipTag: '1234',
      date: '09-26-2026',
      method: 'Ultrasound',
      technician: 'Dr. White',
      result: 'Pregnant',
      sex: 'Heifer'
    }

    const { actions } = fakeFlow(fillPregCheck(form, row), fakePage())
    expect(actions.map((act) => act.type).at(-1)).toBe('click')
  })

  it('should not throw if a base value is missing', () => {
    // parseAction will throw instead.
    const row = {
      recipTag: '1234',
      // date: '09-26-2026',
      method: 'Ultrasound',
      technician: 'Dr. White',
      result: 'Pregnant',
      sex: 'Heifer'
    } as unknown as TFileRow<'pregCheck'>

    expect(() => fakeFlow(fillPregCheck(form, row), fakePage())).not.toThrow()
  })
})
