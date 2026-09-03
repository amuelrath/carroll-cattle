import { isValid, parseISO } from 'date-fns'

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function isDate(value: unknown): boolean {
  if (value instanceof Date) return isValid(value)
  if (typeof value !== 'string') return false
  return isValid(parseISO(value))
}
