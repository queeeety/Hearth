import { useState, useRef, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

const THRESHOLD = 72

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef(null)
  const pullYRef = useRef(0)
  const refreshingRef = useRef(false)
  const containerRef = useRef(null)

  useEffect(() => { refreshingRef.current = refreshing }, [refreshing])

  const doRefresh = useCallback(async () => {
    setRefreshing(true)
    setPullY(THRESHOLD)
    try { await onRefresh() } finally {
      setRefreshing(false)
      setPullY(0)
      pullYRef.current = 0
    }
  }, [onRefresh])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onTouchStart(e) {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY
      }
    }

    function onTouchMove(e) {
      if (startYRef.current === null || refreshingRef.current) return
      const dy = e.touches[0].clientY - startYRef.current
      if (dy > 0) {
        e.preventDefault()
        const clamped = Math.min(dy * 0.5, THRESHOLD)
        pullYRef.current = clamped
        setPullY(clamped)
      } else {
        startYRef.current = null
        pullYRef.current = 0
        setPullY(0)
      }
    }

    function onTouchEnd() {
      if (startYRef.current === null) return
      startYRef.current = null
      if (pullYRef.current >= THRESHOLD) {
        doRefresh()
      } else {
        pullYRef.current = 0
        setPullY(0)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [doRefresh])

  return (
    <div ref={containerRef}>
      {(pullY > 0 || refreshing) && (
        <div
          className="flex justify-center items-center overflow-hidden"
          style={{ height: refreshing ? THRESHOLD : pullY }}
        >
          <RefreshCw
            size={20}
            className={`text-green-primary ${refreshing ? 'animate-spin' : ''}`}
            style={{ opacity: Math.min(pullY / THRESHOLD, 1), transform: `rotate(${(pullY / THRESHOLD) * 270}deg)` }}
          />
        </div>
      )}
      {children}
    </div>
  )
}
