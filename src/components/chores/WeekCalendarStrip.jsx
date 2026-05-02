import { format, addDays, parseISO } from 'date-fns'

export default function WeekCalendarStrip({ weekStart, logs = [] }) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(parseISO(weekStart), i)
    const dateStr = format(d, 'yyyy-MM-dd')
    return {
      dateStr,
      letter: format(d, 'EEEEE'),
      num: format(d, 'd'),
      isToday: dateStr === todayStr,
    }
  })

  const loggedDays = new Set(
    logs
      .map(l => l.done_at ?? l.logged_at)
      .filter(d => d && d.slice(0, 10) >= weekStart)
      .map(d => d.slice(0, 10))
  )

  return (
    <div className="flex justify-between px-2 pt-3">
      {days.map(day => (
        <div key={day.dateStr} className="flex flex-col items-center gap-1">
          <span className="text-[11px] text-[rgba(60,60,67,0.45)] font-medium">{day.letter}</span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              day.isToday ? 'bg-green-primary' : ''
            }`}
          >
            <span className={`text-[15px] font-medium ${day.isToday ? 'text-white' : 'text-black'}`}>
              {day.num}
            </span>
          </div>
          <div className="h-1.5 flex items-center justify-center">
            {loggedDays.has(day.dateStr) && (
              <div className="w-1.5 h-1.5 rounded-full bg-green-primary" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
