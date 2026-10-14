import { z } from 'zod'

type GetIssueDetails = z.core.$ZodIssue

export function getIssueDetails(issue: GetIssueDetails): string {
  let detail: string

  switch (issue.code) {
    case 'invalid_type': {
      detail = `Must be a ${issue.expected}`
      break
    }

    case 'invalid_value': {
      const options = issue.values.map(formatValue).join(', ')
      detail = `Must be one of: ${options}`
      break
    }

    case 'too_small': {
      const noun = sizeNoun(issue.origin)
      const comparator = issue.inclusive ? 'at least' : 'more than'
      detail = `Must have ${comparator} ${issue.minimum} ${noun}`
      break
    }

    case 'too_big': {
      const noun = sizeNoun(issue.origin)
      const comparator = issue.inclusive ? 'at most' : 'less than'
      detail = `Must have ${comparator} ${issue.maximum} ${noun}`
      break
    }

    case 'invalid_format': {
      detail = `Invalid ${issue.format}`
      break
    }

    case 'not_multiple_of': {
      detail = `Must be a multiple of ${issue.divisor}`
      break
    }

    case 'unrecognized_keys': {
      detail = `Unrecognized field${issue.keys.length > 1 ? 's' : ''}: ${issue.keys.join(', ')}`
      break
    }

    case 'invalid_union': {
      detail = 'Value did not match any of the expected formats'
      break
    }

    case 'invalid_key': {
      detail = `Invalid key in ${issue.origin ?? 'object'}`
      break
    }

    case 'invalid_element': {
      detail = `Invalid item in ${issue.origin ?? 'collection'}`
      break
    }

    case 'custom': {
      detail = issue.message ?? 'Invalid value'
      break
    }

    default: {
      detail = 'Invalid value'
    }
  }

  return detail
}

function sizeNoun(origin: string | undefined): string {
  switch (origin) {
    case 'string':
      return 'characters'
    case 'array':
      return 'items'
    case 'number':
    case 'int':
    case 'bigint':
      return ''
    case 'set':
    case 'map':
      return 'entries'
    default:
      return 'items'
  }
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
