"use client"

import { useState } from "react"
import { Paperclip, CheckCircle, WarningCircle, ShieldCheck, X } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"

type UploadPhase = "idle" | "uploading" | "done" | "error"

// Tracks pointer down/up/leave to get a genuine "pressed into the
// surface" feel — inset shadow + a slight downward nudge while held —
// rather than relying only on active:scale-95, which just shrinks it in
// place without any sense of depth.
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
      className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-[14px] font-bold text-[0.84rem] transition-all duration-150"
      style={{
        backgroundColor: baseBg,
        color: baseColor,
        boxShadow: pressed ? pressShadow : restShadow,
        transform: pressed ? "translateY(1px) scale(0.97)" : "translateY(0) scale(1)",
      }}
    >
      <Paperclip size={18} weight="bold" aria-hidden="true" />
      {isDone ? "Attached" : "Attach File"}
    </button>
  )
}

export function UploadStatus({
  phase, file, uploadErr, uploadProgress, previewUrl, accent, acceptHint, onClear, onRetry,
}: {
  phase: UploadPhase; file: File | null; uploadErr: string | null
  uploadProgress: number; previewUrl: string | null; accent: string; acceptHint: string
  onClear: () => void; onRetry: () => void
}) {
  if (phase === "idle") {
    return (
      <div className="flex items-start gap-2 px-1">
        <ShieldCheck size={13} weight="fill" aria-hidden="true" className="text-[#6FBF1A] shrink-0 mt-0.5" />
        <p className="abh-muted text-[0.78rem] leading-relaxed">
          Accepts: {acceptHint}. Your file goes directly to ApexbytesHub only — safe, private, used only for your order.
        </p>
      </div>
    )
  }

  if (phase === "uploading") {
    return (
      <div className="flex flex-col gap-2 w-full px-4 py-3 rounded-[14px] bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center justify-between text-base font-bold text-zinc-500 dark:text-zinc-400">
          <span className="truncate">Uploading {file?.name}…</span>
          <span className="font-black tabular-nums shrink-0 ml-2 text-zinc-700 dark:text-zinc-200">{uploadProgress}%</span>
        </div>
        <div className="relative w-full h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${BRAND.blue} 0%, ${BRAND.blue} 70%, ${BRAND.green} 70%, ${BRAND.green} 92%, ${BRAND.orange} 92%, ${BRAND.orange} 100%)`,
            }}
          />
          <div className="absolute inset-y-0 right-0 bg-zinc-200 dark:bg-zinc-800 transition-[width] duration-150 ease-out" style={{ width: `${100 - uploadProgress}%` }} />
        </div>
      </div>
    )
  }

  if (phase === "done" && file) {
    return (
      <div className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-[14px] text-base font-bold" style={{ backgroundColor: `${accent}08`, boxShadow: `0 2px 10px -4px ${accent}40` }}>
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="relative shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="w-8 h-8 rounded-[8px] object-cover shrink-0 border border-zinc-200 dark:border-zinc-700" />
            ) : (
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
                <Paperclip size={14} weight="bold" aria-hidden="true" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950" style={{ backgroundColor: "#22c55e" }}>
              <CheckCircle size={9} weight="fill" color="#fff" aria-hidden="true" />
            </span>
          </span>
          <span className="truncate text-zinc-700 dark:text-zinc-300 text-[0.94rem]">{file.name}</span>
        </span>
        <button type="button" onClick={onClear} aria-label="Remove file" className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} weight="bold" aria-hidden="true" />
        </button>
      </div>
    )
  }

  if (phase === "error") {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2 w-full px-4 py-3 rounded-[14px] text-base font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
          <WarningCircle size={17} weight="fill" aria-hidden="true" className="shrink-0 mt-0.5" />
          <span className="leading-snug font-medium">{uploadErr}</span>
        </div>
        <button type="button" onClick={onRetry} className="text-sm font-black underline" style={{ color: accent }}>
          Try a different file
        </button>
      </div>
    )
  }

  return null
} 