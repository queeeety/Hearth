import Avatar from '../ui/Avatar'
import EmptyState from '../ui/EmptyState'
import { formatTimeAgo } from '../../lib/utils'

// Full implementation in Step 7
export default function ActivityFeed({ logs }) {
  if (!logs?.length) {
    return <EmptyState icon="🏠" heading="Nothing logged yet" body="Be the first!" />
  }
  return (
    <div>
      {logs.map(log => (
        <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(60,60,67,0.08)] last:border-0">
          <Avatar flatmate={log.flatmate} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-black truncate">{log.chore?.name}</p>
            <p className="text-[13px] text-[rgba(60,60,67,0.5)]">{log.flatmate?.name} · {formatTimeAgo(log.done_at ?? log.logged_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
