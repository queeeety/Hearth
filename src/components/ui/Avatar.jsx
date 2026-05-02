const SIZES = {
  sm: 'w-7 h-7 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-14 h-14 text-2xl',
}

export default function Avatar({ flatmate, size = 'md' }) {
  if (!flatmate) return null
  return (
    <div
      className={`${SIZES[size]} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: flatmate.color + '33' }}
    >
      <span>{flatmate.avatar_emoji}</span>
    </div>
  )
}
