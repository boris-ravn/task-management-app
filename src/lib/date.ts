export function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isOverdue(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseDateLocal(dateStr) < today
}

export function formatDueDate(dateStr: string): string {
  const date = parseDateLocal(dateStr)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'TODAY'
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month}, ${year}`.toUpperCase()
}
