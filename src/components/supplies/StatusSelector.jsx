const OPTIONS = [
  { value: 'stocked',     label: 'Stocked',     emoji: '🟢', active: 'bg-green-light text-green-dark' },
  { value: 'running_low', label: 'Running Low',  emoji: '🟡', active: 'bg-[#FFF3E0] text-[#E65100]' },
  { value: 'out',         label: 'Out',          emoji: '🔴', active: 'bg-[#FFEBEE] text-ios-red' },
]

export default function StatusSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-3 rounded-ios text-[13px] font-semibold transition-colors flex flex-col items-center gap-0.5 ${
            value === opt.value
              ? opt.active
              : 'bg-[rgba(116,116,128,0.08)] text-[rgba(60,60,67,0.5)]'
          }`}
        >
          <span className="text-lg leading-none">{opt.emoji}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
