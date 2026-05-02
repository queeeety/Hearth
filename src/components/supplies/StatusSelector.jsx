// Full implementation in Step 11
export default function StatusSelector({ value, onChange }) {
  const options = [
    { value: 'stocked',     label: 'Stocked 🟢' },
    { value: 'running_low', label: 'Running Low 🟡' },
    { value: 'out',         label: 'Out 🔴' },
  ]
  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 rounded-ios text-[13px] font-medium transition-colors ${
            value === opt.value ? 'bg-green-light text-green-dark' : 'bg-[rgba(116,116,128,0.1)] text-[rgba(60,60,67,0.6)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
