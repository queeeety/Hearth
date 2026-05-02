import { ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatTimeAgo } from '../../lib/utils'

export default function SupplyCard({ supply, onClick }) {
  if (!supply) return null

  const subline = supply.last_buyer
    ? `Last bought by ${supply.last_buyer.name} · ${formatTimeAgo(supply.last_bought_at)}`
    : 'Never bought'

  return (
    <button
      onClick={onClick}
      className="bg-white flex items-center gap-3 px-4 py-3 w-full text-left active:opacity-70 transition-opacity border-b border-[rgba(60,60,67,0.08)] last:border-0"
    >
      <span className="text-2xl w-8 text-center flex-shrink-0">{supply.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[17px] font-medium text-black truncate">{supply.name}</p>
        <p className="text-[13px] text-[rgba(60,60,67,0.5)] truncate mt-0.5">{subline}</p>
      </div>
      <Badge status={supply.status} />
      <ChevronRight size={16} className="text-[rgba(60,60,67,0.3)] flex-shrink-0" />
    </button>
  )
}
