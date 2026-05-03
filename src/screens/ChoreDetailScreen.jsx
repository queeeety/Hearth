import { useParams, useNavigate } from 'react-router-dom'
import { format, startOfMonth, startOfYear } from 'date-fns'
import { ChevronLeft } from 'lucide-react'
import { useChore, useChoreHistory, useAssignments, useOnDemandNextUp } from '../hooks/useChores'
import { getThisMonday, formatTimeAgo } from '../lib/utils'
import { useLogView } from '../contexts/LogViewContext'
import Avatar from '../components/ui/Avatar'

function recurrenceLabel(days) {
  if (!days) return 'On demand'
  if (days <= 7) return 'Weekly'
  if (days <= 14) return 'Biweekly'
  if (days <= 31) return 'Monthly'
  return `Every ${days} days`
}

function WeightDots({ weight = 1 }) {
  const filled = Math.round(weight)
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < filled ? 'bg-green-primary' : 'bg-[rgba(60,60,67,0.15)]'}`}
        />
      ))}
    </div>
  )
}

export default function ChoreDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { openLogView } = useLogView()
  const thisMonday = getThisMonday()

  const { data: chore, isLoading } = useChore(id)
  const { data: history } = useChoreHistory(id, 20)
  const { data: assignments } = useAssignments(thisMonday)
  const { data: nextUp } = useOnDemandNextUp(id, chore?.category === 'on_demand')

  const assignment = assignments?.find(a => a.chore_id === id)

  const monthStr = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const yearStr = format(startOfYear(new Date()), 'yyyy-MM-dd')
  const doneThisMonth = history?.filter(l => (l.done_at ?? l.logged_at) >= monthStr).length ?? 0
  const doneThisYear = history?.filter(l => (l.done_at ?? l.logged_at) >= yearStr).length ?? 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-green-primary border-t-transparent animate-spin" />
      </div>
    )
  }
  if (!chore) return null

  return (
    <div>
      <div style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }} className="px-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-green-primary text-[17px] active:opacity-60 transition-opacity -ml-1"
        >
          <ChevronLeft size={20} />
          <span>Chores</span>
        </button>
      </div>

      <div className="mx-4 bg-white rounded-ios p-5 mb-3">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{chore.icon}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold text-black leading-tight">{chore.name}</h1>
            <p className="text-[15px] text-[rgba(60,60,67,0.5)] mt-1">
              {recurrenceLabel(chore.recurrence_days)}
            </p>
          </div>
        </div>
        <WeightDots weight={chore.weight} />
        {chore.description && (
          <p className="text-[15px] text-[rgba(60,60,67,0.6)] leading-relaxed mt-4">
            {chore.description}
          </p>
        )}
      </div>

      <div className="mx-4 bg-white rounded-ios p-4 mb-3">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-3">
          {chore.category === 'on_demand' ? 'Up next' : 'This week'}
        </p>
        {chore.category === 'on_demand' ? (
          nextUp ? (
            <div className="flex items-center gap-3">
              <Avatar flatmate={nextUp} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-medium text-black">{nextUp.name}</p>
                {chore.skip_if_away_days && (
                  <p className="text-[13px] text-[rgba(60,60,67,0.5)]">
                    Turn skipped if away ≥ {chore.skip_if_away_days} days
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[15px] text-[rgba(60,60,67,0.5)]">No history yet</p>
          )
        ) : assignment ? (
          <div className="flex items-center gap-3">
            <Avatar
              flatmate={assignment.completed
                ? (assignment.completed_by_flatmate ?? assignment.flatmate)
                : assignment.flatmate}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-medium text-black">
                {assignment.completed
                  ? (assignment.completed_by_flatmate?.name ?? assignment.flatmate?.name)
                  : assignment.flatmate?.name}
              </p>
              <p className="text-[13px] text-[rgba(60,60,67,0.5)]">
                {assignment.completed
                  ? assignment.completed_by !== assignment.flatmate_id
                    ? `Done for ${assignment.flatmate?.name} · ${formatTimeAgo(assignment.completed_at)}`
                    : `Done ${formatTimeAgo(assignment.completed_at)}`
                  : 'Assigned this week'}
              </p>
            </div>
            {assignment.completed && (
              <div className="w-7 h-7 rounded-full bg-green-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[15px] text-[rgba(60,60,67,0.5)]">Not scheduled this week</p>
        )}
      </div>

      <div className="mx-4 bg-white rounded-ios p-4 mb-3">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-3">
          Stats
        </p>
        <div className="flex">
          <div className="flex-1 text-center py-1">
            <p className="text-[22px] font-bold text-black leading-none">{doneThisMonth}</p>
            <p className="text-[12px] text-[rgba(60,60,67,0.5)] mt-1">This month</p>
          </div>
          <div className="w-px bg-[rgba(60,60,67,0.08)]" />
          <div className="flex-1 text-center py-1">
            <p className="text-[22px] font-bold text-black leading-none">{doneThisYear}</p>
            <p className="text-[12px] text-[rgba(60,60,67,0.5)] mt-1">This year</p>
          </div>
          <div className="w-px bg-[rgba(60,60,67,0.08)]" />
          <div className="flex-1 text-center py-1">
            <p className="text-[15px] font-semibold text-black leading-none">
              {recurrenceLabel(chore.recurrence_days)}
            </p>
            <p className="text-[12px] text-[rgba(60,60,67,0.5)] mt-1">Schedule</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4">
        <button
          onClick={() => openLogView({ choreId: id, choreName: chore.name, chore })}
          className="w-full bg-green-primary text-white text-[17px] font-semibold rounded-ios py-4 active:bg-green-dark transition-colors"
        >
          Log this chore
        </button>
      </div>

      {history && history.length > 0 && (
        <section className="mx-4 mb-6">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-2 px-1">
            History
          </p>
          <div className="bg-white rounded-ios overflow-hidden">
            {history.map(log => (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(60,60,67,0.08)] last:border-0"
              >
                {log.is_vacation_skip ? (
                  <>
                    <span className="text-xl w-7 text-center flex-shrink-0 opacity-40">🏖️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-[rgba(60,60,67,0.5)]">{log.flatmate?.name}</p>
                      <p className="text-[13px] text-[rgba(60,60,67,0.4)]">Turn skipped · away</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar flatmate={log.flatmate} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-black">{log.flatmate?.name}</p>
                      <p className="text-[13px] text-[rgba(60,60,67,0.5)]">{formatTimeAgo(log.done_at ?? log.logged_at)}</p>
                    </div>
                    {log.note && (
                      <p className="text-[13px] text-[rgba(60,60,67,0.5)] max-w-[120px] truncate">{log.note}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
