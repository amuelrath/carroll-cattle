import { fakeFlow } from '@main/automation/flows/__tests__/_fake-flow'
import { reconcile } from '@main/automation/flows/reconcile'
import type { Flow } from '@main/automation/types'
import { RowIssue } from '@shared/automation/errors'
import { describe, expect, it } from 'vitest'

describe('reconcile', () => {
  const noop = function* () {
    /* empty */
  } as () => Flow

  it('returns done', () => {
    const { result } = fakeFlow(
      reconcile({
        init: 0,
        observe: noop,
        decide: () => ({ done: 'ok' }),
        // eslint-disable-next-line require-yield
        execute: function* (_, m) {
          return m
        }
      }),
      () => undefined
    )
    expect(result).toBe('ok')
  })

  it('throws fail', () => {
    expect(() =>
      fakeFlow(
        reconcile({
          init: 0,
          observe: noop,
          decide: () => ({ fail: new RowIssue('REVIEW', 'x') }),
          // eslint-disable-next-line require-yield
          execute: function* (_, m) {
            return m
          }
        }),
        () => undefined
      )
    ).toThrow('x')
  })

  it('threads memory through execute', () => {
    const { result } = fakeFlow(
      reconcile({
        init: 0,
        observe: noop,
        decide: (_, n) => (n < 3 ? { act: 'inc' } : { done: n }),
        // eslint-disable-next-line require-yield
        execute: function* (_, n) {
          return n + 1
        }
      }),
      () => undefined
    )
    expect(result).toBe(3)
  })

  it('stops loops that never settle', () => {
    expect(() =>
      fakeFlow(
        reconcile({
          init: 0,
          observe: noop,
          decide: () => ({ act: 'again' }),
          // eslint-disable-next-line require-yield
          execute: function* (_, m) {
            return m
          },
          maxSteps: 3
        }),
        () => undefined
      )
    ).toThrow('did not settle')
  })
})
