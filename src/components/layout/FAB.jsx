import { Plus } from 'lucide-react'

export default function FAB({ onPress }) {
  function handleClick() {
    if (navigator.vibrate) navigator.vibrate(10)
    onPress()
  }

  return (
    <button
      onClick={handleClick}
      className="fixed right-5 z-40 w-14 h-14 rounded-full bg-green-primary shadow-lg flex items-center justify-center active:bg-green-dark transition-colors"
      style={{ bottom: 'calc(49px + env(safe-area-inset-bottom) + 16px)' }}
      aria-label="Log chore or supply"
    >
      <Plus size={26} strokeWidth={2.5} className="text-white" />
    </button>
  )
}
