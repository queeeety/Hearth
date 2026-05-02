import { useState, useEffect, useRef } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { Check } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '../../contexts/SessionContext'
import { useError } from '../../contexts/ErrorContext'
import { useAssignments, useAllChores } from '../../hooks/useChores'
import { useSuppliesForFlatmate, useSupplies } from '../../hooks/useSupplies'
import { useFlatmates } from '../../hooks/useFlatmates'
import { logChore } from '../../lib/chores'
import { logPurchase } from '../../lib/supplies'
import { supabase } from '../../lib/supabase'
import { QUERY_KEYS } from '../../constants'
import { getThisMonday } from '../../lib/utils'
import BottomSheet from '../ui/BottomSheet'
import SegmentedControl from '../ui/SegmentedControl'
import Badge from '../ui/Badge'

const SEGMENTS = [
  { value: 'chore',  label: 'Chore' },
  { value: 'buying', label: 'Buying' },
]

function formatTs(date) {
  if (isToday(date))     return `Today, ${format(date, 'HH:mm')}`
  if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`
  return format(date, 'EEE d MMM, HH:mm')
}

export default function LogView({ isOpen, onClose, prefill = {} }) {
  const { flatmate: sessionFlatmate } = useSession()
  const { setError } = useError()
  const queryClient = useQueryClient()
  const thisMonday = getThisMonday()
  const prevOpen = useRef(false)

  const [type, setType]                   = useState('chore')
  const [doneFlatmateId, setDoneFlatmateId] = useState(sessionFlatmate?.id)
  const [timestamp, setTimestamp]         = useState(new Date())
  const [selectedChoreId, setSelectedChoreId]   = useState(null)
  const [selectedSupplyId, setSelectedSupplyId] = useState(null)
  const [search, setSearch] = useState('')
  const [note, setNote]     = useState('')
  const [isLogging, setIsLogging]     = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset whenever the sheet opens with fresh prefill
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      setType(prefill.type === 'buying' ? 'buying' : 'chore')
      setDoneFlatmateId(prefill.doneBy ?? sessionFlatmate?.id)
      setSelectedChoreId(prefill.choreId ?? null)
      setSelectedSupplyId(prefill.supplyId ?? null)
      setSearch('')
      setNote('')
      setTimestamp(new Date())
      setIsLogging(false)
      setShowSuccess(false)
    }
    prevOpen.current = isOpen
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: flatmates }    = useFlatmates()
  const { data: assignments }  = useAssignments(thisMonday)
  const { data: allChores }    = useAllChores()
  const { data: mySupplies }   = useSuppliesForFlatmate(doneFlatmateId)
  const { data: allSupplies }  = useSupplies()

  const myChoreAssignments = (assignments ?? []).filter(
    a => a.flatmate_id === doneFlatmateId && !a.completed
  )
  const assignedChoreIds  = new Set(myChoreAssignments.map(a => a.chore_id))
  const assignedSupplyIds = new Set((mySupplies ?? []).map(s => s.id))

  const q = search.toLowerCase()
  const choreSearchResults = search
    ? (allChores ?? []).filter(c => !assignedChoreIds.has(c.id) && c.name.toLowerCase().includes(q)).slice(0, 5)
    : []
  const supplySearchResults = search
    ? (allSupplies ?? []).filter(s => !assignedSupplyIds.has(s.id) && s.name.toLowerCase().includes(q)).slice(0, 5)
    : []

  const canLog = type === 'chore' ? !!selectedChoreId : !!selectedSupplyId

  async function handleLog() {
    if (!canLog || isLogging) return
    setIsLogging(true)
    try {
      if (type === 'chore') {
        const assignment = (assignments ?? []).find(
          a => a.chore_id === selectedChoreId && a.flatmate_id === doneFlatmateId
        )
        await logChore({
          choreId:    selectedChoreId,
          doneBy:     doneFlatmateId,
          assignedTo: assignment ? doneFlatmateId : null,
          note:       note.trim() || null,
          loggedAt:   timestamp.toISOString(),
        })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHORE_LOGS] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] })
        supabase.functions.invoke('send-event-notification', {
          body: { type: 'motivation', data: { logged_by_id: doneFlatmateId, week_start: thisMonday } },
        }).catch(() => {})
      } else {
        await logPurchase({
          supplyId:   selectedSupplyId,
          flatmateId: doneFlatmateId,
          note:       note.trim() || null,
        })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIES] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLY_LOGS] })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEXT_BUYER] })
      }
      setShowSuccess(true)
      setTimeout(() => onClose(), 900)
    } catch {
      setError('Failed to log — please try again')
      setIsLogging(false)
    }
  }

  function handleDoneBySwitch(flatmateId) {
    setDoneFlatmateId(flatmateId)
    setSelectedChoreId(null)
    setSelectedSupplyId(null)
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={() => !isLogging && onClose()} title="Log it">
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-16 h-16 rounded-full bg-green-primary flex items-center justify-center">
            <Check size={32} className="text-white" strokeWidth={3} />
          </div>
          <p className="text-[17px] font-semibold text-black">Logged!</p>
        </div>
      ) : (
        <div className="px-4 pt-3 pb-6 flex flex-col gap-4">

          {/* Type */}
          <SegmentedControl options={SEGMENTS} value={type} onChange={t => {
            setType(t)
            setSelectedChoreId(null)
            setSelectedSupplyId(null)
            setSearch('')
          }} />

          {/* Done by */}
          <div>
            <p className="text-[13px] text-[rgba(60,60,67,0.5)] font-medium mb-2">Done by</p>
            <div className="flex gap-2">
              {flatmates?.map(f => {
                const active = f.id === doneFlatmateId
                return (
                  <button
                    key={f.id}
                    onClick={() => handleDoneBySwitch(f.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all"
                    style={{
                      backgroundColor: active ? f.color + '22' : 'rgba(116,116,128,0.1)',
                      color:  active ? f.color : 'rgba(60,60,67,0.6)',
                      border: active ? `1.5px solid ${f.color}` : '1.5px solid transparent',
                    }}
                  >
                    <span className="text-base leading-none">{f.avatar_emoji}</span>
                    <span>{f.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* When */}
          <div>
            <p className="text-[13px] text-[rgba(60,60,67,0.5)] font-medium mb-2">When</p>
            <div className="relative">
              <div className="bg-[rgba(116,116,128,0.08)] rounded-ios-sm px-3 py-2.5 pointer-events-none">
                <p className="text-[15px] text-black">{formatTs(timestamp)}</p>
              </div>
              <input
                type="datetime-local"
                max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                value={format(timestamp, "yyyy-MM-dd'T'HH:mm")}
                onChange={e => e.target.value && setTimestamp(new Date(e.target.value))}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Assignment list */}
          {type === 'chore' ? (
            <>
              {myChoreAssignments.length > 0 && (
                <div>
                  <p className="text-[13px] text-[rgba(60,60,67,0.5)] font-medium mb-2">Your assignments</p>
                  <div className="bg-[rgba(116,116,128,0.06)] rounded-ios overflow-hidden">
                    {myChoreAssignments.map(a => (
                      <button
                        key={a.chore_id}
                        onClick={() => setSelectedChoreId(
                          selectedChoreId === a.chore_id ? null : a.chore_id
                        )}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left border-b border-[rgba(60,60,67,0.06)] last:border-0 active:opacity-70 transition-opacity"
                      >
                        <span className="text-xl w-7 text-center flex-shrink-0">{a.chore?.icon}</span>
                        <p className="flex-1 text-[15px] text-black truncate">{a.chore?.name}</p>
                        {selectedChoreId === a.chore_id && (
                          <Check size={18} className="text-green-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {mySupplies && mySupplies.length > 0 && (
                <div>
                  <p className="text-[13px] text-[rgba(60,60,67,0.5)] font-medium mb-2">Your buyings</p>
                  <div className="bg-[rgba(116,116,128,0.06)] rounded-ios overflow-hidden">
                    {mySupplies.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSupplyId(
                          selectedSupplyId === s.id ? null : s.id
                        )}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left border-b border-[rgba(60,60,67,0.06)] last:border-0 active:opacity-70 transition-opacity"
                      >
                        <span className="text-xl w-7 text-center flex-shrink-0">{s.icon}</span>
                        <p className="flex-1 text-[15px] text-black truncate">{s.name}</p>
                        <Badge status={s.status} />
                        {selectedSupplyId === s.id && (
                          <Check size={18} className="text-green-primary ml-2 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Search */}
          <div>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={type === 'chore' ? 'Search all chores…' : 'Search all supplies…'}
              className="w-full bg-[rgba(116,116,128,0.08)] rounded-ios-sm px-3 py-2.5 text-[15px] outline-none placeholder:text-[rgba(60,60,67,0.4)]"
            />
            {(type === 'chore' ? choreSearchResults : supplySearchResults).length > 0 && (
              <div className="bg-[rgba(116,116,128,0.06)] rounded-ios overflow-hidden mt-2">
                {type === 'chore'
                  ? choreSearchResults.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedChoreId(c.id); setSearch('') }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left border-b border-[rgba(60,60,67,0.06)] last:border-0 active:opacity-70 transition-opacity"
                      >
                        <span className="text-xl w-7 text-center flex-shrink-0">{c.icon}</span>
                        <p className="flex-1 text-[15px] text-black truncate">{c.name}</p>
                        {selectedChoreId === c.id && (
                          <Check size={18} className="text-green-primary flex-shrink-0" />
                        )}
                      </button>
                    ))
                  : supplySearchResults.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedSupplyId(s.id); setSearch('') }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left border-b border-[rgba(60,60,67,0.06)] last:border-0 active:opacity-70 transition-opacity"
                      >
                        <span className="text-xl w-7 text-center flex-shrink-0">{s.icon}</span>
                        <p className="flex-1 text-[15px] text-black truncate">{s.name}</p>
                        <Badge status={s.status} />
                        {selectedSupplyId === s.id && (
                          <Check size={18} className="text-green-primary ml-2 flex-shrink-0" />
                        )}
                      </button>
                    ))
                }
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 140))}
              placeholder="Add a note… (optional)"
              rows={2}
              className="w-full bg-[rgba(116,116,128,0.08)] rounded-ios-sm px-3 py-2.5 text-[15px] outline-none placeholder:text-[rgba(60,60,67,0.4)] resize-none"
            />
            {note.length > 100 && (
              <p className="text-[12px] text-[rgba(60,60,67,0.4)] text-right mt-0.5">
                {140 - note.length} left
              </p>
            )}
          </div>

          {/* Log it */}
          <button
            onClick={handleLog}
            disabled={!canLog || isLogging}
            className="w-full bg-green-primary text-white text-[17px] font-semibold rounded-ios py-4 disabled:opacity-40 active:bg-green-dark transition-colors"
          >
            {isLogging ? 'Logging…' : 'Log it'}
          </button>

        </div>
      )}
    </BottomSheet>
  )
}
