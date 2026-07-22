import { BIZ } from "@/lib/brand"

export function EmptyHubState({ label, query }: { label: string; query?: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-12 px-6 rounded-[14px] border border-dashed border-zinc-200 dark:border-zinc-800">
      <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
        {query
          ? <>No {label} projects match &ldquo;{query}&rdquo;</>
          : <>No {label} projects yet — check back soon.</>}
      </p>
    </div>
  )
}

export function GalleryClosingTagline() {
  return (
    <div className="relative mt-4 mb-4 overflow-hidden rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-6 py-10 md:py-12 text-center abh-shadow-card">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#1E6FA8]" />
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Like what you see?</p>
      <p className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto">
        Your project could be our next favourite. Let's bring it to life at {BIZ.name}
      </p>
    </div>
  )
}
