// components/matte-background.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MatteBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "hero" | "standard"
}

// FIX: was hardcoded bg-white / dark:bg-[#081428] — a navy that matched
// neither globals.css's real --background token (#0D1B2A) nor
// services-page's own separately hardcoded #081428. Three different
// "the background" for what's supposed to be one value. Swapped to
// bg-background/text-foreground, the real token — this is what actually
// makes every page consistent, since globals.css is the single source
// of truth now, not a color picked by eye in three separate files.
export function MatteBackground({ children, className, variant = "standard", ...props }: MatteBackgroundProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden select-none cursor-default bg-background text-foreground transition-colors duration-300",
        variant === "hero" ? "min-h-[calc(100vh-68px)] flex flex-col items-center justify-center pt-12 md:pt-16 pb-6" : "min-h-screen pt-12 pb-14",
        className
      )}
      {...props}
    >
      {/* Centralized Matte Texture Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      {/* Content Injection Node */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  )
} 
