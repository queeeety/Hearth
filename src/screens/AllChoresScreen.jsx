import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO, subDays } from 'date-fns'
import { useAssignments, useAllChores, useMissedAssignments } from '../hooks/useChores'
import { getThisMonday } from '../lib/utils'
import PageHeader from '../components/layout/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import ChoreCard from '../components/chores/ChoreCard'
import EmptyState from '../components/ui/EmptyState'

function recurrenceLabel(days) {
  if (!days) return 'On demand'
  if (days <= 7) return 'Weekly'
  if (days <= 14) return 'Biweekly'
  if (days <= 31) return 'Monthly'
  return `Every ${days} days`
}

export default function AllChoresScreen() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const thisMonday = getThisMonday()
  const lastMonday = format(subDays(parseISO(thisMonday), 7), 'yyyy-MM-dd')

  const { data: allChores } = useAllChores()
  const { data: thisWeekAssignments } = useAssignments(thisMonday)
  const { data: missedAssignments } = useMissedAssignments(lastMonday)

  const assignmentMap = useMemo(() => {
    const map = {}
    ;(thisWeekAssignments ?? []).forEach(a => { map[a.chore_id] = a })
    return map
  }, [thisWeekAssignments])

  const missedChoreIds = useMemo(
    () => new Set((missedAssignments ?? []).map(a => a.chore_id)),
    [missedAssignments]
  )

  const filtered = useMemo(() => {
    if (!search) return allChores ?? []
    const q = search.toLowerCase()
    return (allChores ?? []).filter(c => c.name.toLowerCase().includes(q))
  }, [allChores, search])

  const sections = useMemo(() => {
    const missed = []
    const dueThisWeek = []
    const doneThisWeek = []
    const onDemand = []
    const comingUp = []

    filtered.forEach(c => {
      if (missedChoreIds.has(c.id)) {
        const a = missedAssignments?.find(ma => ma.chore_id === c.id)
        missed.push({ chore: c, assignment: a, label: a?.flatmate?.name ?? 'Unassigned' })
      } else if (c.category === 'on_demand') {
        onDemand.push({ chore: c, label: 'Whenever needed' })
      } else if (assignmentMap[c.id]) {
        const a = assignmentMap[c.id]
        if (a.completed) {
          const doneBy = a.completed_by_flatmate?.name ?? a.flatmate?.name ?? '—'
          doneThisWeek.push({ chore: c, assignment: a, label: `Done · ${doneBy}` })
        } else {
          dueThisWeek.push({ chore: c, assignment: a, label: a.flatmate?.name ?? 'Unassigned' })
        }
      } else {
        comingUp.push({ chore: c, label: recurrenceLabel(c.recurrence_days) })
      }
    })
    return { missed, dueThisWeek, doneThisWeek, onDemand, comingUp }
  }, [filtered, missedChoreIds, assignmentMap, missedAssignments])

  const isEmpty = filtered.length === 0

  return (
    <div>
      <PageHeader title="Chores" />
      <div className="sticky top-0 z-10 bg-ios-bg px-4 py-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search chores…" />
      </div>

      {isEmpty ? (
        <EmptyState icon="🧹" heading="No chores found" body="Try a different search" />
      ) : (
        <>
          {sections.missed.length > 0 && (
            <section className="mb-4">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-ios-red px-4 mb-2">
                Missed
              </p>
              <div className="mx-4 bg-white rounded-ios overflow-hidden">
                {sections.missed.map(({ chore, assignment, label }) => (
                  <ChoreCard
                    key={chore.id}
                    chore={chore}
                    assignment={assignment}
                    label={label}
                    onClick={() => navigate(`/chores/${chore.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {sections.dueThisWeek.length > 0 && (
            <section className="mb-4">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] px-4 mb-2">
                Due this week
              </p>
              <div className="mx-4 bg-white rounded-ios overflow-hidden">
                {sections.dueThisWeek.map(({ chore, assignment, label }) => (
                  <ChoreCard
                    key={chore.id}
                    chore={chore}
                    assignment={assignment}
                    label={label}
                    onClick={() => navigate(`/chores/${chore.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {sections.comingUp.length > 0 && (
            <section className="mb-4">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] px-4 mb-2">
                Coming up
              </p>
              <div className="mx-4 bg-white rounded-ios overflow-hidden">
                {sections.comingUp.map(({ chore, label }) => (
                  <ChoreCard
                    key={chore.id}
                    chore={chore}
                    label={label}
                    onClick={() => navigate(`/chores/${chore.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {sections.onDemand.length > 0 && (
            <section className="mb-4">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] px-4 mb-2">
                On demand
              </p>
              <div className="mx-4 bg-white rounded-ios overflow-hidden">
                {sections.onDemand.map(({ chore, label }) => (
                  <ChoreCard
                    key={chore.id}
                    chore={chore}
                    label={label}
                    onClick={() => navigate(`/chores/${chore.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {sections.doneThisWeek.length > 0 && (
            <section className="mb-4 opacity-60">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] px-4 mb-2">
                Done this week
              </p>
              <div className="mx-4 bg-white rounded-ios overflow-hidden">
                {sections.doneThisWeek.map(({ chore, assignment, label }) => (
                  <ChoreCard
                    key={chore.id}
                    chore={chore}
                    assignment={assignment}
                    label={label}
                    onClick={() => navigate(`/chores/${chore.id}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
