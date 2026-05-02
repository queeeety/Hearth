import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="flex items-center bg-[rgba(116,116,128,0.12)] rounded-[10px] px-3 h-9 gap-2">
      <Search size={16} className="text-[rgba(60,60,67,0.5)] flex-shrink-0" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[17px] outline-none placeholder:text-[rgba(60,60,67,0.4)]"
      />
      {value && (
        <button onClick={() => onChange('')} className="flex-shrink-0">
          <X size={16} className="text-[rgba(60,60,67,0.5)]" />
        </button>
      )}
    </div>
  )
}
