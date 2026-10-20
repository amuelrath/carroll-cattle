import { getIssueDetails } from '@shared/lib/get-issue-details'
import { getCellEdits, getCellErrors, projectRow } from '@shared/lib/sheet'
import { ZCellEdit } from '@shared/schemas/trpc'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

describe('getCellEdits', () => {
  it('should say when a single value changes', () => {
    const before = { name: 'Austin', age: '23' }
    const after = { name: 'Austin', age: '24' }
    expect(getCellEdits(before, after)).toStrictEqual([
      {
        key: 'age',
        from: '23',
        to: '24'
      }
    ])
  })

  it('should say when a single value changes to null', () => {
    const before = { name: 'Austin', age: '23' }
    const after = { name: 'Austin', age: null }
    expect(getCellEdits(before, after)).toStrictEqual([
      {
        key: 'age',
        from: '23',
        to: null
      }
    ])
  })

  it('should say when a single value changes from null', () => {
    const before = { name: 'Austin', age: null }
    const after = { name: 'Austin', age: '24' }
    expect(getCellEdits(before, after)).toStrictEqual([
      {
        key: 'age',
        from: null,
        to: '24'
      }
    ])
  })

  it('should return an empty array when there are no diffs', () => {
    const beforeA = {}
    const afterA = {}
    expect(getCellEdits(beforeA, afterA)).toStrictEqual([])

    const beforeB = { name: 'Austin', age: '24' }
    const afterB = { name: 'Austin', age: '24' }
    expect(getCellEdits(beforeB, afterB)).toStrictEqual([])
  })

  it('should say when multiple values change', () => {
    const before = { name: 'Austin', age: '23' }
    const after = { name: 'Jim', age: '24' }
    expect(getCellEdits(before, after)).toStrictEqual([
      { key: 'name', from: 'Austin', to: 'Jim' },
      { key: 'age', from: '23', to: '24' }
    ])
  })

  it('should treat a missing key as having a null value', () => {
    const before = { name: 'Austin', age: '23' }
    const after = { name: 'Austin' }
    expect(getCellEdits(before, after)).toStrictEqual([
      {
        key: 'age',
        from: '23',
        to: null
      }
    ])

    expect(getCellEdits(after, before)).toStrictEqual([
      {
        key: 'age',
        from: null,
        to: '23'
      }
    ])
  })

  it('should treat a missing key and an explicit null as equal', () => {
    expect(getCellEdits({ a: null }, {})).toEqual([])
    expect(getCellEdits({}, { a: null })).toEqual([])
  })

  it('is case-sensitive when comparing values', () => {
    expect(getCellEdits({ a: 'abc' }, { a: 'ABC' })).toStrictEqual([
      {
        key: 'a',
        from: 'abc',
        to: 'ABC'
      }
    ])
  })

  it('should treat an empty string as null', () => {
    const before = { name: 'Austin', age: null }
    const after = { name: 'Austin', age: '' }
    expect(getCellEdits(before, after)).toStrictEqual([])
    expect(getCellEdits(after, before)).toStrictEqual([])
  })

  it('should treat a whitespace as null', () => {
    const before = { name: 'Austin', age: '23' }
    const after = { name: 'Austin', age: ' ' }
    expect(getCellEdits(before, after)).toStrictEqual([
      {
        key: 'age',
        from: '23',
        to: null
      }
    ])
  })

  it('should validate against ZCellChange', () => {
    const before = { name: 'Austin', age: '23' }
    const after = { name: 'Austin', age: '24' }

    expect(ZCellEdit.parse(getCellEdits(before, after)[0])).toStrictEqual({
      key: 'age',
      from: '23',
      to: '24'
    })
  })
})

vi.mock('@shared/lib/get-issue-details', () => ({
  getIssueDetails: vi.fn()
}))

const mockedGetIssueDetails = vi.mocked(getIssueDetails)

const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
  note: z.string().nullable()
})

describe('getCellErrors', () => {
  beforeEach(() => {
    mockedGetIssueDetails.mockReset()
    mockedGetIssueDetails.mockImplementation((issue) => `error:${String(issue.path[0])}`)
  })

  const map = { name: 'firstName', email: 'userEmail', note: 'note' }
  describe('when the row is valid', () => {
    it('should return an empty array when there are no errors', () => {
      const row = { firstName: 'Ada', userEmail: 'ada@example.com', note: null }
      expect(getCellErrors(row, schema, map)).toEqual([])
    })

    it('should not call getIssueDetails when there are no issues', () => {
      getCellErrors({ firstName: 'Ada', userEmail: 'ada@example.com', note: 'hi' }, schema, map)
      expect(mockedGetIssueDetails).not.toHaveBeenCalled()
    })
  })

  describe('when the row is invalid', () => {
    it('should return the a hint for one failing key', () => {
      const row = { firstName: '', userEmail: 'ada@example.com', note: null }
      expect(getCellErrors(row, schema, map)).toStrictEqual([
        { key: 'firstName', hint: 'error:name' }
      ])
    })

    it('should return hints for every failing key', () => {
      const row = { firstName: '', userEmail: 'not_an_email', note: null }
      expect(getCellErrors(row, schema, map)).toStrictEqual([
        { key: 'firstName', hint: 'error:name' },
        { key: 'userEmail', hint: 'error:email' }
      ])
    })
  })
})

describe('projectRow', () => {
  const cases = [
    {
      name: 'simple keys',
      columnMap: { a: 'b', c: 'd' },
      source: { b: 'something', d: 'something else' },
      projected: { a: 'something', c: 'something else' }
    },
    {
      name: 'keys with spaces',
      columnMap: { a: 'A Original', b: 'B Original' },
      source: { 'A Original': 'something', 'B Original': 'something else' },
      projected: { a: 'something', b: 'something else' }
    }
  ] as const

  it.each(cases)('projects $name', ({ columnMap, source, projected }) => {
    expect(projectRow(source, columnMap, { inverse: false })).toStrictEqual(projected)
  })

  it.each(cases)('inverse-projects $name', ({ columnMap, source, projected }) => {
    expect(projectRow(projected, columnMap, { inverse: true })).toStrictEqual(source)
  })

  it.each(cases)('round-trips $name', ({ columnMap, source }) => {
    const there = projectRow(source, columnMap, { inverse: false })
    const back = projectRow(there, columnMap, { inverse: true })
    expect(back).toStrictEqual(source)
  })
})
