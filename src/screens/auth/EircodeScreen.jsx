import { useState } from 'react'
import { hashInput } from '../../lib/auth'

export default function EircodeScreen({ onSuccess }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  async function handleSubmit() {
    if (!value.trim()) return
    const hash = await hashInput(value)
    if (hash === import.meta.env.VITE_EIRCODE) {
      onSuccess()
    } else {
      setError(true)
      setShaking(true)
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }

  function handleChange(e) {
    setValue(e.target.value.toUpperCase())
    setError(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏡</div>
          <h1 className="text-[34px] font-bold text-black leading-tight">Hearth</h1>
          <p className="text-[15px] text-[rgba(60,60,67,0.6)] mt-2">
            Enter your household code to continue
          </p>
        </div>

        <div className="bg-white rounded-ios p-5 shadow-ios">
          <div
            className={shaking ? 'animate-shake' : ''}
            onAnimationEnd={() => setShaking(false)}
          >
            <input
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Eircode"
              autoFocus
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="w-full text-[22px] font-semibold text-center bg-[rgba(116,116,128,0.08)] rounded-ios-sm px-4 py-4 outline-none placeholder:text-[rgba(60,60,67,0.25)] tracking-widest"
            />
            {error && (
              <p className="text-ios-red text-[15px] text-center mt-3 font-medium">
                That doesn't seem right
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="w-full mt-4 bg-green-primary text-white text-[17px] font-semibold rounded-ios py-4 disabled:opacity-40 active:bg-green-dark transition-colors"
          >
            Enter
          </button>
        </div>

      </div>
    </div>
  )
}
