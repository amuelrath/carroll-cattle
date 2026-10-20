const DAY_MS = 86_400_000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Whole calendar days between `date` and now (0 = today, 1 = yesterday, ...) */
export function daysAgo(date: Date | string, now = new Date()) {
  const diff = startOfDay(now).getTime() - startOfDay(new Date(date)).getTime()
  return Math.round(diff / DAY_MS) // round, not floor, so DST shifts don't break it
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const dateFmt = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' })

export function dayLabel(days: number, date: Date | string) {
  if (days < 7) return rtf.format(-days, 'day') // "today", "yesterday", "2 days ago"
  return dateFmt.format(new Date(date)) // "Monday, Oct 5"
}
