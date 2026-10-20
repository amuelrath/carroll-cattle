export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[_\-\s]+/g, '') // strip spaces, underscores, hyphens
    .trim()
}
