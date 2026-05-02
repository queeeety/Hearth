import { useState } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'
import { useLogView } from '../contexts/LogViewContext'
import { useAssignments } from '../hooks/useChores'
import { useSuppliesForFlatmate } from '../hooks/useSupplies'
import { getThisMonday } from '../lib/utils'
import PageHeader from '../components/layout/PageHeader'
import FlatmateSwitcher from '../components/ui/FlatmateSwitcher'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

export default function MyWorkScreen() {
  const { flatmate: sessionFlatmate } = useSession()
  const { openLogView } = useLogView()
  const [activeFlatmate, setActiveFlatmate] = useState(() => sessionFlatmate)
  const thisMonday = getThisMonday()

  const { data: allAssignments } = useAssignments(thisMonday)
  const { data: mySupplies } = useSuppliesForFlatmate(activeFlatmate?.id)

  const myAssignments = (allAssignments ?? []).filter(
    a => a.flatmate_id === activeFlatmate?.id ||
         (a.completed && a.completed_by === activeFlatmate?.id)
  )
  const seen = new Set()
  const myAssignmentsUnique = myAssignments.filter(a => seen.has(a.id) ? false : seen.add(a.id))
  const incomplete = myAssignmentsUnique.filter(a => !a.completed)
  const done = myAssignmentsUnique.filter(a => a.completed)

  function handleChoreLog(a) {
    openLogView({
      choreId: a.chore_id,
      choreName: a.chore?.name,
      chore: a.chore,
      doneBy: activeFlatmate.id,
    })
  }

  return (
    <div>
      <PageHeader title="My Work" />

      <div className="px-4 mb-4">
        <FlatmateSwitcher
          activeFlatmateId={activeFlatmate?.id}
          onSwitch={setActiveFlatmate}
        />
      </div>

      <section className="mb-4">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] px-4 mb-2">
          Chores this week
        </p>

        {myAssignmentsUnique.length === 0 ? (
          <div className="mx-4">
            <EmptyState icon="✅" heading="Nothing assigned" body="No chores this week" />
          </div>
        ) : (
          <div className="mx-4 bg-white rounded-ios overflow-hidden">
            {incomplete.map(a => (
              <button
                key={a.id}
                onClick={() => handleChoreLog(a)}
                className="flex items-center gap-3 px-4 py-3 w-full text-left active:opacity-70 transition-opacity border-b border-[rgba(60,60,67,0.08)] last:border-0"
              >
                <span className="text-2xl w-8 text-center flex-shrink-0">{a.chore?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-medium text-black truncate">{a.chore?.name}</p>
                  {a.carry_forward && (
                    <p className="text-[12px] text-ios-amber mt-0.5">Carried from last week</p>
                  )}
                </div>
                <Circle size={20} className="text-[rgba(60,60,67,0.2)] flex-shrink-0" />
              </button>
            ))}
            {done.map(a => {
              const didForOther = a.flatmate_id !== activeFlatmate?.id
              const doneByOther = a.completed_by !== activeFlatmate?.id
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(60,60,67,0.08)] last:border-0 opacity-50"
                >
                  <span className="text-2xl w-8 text-center flex-shrink-0">{a.chore?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-medium text-black truncate line-through">{a.chore?.name}</p>
                    {didForOther && (
                      <p className="text-[12px] text-[rgba(60,60,67,0.5)] mt-0.5">
                        Helped {a.flatmate?.name}
                      </p>
                    )}
                    {!didForOther && doneByOther && a.completed_by_flatmate && (
                      <p className="text-[12px] text-[rgba(60,60,67,0.5)] mt-0.5">
                        Done by {a.completed_by_flatmate.name}
                      </p>
                    )}
                  </div>
                  <CheckCircle size={20} className="text-green-primary flex-shrink-0" />
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="mb-6">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] px-4 mb-2">
          Your buyings
        </p>

        {!mySupplies || mySupplies.length === 0 ? (
          <div className="mx-4">
            <EmptyState icon="🛒" heading="Nothing to buy" body="No supplies assigned to you" />
          </div>
        ) : (
          <div className="mx-4 bg-white rounded-ios overflow-hidden">
            {mySupplies.map(s => (
              <button
                key={s.id}
                onClick={() => openLogView({
                  supplyId: s.id,
                  supplyName: s.name,
                  supply: s,
                  type: 'buying',
                  doneBy: activeFlatmate.id,
                })}
                className="flex items-center gap-3 px-4 py-3 w-full text-left active:opacity-70 transition-opacity border-b border-[rgba(60,60,67,0.08)] last:border-0"
              >
                <span className="text-2xl w-8 text-center flex-shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-medium text-black truncate">{s.name}</p>
                  <p className="text-[13px] text-[rgba(60,60,67,0.5)] mt-0.5">You're up next</p>
                </div>
                <Badge status={s.status} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
