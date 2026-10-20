import { sel } from '@shared/automation'
import { parseSelector } from '@shared/automation/sel'
import { describe, expect, it } from 'vitest'

describe('sel', () => {
  it('puts `options` in output even when there are no options', () => {
    expect(sel.id('#someId')).toStrictEqual({
      type: 'id',
      input: '#someId',
      options: undefined
    })
  })

  it('passes specified options to the output', () => {
    expect(sel.role('tab', { hasText: 'Profile' })).toStrictEqual({
      type: 'role',
      input: 'tab',
      options: {
        hasText: 'Profile'
      }
    })
  })
})

describe('parseSelector', () => {
  it('accept a valid selector', () => {
    const raw = { type: 'css', input: 'div' }
    expect(parseSelector(raw)).toStrictEqual({
      type: 'css',
      input: 'div',
      options: undefined
    })
  })

  it('sets `options` to undefined when not specified for a selector that has options', () => {
    const raw = { type: 'role', input: 'tab' }
    expect(parseSelector(raw)).toStrictEqual({
      type: 'role',
      input: 'tab',
      options: undefined
    })
  })

  it('should error when an invalid type is passed in', () => {
    const raw = { type: 'invalid', input: '#someId' }
    expect(() => parseSelector(raw)).toThrow()
  })

  it('rejects options if the def does not specify options', () => {
    const raw = { type: 'label', input: '#someId', options: { hasText: 'Button' } }
    expect(() => parseSelector(raw)).toThrow()
  })

  it('rejects options that are not in the selector def', () => {
    const raw = { type: 'role', input: 'tab', options: { invalidOption: true } }
    expect(() => parseSelector(raw)).toThrow()
  })
})
