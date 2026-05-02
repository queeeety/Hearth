export default function EmptyState({ icon, heading, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-[17px] font-semibold text-black mb-2">{heading}</h3>
      {body && <p className="text-[15px] text-[rgba(60,60,67,0.6)] leading-snug">{body}</p>}
    </div>
  )
}
