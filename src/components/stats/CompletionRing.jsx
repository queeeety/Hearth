// Full implementation in Step 7
export default function CompletionRing({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className="flex flex-col items-center py-6">
      <div className="w-32 h-32 rounded-full border-8 border-green-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-[28px] font-bold text-black">{pct}%</p>
          <p className="text-[11px] text-[rgba(60,60,67,0.5)]">done</p>
        </div>
      </div>
      <p className="text-[15px] text-[rgba(60,60,67,0.6)] mt-3">
        {completed} of {total} chores this week
      </p>
    </div>
  )
}
