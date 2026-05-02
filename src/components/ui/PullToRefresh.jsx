import { useState, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

const THRESHOLD = 72

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(null)
  const containerRef = useRef(null)

  function onTouchStart(e) {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  function onTouchMove(e) {
    if (startY.current === null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) setPullY(Math.min(delta * 0.5, THRESHOLD))
  }

  async function onTouchEnd() {
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      try { await onRefresh() } finally { setRefreshing(false) }
    }
    setPullY(0)
    startY.current = null
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: refreshing ? THRESHOLD : pullY }}
      >
        <RefreshCw
          size={20}
          className={`text-green-primary ${refreshing ? 'animate-spin' : ''}`}
          style={{ opacity: Math.min(pullY / THRESHOLD, 1) }}
        />
      </div>
      {children}
    </div>
  )
}
