import { X } from 'lucide-react'

export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] bg-ios-red text-white flex items-center justify-between px-4 gap-3"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', paddingBottom: '12px' }}
    >
      <p className="text-[15px] font-medium flex-1">{message}</p>
      <button onClick={onDismiss} className="flex-shrink-0 opacity-80 active:opacity-60">
        <X size={18} />
      </button>
    </div>
  )
}
