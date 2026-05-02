import { ChevronRight } from 'lucide-react'
import Avatar from '../ui/Avatar'

// Full implementation in Step 8
export default function ChoreCard({ assignment, chore, onClick }) {
  const c = chore ?? assignment?.chore
  const flatmate = assignment?.flatmate
  if (!c) return null
  return (
    <button
      onClick={onClick}
      className="bg-white flex items-center gap-3 px-4 py-3 w-full text-left active:opacity-70 transition-opacity border-b border-[rgba(60,60,67,0.08)] last:border-0"
    >
      <span className="text-2xl w-8 text-center flex-shrink-0">{c.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[17px] font-medium text-black truncate">{c.name}</p>
      </div>
      {flatmate && <Avatar flatmate={flatmate} size="sm" />}
      <ChevronRight size={16} className="text-[rgba(60,60,67,0.3)] flex-shrink-0" />
    </button>
  )
}
