"use client"

import { Copy } from "@phosphor-icons/react"

export function TipsPanel({ tips, isGeneric, accent, copied, onCopy }: {
  tips: string[]; isGeneric: boolean; accent: string; copied: boolean; onCopy: () => void
}) {
  if (tips.length === 0) return null
  return (
    <div className="animate-in fade-in duration-150 text-left relative">
      <div className="relative mb-3 flex items-center justify-between gap-2">
        {isGeneric ? (
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            General tips for this hub
          </span>
        ) : <span />}
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy tips"
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-[14px] text-[0.74rem] font-black uppercase tracking-wider transition-all active:scale-95"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <Copy size={13} weight="bold" aria-hidden="true" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: accent }} aria-hidden="true" />
            <span className="abh-body text-base">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
