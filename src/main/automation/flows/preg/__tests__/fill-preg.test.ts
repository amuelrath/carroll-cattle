import { fakeFlow, pageResponses } from '@main/automation/flows/__tests__/_fake-flow'
import { PregRowArb } from '@main/automation/flows/preg/__tests__/_arbs'
import { fillPreg } from '@main/automation/flows/preg/helpers'
import { site } from '@main/automation/site'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const tab = site.authed.profile.breedingTab

describe('fillPreg', () => {
  it('fills the correct fields', () => {
    fc.assert(
      fc.property(PregRowArb, (row) => {
        const { pregCheckForm: form } = tab
        const { actions } = fakeFlow(fillPreg(tab, row), pageResponses())

        const expected: [unknown, string][] = [
          [form.date, row.date],
          [form.method, row.method],
          [form.technician, row.technician],
          [form.result, row.result]
        ]
        if (row.method !== 'Observation' && row.timePreg) {
          expected.push([form.timePregnant, String(row.timePreg)])
        }
        if (row.method === 'Ultrasound' && row.sex) {
          expected.push([form.ultrasoundSex, row.sex])
        }
        if (row.comments) expected.push([form.comments, row.comments])

        const filled = actions
          .filter((a) => a.input !== undefined)
          .map((a) => [a.target?.at(-1), a.input])

        expect(filled).toEqual(expected)
      })
    )
  })
})
