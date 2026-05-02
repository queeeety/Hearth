export default function PageHeader({ title, right }) {
  return (
    <div
      className="px-4 pt-4 pb-2 flex items-end justify-between"
      style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
    >
      <h1 className="text-[34px] font-bold text-black leading-tight">{title}</h1>
      {right && <div className="pb-1">{right}</div>}
    </div>
  )
}
