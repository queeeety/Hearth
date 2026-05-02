const STYLES = {
  stocked:     'bg-green-light text-green-dark',
  running_low: 'bg-[#FFF3E0] text-[#E65100]',
  out:         'bg-[#FFEBEE] text-ios-red',
}

const LABELS = {
  stocked:     'Stocked',
  running_low: 'Running Low',
  out:         'Out',
}

export default function Badge({ status }) {
  return (
    <span className={`text-[11px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${STYLES[status] ?? STYLES.stocked}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
