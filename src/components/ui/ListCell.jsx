export default function ListCell({ left, children, right, onClick, separator = true }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`flex items-center gap-3 px-4 min-h-[44px] w-full text-left ${onClick ? 'active:bg-[rgba(0,0,0,0.04)]' : ''}`}
    >
      {left && <div className="flex-shrink-0">{left}</div>}
      <div className={`flex-1 flex items-center justify-between py-3 ${separator ? 'border-b border-[rgba(60,60,67,0.12)]' : ''}`}>
        <div className="flex-1 min-w-0">{children}</div>
        {right && <div className="flex-shrink-0 ml-2">{right}</div>}
      </div>
    </Tag>
  )
}
