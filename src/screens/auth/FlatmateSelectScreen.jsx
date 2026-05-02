import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function FlatmateSelectScreen({ onSelect }) {
  const { data: flatmates, isLoading } = useQuery({
    queryKey: ['flatmates'],
    queryFn: async () => {
      const { data } = await supabase
        .from('flatmates')
        .select('*')
        .eq('active', true)
        .order('created_at')
      return data
    },
  })

  function handleSelect(flatmate) {
    if (navigator.vibrate) navigator.vibrate(10)
    onSelect(flatmate)
  }

  return (
    <div className="min-h-screen bg-ios-bg">
      <div className="px-6 pt-16 pb-6">
        <h1 className="text-[34px] font-bold text-black">Who are you?</h1>
        <p className="text-[15px] text-[rgba(60,60,67,0.6)] mt-1">
          Pick your profile to continue
        </p>
      </div>

      <div className="px-4 flex flex-col gap-3">
        {isLoading
          ? [1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-ios h-20 animate-pulse" />
            ))
          : flatmates?.map(f => (
              <button
                key={f.id}
                onClick={() => handleSelect(f)}
                className="bg-white rounded-ios px-4 py-4 flex items-center gap-4 w-full text-left active:opacity-60 transition-opacity"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: f.color + '33' }}
                >
                  {f.avatar_emoji}
                </div>
                <span className="text-[22px] font-semibold text-black flex-1">
                  {f.name}
                </span>
                <ChevronRight size={20} className="text-[rgba(60,60,67,0.4)]" />
              </button>
            ))}
      </div>
    </div>
  )
}
