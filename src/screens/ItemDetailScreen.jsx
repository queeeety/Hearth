import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useSupply, useNextBuyer, useSupplyHistory } from '../hooks/useSupplies'
import { updateSupplyStatus } from '../lib/supplies'
import { useSession } from '../contexts/SessionContext'
import { useLogView } from '../contexts/LogViewContext'
import { useError } from '../contexts/ErrorContext'
import { QUERY_KEYS } from '../constants'
import { formatTimeAgo } from '../lib/utils'
import { supabase } from '../lib/supabase'
import Avatar from '../components/ui/Avatar'
import StatusSelector from '../components/supplies/StatusSelector'

export default function ItemDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { flatmate } = useSession()
  const { openLogView } = useLogView()
  const { setError } = useError()
  const queryClient = useQueryClient()

  const { data: supply, isLoading } = useSupply(id)
  const { data: nextBuyer } = useNextBuyer(id)
  const { data: history } = useSupplyHistory(id, 20)

  async function handleStatusChange(newStatus) {
    if (!supply || newStatus === supply.status) return
    if (navigator.vibrate) navigator.vibrate(10)
    try {
      await updateSupplyStatus({
        supplyId: id,
        flatmateId: flatmate.id,
        oldStatus: supply.status,
        newStatus,
      })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIES, id] })
      if (newStatus === 'out' || newStatus === 'running_low') {
        supabase.functions.invoke('send-event-notification', {
          body: { type: newStatus === 'out' ? 'supply_out' : 'supply_low', data: { supply_id: id } },
        }).catch(() => {})
      }
    } catch {
      setError('Failed to update status')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-green-primary border-t-transparent animate-spin" />
      </div>
    )
  }
  if (!supply) return null

  return (
    <div>
      <div style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }} className="px-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-green-primary text-[17px] active:opacity-60 transition-opacity -ml-1"
        >
          <ChevronLeft size={20} />
          <span>Supplies</span>
        </button>
      </div>

      <div className="mx-4 bg-white rounded-ios p-5 mb-3">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{supply.icon}</span>
          <h1 className="text-[22px] font-bold text-black leading-tight flex-1 min-w-0">
            {supply.name}
          </h1>
        </div>
      </div>

      <div className="mx-4 bg-white rounded-ios p-4 mb-3">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-3">
          Status
        </p>
        <StatusSelector value={supply.status} onChange={handleStatusChange} />
      </div>

      <div className="mx-4 bg-white rounded-ios p-4 mb-3">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-3">
          Up next to buy
        </p>
        {nextBuyer ? (
          <div className="flex items-center gap-3">
            <Avatar flatmate={nextBuyer} size="md" />
            <p className="text-[17px] font-medium text-black">{nextBuyer.name}</p>
          </div>
        ) : (
          <p className="text-[15px] text-[rgba(60,60,67,0.5)]">No one assigned yet</p>
        )}
      </div>

      <div className="mx-4 mb-4">
        <button
          onClick={() => openLogView({
            supplyId: id,
            supplyName: supply.name,
            supply,
            type: 'buying',
            doneBy: flatmate.id,
          })}
          className="w-full bg-green-primary text-white text-[17px] font-semibold rounded-ios py-4 active:bg-green-dark transition-colors"
        >
          I bought this
        </button>
      </div>

      {history && history.length > 0 && (
        <section className="mx-4 mb-6">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[rgba(60,60,67,0.5)] mb-2 px-1">
            Purchase history
          </p>
          <div className="bg-white rounded-ios overflow-hidden">
            {history.map(log => (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(60,60,67,0.08)] last:border-0"
              >
                <Avatar flatmate={log.flatmate} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-black">{log.flatmate?.name}</p>
                  <p className="text-[13px] text-[rgba(60,60,67,0.5)]">{formatTimeAgo(log.done_at ?? log.logged_at)}</p>
                </div>
                {log.note && (
                  <p className="text-[13px] text-[rgba(60,60,67,0.5)] max-w-[120px] truncate">{log.note}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
