import { useNavigate } from 'react-router-dom'
import { format, parseISO, subDays } from 'date-fns'
import { Settings } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'
import { useAssignments, useMissedAssignments, useRecentLogs } from '../hooks/useChores'
import { useSupplies } from '../hooks/useSupplies'
import { getThisMonday, getGreeting } from '../lib/utils'
import CompletionRing from '../components/stats/CompletionRing'
import WeekCalendarStrip from '../components/chores/WeekCalendarStrip'
import ChoreCard from '../components/chores/ChoreCard'
import ActivityFeed from '../components/stats/ActivityFeed'

export default function HomeScreen() {
  const { flatmate } = useSession()
  const navigate = useNavigate()
  const thisMonday = getThisMonday()
  const lastMonday = format(subDays(parseISO(thisMonday), 7), 'yyyy-MM-dd')

  const { data: assignments } = useAssignments(thisMonday)
  const { data: missedAssignments } = useMissedAssignments(lastMonday)
  const { data: recentLogs } = useRecentLogs(5)
  const { data: supplies } = useSupplies()

  const today = format(new Date(), 'EEEE, d MMM')
  const total = assignments?.length ?? 0
  const completed = assignments?.filter(a => a.completed).length ?? 0
  const upcoming = (assignments ?? []).filter(a => !a.completed).slice(0, 5)
  const needsAttention = (supplies ?? []).filter(s => s.status !== 'stocked')

  return (
    <div>
      <div
        className="px-4 pb-3 flex items-start justify-between"
        style={{ paddingTop: 'max(20px, env(safe-area-inset-top))' }}
      >
        <div>
          <h1 className="text-[28px] font-bold text-black leading-tight">
            {getGreeting(flatmate.name)}
          </h1>
          <p className="text-[15px] text-[rgba(60,60,67,0.6)] mt-0.5">{today}</p>
        </div>
        <button
          onClick={() => navigate('/me')}
          className="p-2 -mr-1 mt-1 active:opacity-60 transition-opacity"
        >
          <Settings size={22} className="text-[rgba(60,60,67,0.45)]" />
        </button>
      </div>

      <div className="mx-4 bg-white rounded-ios px-4 pb-4 mb-3">
        <CompletionRing completed={completed} total={total} />
        <WeekCalendarStrip weekStart={thisMonday} logs={recentLogs ?? []} />
      </div>

      {missedAssignments?.length > 0 && (
        <section className="mx-4 mb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-ios-amber mb-2 px-1">
            ⚠️ Missed last week
          </p>
          <div className="rounded-ios overflow-hidden">
            {missedAssignments.map(a => (
              <ChoreCard
                key={a.id}
                assignment={a}
                label={a.flatmate?.name}
                onClick={() => navigate(`/chores/${a.chore_id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mx-4 mb-3">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-2 px-1">
            This week
          </p>
          <div className="rounded-ios overflow-hidden">
            {upcoming.map(a => (
              <ChoreCard
                key={a.id}
                assignment={a}
                label={a.flatmate?.name}
                onClick={() => navigate(`/chores/${a.chore_id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {needsAttention.length > 0 && (
        <section className="mx-4 mb-3">
          <button
            onClick={() => navigate('/buyings')}
            className="w-full bg-[rgba(255,149,0,0.1)] rounded-ios p-4 text-left active:opacity-70 transition-opacity"
          >
            <p className="text-[15px] font-semibold text-ios-amber">
              🛒 {needsAttention.length} {needsAttention.length === 1 ? 'supply needs' : 'supplies need'} attention
            </p>
            <p className="text-[13px] text-[rgba(60,60,67,0.5)] mt-0.5">
              {needsAttention.map(s => s.name).join(', ')}
            </p>
          </button>
        </section>
      )}

      <section className="mx-4 mb-6">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-2 px-1">
          Recently done
        </p>
        <div className="bg-white rounded-ios overflow-hidden">
          <ActivityFeed logs={recentLogs} />
        </div>
      </section>
    </div>
  )
}
