export default function CompletionRing({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const r = 54
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - pct / 100)
  const color = pct >= 90 ? '#30D158' : pct >= 50 ? '#34C759' : '#FF9500'

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle
            cx="64" cy="64" r={r}
            fill="none"
            stroke="rgba(60,60,67,0.08)"
            strokeWidth="10"
          />
          {total > 0 && (
            <circle
              cx="64" cy="64" r={r}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 64 64)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[28px] font-bold text-black leading-none">{pct}%</p>
          <p className="text-[11px] text-[rgba(60,60,67,0.5)] mt-0.5">done</p>
        </div>
      </div>
      <p className="text-[15px] text-[rgba(60,60,67,0.6)] mt-2">
        {completed} of {total} chores this week
      </p>
    </div>
  )
}
