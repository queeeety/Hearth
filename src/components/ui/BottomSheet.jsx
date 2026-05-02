import { useState, useEffect, useRef } from 'react'

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const [mounted, setMounted] = useState(isOpen)
  const [visible, setVisible] = useState(false)
  const sheetRef = useRef(null)
  const dragStartY = useRef(null)
  const dragDelta = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else if (mounted) {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 380)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (mounted) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mounted])

  function onTouchStart(e) {
    dragStartY.current = e.touches[0].clientY
    dragDelta.current = 0
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }

  function onTouchMove(e) {
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta > 0) {
      dragDelta.current = delta
      if (sheetRef.current) sheetRef.current.style.transform = `translateY(${delta}px)`
    }
  }

  function onTouchEnd() {
    if (sheetRef.current) sheetRef.current.style.transition = ''
    if (dragDelta.current > 120) {
      onClose()
    } else {
      if (sheetRef.current) sheetRef.current.style.transform = ''
    }
    dragDelta.current = 0
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="relative bg-white rounded-t-[20px]"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 rounded-full bg-[rgba(60,60,67,0.18)]" />
        </div>
        {title && (
          <div className="px-4 pb-3 border-b border-[rgba(60,60,67,0.12)]">
            <h2 className="text-[17px] font-semibold text-center">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto max-h-[85vh]">
          {children}
        </div>
      </div>
    </div>
  )
}
