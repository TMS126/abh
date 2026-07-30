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
    <div className="mt-16 mb-8 py-10 md:py-14 text-center">
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Like what you see?</p>
      <p className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto">
        Your project could be our next favourite. Let's bring it to life at {BIZ.name}
      </p>
    </div>
  )
}
