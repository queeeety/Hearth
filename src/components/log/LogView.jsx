import BottomSheet from '../ui/BottomSheet'

// Full implementation in Step 15
export default function LogView({ isOpen, onClose, prefill = {} }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Log it">
      <div className="px-4 py-8 text-center text-[rgba(60,60,67,0.5)] text-[15px]">
        Log View — coming in Step 15
      </div>
    </BottomSheet>
  )
}
