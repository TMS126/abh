// app/tools/jpg-to-pdf/reconvert-banner.tsx
"use client"

import { ArrowsClockwise } from "@phosphor-icons/react"
import type { ReconvertPrompt } from "./types"

export function ReconvertBanner({
  prompt, onResolve,
}: {
  prompt: ReconvertPrompt
  onResolve: (choice: "all" | "new-only" | "cancel") => void
}) {
  if (!prompt) return null
  const hasNew = prompt.overlapCount < prompt.totalCount

  return (
    <div role="alertdialog" aria-label="Some images were already converted" className="mt-4 rounded-[14px] border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <ArrowsClockwise weight="bold" className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          {prompt.overlapCount} of {prompt.totalCount} selected image{prompt.overlapCount > 1 ? "s were" : " was"} already converted. Convert again?
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        <button type="button" onClick={() => onResolve("all")} className="px-4 py-2 rounded-[10px] text-sm font-black bg-amber-600 text-white hover:bg-amber-700 transition-colors">
          Convert Again
        </button>
        {hasNew && (
          <button type="button" onClick={() => onResolve("new-only")} className="px-4 py-2 rounded-[10px] text-sm font-black border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
            Only New Ones
          </button>
        )}
        <button type="button" onClick={() => onResolve("cancel")} className="px-4 py-2 rounded-[10px] text-sm font-black text-zinc-500 hover:text-zinc-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
