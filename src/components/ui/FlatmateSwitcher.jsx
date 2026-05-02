import { useFlatmates } from '../../hooks/useFlatmates'

export default function FlatmateSwitcher({ activeFlatmateId, onSwitch }) {
  const { data: flatmates } = useFlatmates()

  function handleSwitch(f) {
    if (f.id === activeFlatmateId) return
    if (navigator.vibrate) navigator.vibrate(10)
    onSwitch?.(f)
  }

  return (
    <div className="flex gap-2">
      {flatmates?.map(f => {
        const isActive = f.id === activeFlatmateId
        return (
          <button
            key={f.id}
            onClick={() => handleSwitch(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all"
            style={{
              backgroundColor: isActive ? f.color + '22' : 'rgba(116,116,128,0.1)',
              color: isActive ? f.color : 'rgba(60,60,67,0.6)',
              border: isActive ? `1.5px solid ${f.color}` : '1.5px solid transparent',
            }}
          >
            <span className="text-base leading-none">{f.avatar_emoji}</span>
            <span>{f.name}</span>
          </button>
        )
      })}
    </div>
  )
}
