
// hooks/shared.tsx (or wherever useModalBackStack lives — same file as HubIcon/AbhLoader/DragHandle)
"use client"

import { useCallback, useEffect, useRef } from "react"
import type { PanInfo } from "framer-motion"
import {
  Printer, FileText, PaintBrush, Globe, Desktop,
} from "@phosphor-icons/react"
import { HubId } from "@/lib/data"
import { SelectedService } from "./lib"

export function HubIcon({ id, size = 28, color }: { id: HubId; size?: number; color?: string }) {
  const p = { size, weight: "fill" as const, color: color ?? "currentColor", "aria-hidden": true }
  switch (id) {
    case "print":    return <Printer    {...p} />
    case "doc":      return <FileText   {...p} />
    case "design":   return <PaintBrush {...p} />
    case "eservice": return <Globe      {...p} />
    case "tech":     return <Desktop    {...p} />
  }
}

export function AbhLoader({ size = 28, color }: { size?: number; color?: string }) {
  return (
    <div
      className="animate-spin rounded-full border-[3px] border-current/20 border-t-current shrink-0"
      style={{ width: size, height: size, color: color ?? "currentColor" }}
      aria-hidden="true"
    />
  )
}

export function DragHandle() {
  return (
    <div className="flex justify-center pt-2.5 pb-0.5 shrink-0" aria-hidden="true">
      <div className="w-9 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
    </div>
  )
}

export function shouldDismissOnDrag(info: PanInfo) {
  return info.offset.y > 120 || info.velocity.y > 600
}

// ─── Back-button modal stack ──────────────────────────────────────────────
// IMPORTANT: every UI close path (X button, backdrop click, drag-dismiss)
// MUST call closeHub()/closeService() returned from this hook — never set
// activeHub/selectedService to null directly from a UI handler. Doing so
// leaves the history entry pushed on open permanently unconsumed, which
// silently accumulates "ghost" entries every time a modal is closed by
// anything other than the physical back button. Enough ghost entries and
// a real back-press eventually burns through more of the stack than it
// should, running past the site's root entry and exiting the browser
// entirely instead of landing on the page underneath.
export function useModalBackStack(
  activeHub: HubId | null, setActiveHub: (h: HubId | null) => void,
  selectedService: SelectedService | null, setSelectedService: (s: SelectedService | null) => void,
) {
  const hubPushed     = useRef(false)
  const servicePushed = useRef(false)

  useEffect(() => {
    if (activeHub && !hubPushed.current) {
      window.history.pushState({ abModal: "hub" }, "")
      hubPushed.current = true
    }
    if (!activeHub) hubPushed.current = false
  }, [activeHub])

  useEffect(() => {
    if (selectedService && !servicePushed.current) {
      window.history.pushState({ abModal: "service" }, "")
      servicePushed.current = true
    }
    if (!selectedService) servicePushed.current = false
  }, [selectedService])

  useEffect(() => {
    const onPop = () => {
      // A physical back consumes exactly ONE entry — whatever's on top.
      // If the service modal is open, its entry is what's on top: close
      // just the service and stop. The hub entry pushed earlier is still
      // sitting untouched right below it in history, so the NEXT
      // back-press naturally reveals it — no need to re-push anything
      // here. (The previous version re-pushed a fresh hub entry on every
      // service-close, which inflated the stack by one phantom entry each
      // time and was the second half of the "exits the site" bug.)
      if (selectedService) {
        servicePushed.current = false
        setSelectedService(null)
        return
      }
      if (activeHub) {
        hubPushed.current = false
        setActiveHub(null)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [activeHub, selectedService, setActiveHub, setSelectedService])

  const closeHub = useCallback(() => {
    if (hubPushed.current) {
      hubPushed.current = false
      window.history.back()
    } else {
      setActiveHub(null)
    }
  }, [setActiveHub])

  const closeService = useCallback(() => {
    if (servicePushed.current) {
      servicePushed.current = false
      window.history.back()
    } else {
      setSelectedService(null)
    }
  }, [setSelectedService])

  useEffect(() => {
    if (!activeHub && !selectedService) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (selectedService) { closeService(); return }
      if (activeHub) closeHub()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [activeHub, selectedService, closeHub, closeService])

  return { closeHub, closeService }
}

export function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement>) {
  const previouslyFocused = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!active) return
    previouslyFocused.current = document.activeElement as HTMLElement
    containerRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]; const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => { document.removeEventListener("keydown", handleKeyDown); previouslyFocused.current?.focus?.() }
  }, [active, containerRef])
} 