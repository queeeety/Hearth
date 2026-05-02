import { startOfWeek, format, formatDistanceToNow, parseISO } from 'date-fns'

export function getThisMonday() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function getWeekStart(date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function formatTimeAgo(dateString) {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch {
    return ''
  }
}

export function getGreeting(name) {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12)  return `Good morning, ${name} 🌅`
  if (hour >= 12 && hour < 18) return `Good afternoon, ${name} ☀️`
  return `Good evening, ${name} 🌙`
}
