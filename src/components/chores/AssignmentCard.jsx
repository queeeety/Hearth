// Full implementation in Step 13
export default function AssignmentCard({ assignment, onLog }) {
  const chore = assignment?.chore
  if (!chore) return null
  return (
    <button
      onClick={onLog}
      className="bg-white flex items-center gap-3 px-4 py-3 w-full text-left rounded-ios active:opacity-70 transition-opacity"
    >
      <span className="text-2xl w-8 text-center flex-shrink-0">{chore.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[17px] font-medium text-black truncate">{chore.name}</p>
      </div>
    </button>
  )
}
