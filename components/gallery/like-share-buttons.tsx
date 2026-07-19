"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ShareNetwork, LinkSimple, Heart } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"

export function ShareButton({ url, title }: { url: string; title: string }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  const [shared, setShared] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: `Check out "${title}" from Apexbytes Hub`, url })
        return
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      timeoutRef.current = setTimeout(() => setShared(false), 1500)
    } catch {
      // fail silently
    }
  }

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share

  return (
    <button
      onClick={handleShare}
      aria-label="Share this project"
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors hover:opacity-80"
      style={{ backgroundColor: `${blueColor}15`, color: blueColor }}
    >
      {shared ? <Check size={16} weight="bold" className="text-green-500" /> : canNativeShare ? <ShareNetwork size={16} weight="bold" /> : <LinkSimple size={16} weight="bold" />}
    </button>
  )
}

export function LikeButton({ liked, onToggle, context = "header" }: {
  liked: boolean
  onToggle: (e: React.MouseEvent) => void
  context?: "card" | "header"
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  return (
    <button
      onClick={onToggle}
      aria-label={liked ? "Unlike this project" : "Like this project"}
      aria-pressed={liked}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 hover:opacity-80",
        context === "card" && "bg-black/40 hover:bg-black/60 backdrop-blur-sm"
      )}
      style={context === "header" ? { backgroundColor: `${blueColor}15`, color: blueColor } : undefined}
    >
      <Heart
        key={liked ? "liked" : "unliked"}
        size={16}
        weight={liked ? "fill" : "bold"}
        className={cn(
          "animate-in zoom-in-50 duration-300",
          liked ? "text-red-600 dark:text-red-400" : context === "card" ? "text-white" : ""
        )}
      />
    </button>
  )
}
