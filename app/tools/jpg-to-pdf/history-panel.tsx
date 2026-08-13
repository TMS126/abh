// app/tools/jpg-to-pdf/history-panel.tsx
"use client"

import { ClockCounterClockwise, Trash } from "@phosphor-icons/react"
import { formatLocalDateTime } from "./utils"
import type { HistoryEntry } from "./types"

export function HistoryPanel({ history, onClear }: { history: HistoryEntry[]; onClear: () => void }) {
  if (history.length === 0) return null

  return (
    <div className="mt-6 abh-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.78rem] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
          <ClockCounterClockwise weight="fill" size={14} aria-hidden="true" />
          Recent
        </span>
        <button type="button" onClick={onClear} aria-label="Clear recent conversions" className="text-zinc-300 hover:text-red-500 transition-colors">
          <Trash weight="bold" className="w-4 h-4" />
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {history.map((entry, i) => (
          <li key={`${entry.fileName}-${i}`} className="flex items-center justify-between text-sm">
            <span className="text-zinc-700 dark:text-zinc-300 truncate">{entry.fileName}</span>
            <span className="text-zinc-400 shrink-0 ml-3 text-xs">{formatLocalDateTime(entry.isoDate)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
