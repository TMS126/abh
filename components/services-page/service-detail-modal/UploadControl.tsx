export function UploadButton({ phase, accent, onClick }: { phase: UploadPhase; accent: string; onClick: () => void }) {
  const [pressed, setPressed] = useState(false)
  const isDone     = phase === "done"
  const baseColor  = isDone ? "#16a34a" : accent
  const baseBg     = isDone ? "#22c55e14" : `${accent}12`
  const restShadow = isDone ? "0 4px 14px -4px #22c55e55" : `0 4px 14px -4px ${accent}55`
  const pressShadow = isDone ? "inset 0 2px 6px -1px #16a34a55" : `inset 0 2px 6px -1px ${accent}55`

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      aria-label={isDone ? "File attached" : "Attach file"}
      className="flex items-center justify-center py-3.5 rounded-[14px] transition-all duration-150"
      style={{
        backgroundColor: baseBg,
        color: baseColor,
        boxShadow: pressed ? pressShadow : restShadow,
      }}
    >
      <Paperclip size={22} weight="bold" aria-hidden="true" />
    </button>
  )
} 