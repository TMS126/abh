// components/gallery/empty-and-tagline.tsx
"use client"

import { WhatsappLogo } from "@phosphor-icons/react"
import { BIZ, WA } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"

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

export function GalleryClosingTagline() {
  return (
    <div className="mt-16 mb-8 py-10 md:py-14 text-center">
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Like what you see?</p>
      <p className="font-sans font-black text-[1.8rem] md:text-[2.25rem] text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto mb-8">
        Your project could be our next favourite. Let's bring it to life at {BIZ.name}
      </p>
      {/* FIX: this section had no CTA button — every other page's closing
          section (Home/Services CtaBar, About's mission section) ends
          with an action. This is a WhatsApp inquiry, so it uses the same
          .abh-wa-btn class as those, not a one-off style. */}
      <ScrollBounce>
        <a
          href={WA.gallery}
          target="_blank"
          rel="noopener noreferrer"
          className="abh-wa-btn inline-flex text-lg px-8 py-4 shadow-xl hover:scale-[1.04] hover:-translate-y-0.5 active:scale-95"
        >
          <WhatsappLogo weight="fill" className="w-6 h-6 shrink-0" aria-hidden="true" />
          Start Your Project
        </a>
      </ScrollBounce>
    </div>
  )
} 
