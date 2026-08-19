// components/gallery/empty-and-tagline.tsx — full file, paste over the current one
"use client"

import { BIZ, WA } from "@/lib/brand"
import { CtaBar } from "@/components/strip-section"

export function EmptyHubState({ label, query }: { label: string; query?: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-12 px-6 rounded-[14px] border border-dashed border-zinc-200 dark:border-zinc-800">
      <p className="text-[1.2rem] font-bold text-zinc-500 dark:text-zinc-400">
        {query
          ? <>No {label} projects match &ldquo;{query}&rdquo;</>
          : <>No {label} projects yet — check back soon.</>}
      </p>
    </div>
  )
}

// FIX: was a plain text block with no card, no glow, no accent badge —
// every other page's closing section (Home/Services CtaBar, About) ends
// in the same visual container. Now reuses CtaBar directly instead of
// duplicating its markup, so any future tweak to that card style updates
// Gallery automatically too.
export function GalleryClosingTagline() {
  return (
    <CtaBar
      badgeText="Like What You See?"
      title={`Your Project Could Be Our Next Favourite`}
      description={`Let's bring it to life at ${BIZ.name}.`}
      buttonText="Start Your Project"
      buttonHref={WA.gallery}
    />
  )
} 
