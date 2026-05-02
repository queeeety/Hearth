import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO, addDays, subDays, differenceInDays } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Trash2, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSession } from '../contexts/SessionContext'
import { useError } from '../contexts/ErrorContext'
import { useVacationPeriods } from '../hooks/useChores'
import { QUERY_KEYS } from '../constants'
import { getThisMonday } from '../lib/utils'

export default function VacationScreen() {
  const navigate = useNavigate()
  const { flatmate } = useSession()
  const { setError } = useError()
  const queryClient = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const pastLimit = format(subDays(new Date(), 60), 'yyyy-MM-dd')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'))
  const [isSaving, setIsSaving] = useState(false)

  const { data: upcoming } = useVacationPeriods(flatmate?.id)

  const days = endDate >= startDate
    ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
    : 0

  const preview = days > 0
    ? `You'll be away for ${days} day${days !== 1 ? 's' : ''}. Weekly chores will be reassigned. Bi-weekly or longer chores stay assigned.`
    : 'End date must be after start date.'

  async function handleSave() {
    if (days <= 0 || isSaving) return
    setIsSaving(true)
    try {
      const { error } = await supabase.from('vacation_periods').insert({
        flatmate_id: flatmate.id,
        start_date: startDate,
        end_date: endDate,
      })
      if (error) throw error

      const thisMonday = getThisMonday()
      const weekEnd = format(addDays(parseISO(thisMonday), 6), 'yyyy-MM-dd')
      if (startDate <= weekEnd && endDate >= thisMonday) {
        await supabase.rpc('reassign_vacation_chores', {
          p_flatmate_id: flatmate.id,
          p_week_start: thisMonday,
        })
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] })
        supabase.functions.invoke('send-event-notification', {
          body: {
            type: 'reassignment',
            data: { leaving_flatmate_id: flatmate.id, start_date: startDate, end_date: endDate },
          },
        }).catch(() => {})
      }

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VACATION_PERIODS] })
      setStartDate(today)
      setEndDate(format(addDays(new Date(), 3), 'yyyy-MM-dd'))
    } catch {
      setError('Failed to save vacation')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReturnEarly(id) {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    try {
      await supabase.from('vacation_periods').update({ end_date: yesterday }).eq('id', id)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VACATION_PERIODS] })
    } catch {
      setError('Failed to end vacation')
    }
  }

  async function handleDelete(id) {
    try {
      await supabase.from('vacation_periods').delete().eq('id', id)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VACATION_PERIODS] })
    } catch {
      setError('Failed to delete vacation')
    }
  }

  return (
    <div>
      <div style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }} className="px-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-green-primary text-[17px] active:opacity-60 transition-opacity -ml-1"
        >
          <ChevronLeft size={20} />
          <span>Me</span>
        </button>
      </div>

      <div className="px-4 pb-2">
        <h1 className="text-[34px] font-bold text-black leading-tight">Vacation Mode</h1>
      </div>

      <div className="mx-4 bg-white rounded-ios p-4 mb-3">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-4">
          I'm leaving
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <p className="text-[13px] text-[rgba(60,60,67,0.5)] mb-1.5">From</p>
            <input
              type="date"
              value={startDate}
              min={pastLimit}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-[rgba(116,116,128,0.08)] rounded-ios-sm px-3 py-2.5 text-[15px] text-black outline-none"
            />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-[rgba(60,60,67,0.5)] mb-1.5">To</p>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-[rgba(116,116,128,0.08)] rounded-ios-sm px-3 py-2.5 text-[15px] text-black outline-none"
            />
          </div>
        </div>

        <p className="text-[13px] text-[rgba(60,60,67,0.6)] mb-4 leading-relaxed">{preview}</p>

        <button
          onClick={handleSave}
          disabled={days <= 0 || isSaving}
          className="w-full bg-green-primary text-white text-[17px] font-semibold rounded-ios py-3.5 disabled:opacity-40 active:bg-green-dark transition-colors"
        >
          {isSaving ? 'Saving…' : 'Save vacation'}
        </button>
      </div>

      {(() => {
        const active = (upcoming ?? []).filter(v => v.start_date <= today && v.end_date >= today)
        const future = (upcoming ?? []).filter(v => v.start_date > today)
        return (
          <>
            {active.length > 0 && (
              <section className="mx-4 mb-3">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-2 px-1">
                  Active
                </p>
                <div className="bg-white rounded-ios overflow-hidden">
                  {active.map(v => {
                    const vDays = differenceInDays(parseISO(v.end_date), parseISO(v.start_date)) + 1
                    return (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(60,60,67,0.08)] last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] text-black">
                            {format(parseISO(v.start_date), 'd MMM')} – {format(parseISO(v.end_date), 'd MMM')}
                          </p>
                          <p className="text-[13px] text-[rgba(60,60,67,0.5)]">{vDays} day{vDays !== 1 ? 's' : ''}</p>
                        </div>
                        <button
                          onClick={() => handleReturnEarly(v.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-primary/10 active:opacity-60 transition-opacity"
                        >
                          <LogIn size={14} className="text-green-primary" />
                          <span className="text-[13px] font-medium text-green-primary">Return early</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
            {future.length > 0 && (
              <section className="mx-4 mb-6">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-2 px-1">
                  Upcoming
                </p>
                <div className="bg-white rounded-ios overflow-hidden">
                  {future.map(v => {
                    const vDays = differenceInDays(parseISO(v.end_date), parseISO(v.start_date)) + 1
                    return (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(60,60,67,0.08)] last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] text-black">
                            {format(parseISO(v.start_date), 'd MMM')} – {format(parseISO(v.end_date), 'd MMM')}
                          </p>
                          <p className="text-[13px] text-[rgba(60,60,67,0.5)]">{vDays} day{vDays !== 1 ? 's' : ''}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-2 -mr-1 active:opacity-60 transition-opacity"
                        >
                          <Trash2 size={16} className="text-ios-red" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )
      })()}
    </div>
  )
}
