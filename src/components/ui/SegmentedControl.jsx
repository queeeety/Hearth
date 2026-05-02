export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex bg-[rgba(116,116,128,0.12)] rounded-[9px] p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 text-[13px] font-medium rounded-[7px] transition-all duration-200 ${
            value === opt.value
              ? 'bg-white text-black shadow-sm'
              : 'text-[rgba(60,60,67,0.6)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
