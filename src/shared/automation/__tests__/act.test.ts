import { sel } from '@shared/automation'
import { describe, expect, it } from 'vitest'
import { act, parseAction } from '../act'

const selectorA = sel.text('selectorA')
const selectorB = sel.text('selectorB')
const firstYield = (flow: Generator) => flow.next().value

describe('act', () => {
  it('puts input in `input` when there is no target', () => {
    expect(firstYield(act.goto('https://google.com'))).toStrictEqual({
      kind: 'dispatch',
      action: { type: 'goto', target: undefined, input: 'https://google.com' }
    })
  })

  it('wraps a single selector in an array', () => {
    expect(firstYield(act.click(selectorA)).action.target).toStrictEqual([selectorA])
  })

  it('keeps an array of selectors as-is', () => {
    expect(firstYield(act.click([selectorA, selectorB])).action.target).toStrictEqual([
      selectorA,
      selectorB
    ])
  })

  it('takes input from the second argument when there is a target', () => {
    expect(firstYield(act.fill(selectorA, 'hello')).action).toStrictEqual({
      type: 'fill',
      target: [selectorA],
      input: 'hello'
    })
  })

  it.each(['click', 'check', 'uncheck', 'getText', 'getIsVisible'] as const)(
    '%s has target and no input',
    (type) => {
      expect(firstYield(act[type](selectorA)).action).toStrictEqual({
        type,
        target: [selectorA],
        input: undefined
      })
    }
  )
})

describe('parseAction', () => {
  it('accepts a valid action with no target', () => {
    const raw = { type: 'goto', input: 'https://www.google.com', target: undefined }
    expect(parseAction(raw)).toStrictEqual({
      type: 'goto',
      input: 'https://www.google.com',
      target: undefined
    })
  })

  it('accepts a valid input with a target', () => {
    const raw = { type: 'fill', target: [selectorA], input: 'Austin' }
    expect(parseAction(raw)).toStrictEqual({
      type: 'fill',
      target: [selectorA],
      input: 'Austin'
    })
  })

  it('rejects unknown types', () => {
    const raw = { type: 'unknown', target: undefined, input: undefined }
    expect(() => parseAction(raw)).toThrow()
  })

  it('rejects targets when the action does not allow them', () => {
    const raw = { type: 'goto', input: 'https://www.google.com', target: [selectorA] }
    expect(() => parseAction(raw)).toThrow('goto: target not allowed')
  })

  it('rejects input when the action does not allow them', () => {
    const raw = { type: 'click', input: 'notAllowed', target: [selectorA] }
    expect(() => parseAction(raw)).toThrow('click: input not allowed')
  })

  it.each(['', 0, false, null])('rejects input %j on an action with no input', (input) => {
    expect(() => parseAction({ type: 'click', target: [selectorA], input })).toThrow(
      'click: input not allowed'
    )
  })

  it('rejects a missing target when one is required', () => {
    expect(() => parseAction({ type: 'click' })).toThrow()
  })

  it('rejects an empty target array', () => {
    expect(() => parseAction({ type: 'click', target: [] })).toThrow()
  })

  it('rejects invalid input for the action', () => {
    expect(() => parseAction({ type: 'goto', input: 'not a url' })).toThrow()
  })

  it('rejects an invalid selector inside target', () => {
    expect(() => parseAction({ type: 'click', target: [{ type: 'nope', input: 'x' }] })).toThrow()
  })

  it('rejects an undefined input when the def requires one', () => {
    expect(() => parseAction({ type: 'fill', target: [{ type: 'nope', input: undefined }] }))
  })
})
