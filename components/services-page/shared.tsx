"use client"

import { useCallback, useEffect, useRef } from "react"
import type { PanInfo } from "framer-motion"
import {
  Printer, FileText, PaintBrush, Globe, Desktop,
} from "@phosphor-icons/react"
import { HubId } from "@/lib/data"
import { SelectedService } from "./lib"

// ─── Hub icon ─────────────────────────────────────────────────────────────────
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

// ─── Loader — plain rotating ring, matches the reference upload spinners ─────
export function AbhLoader({ size = 28, color }: { size?: number; color?: string }) {
  return (
    <div
      className="animate-spin rounded-full border-[3px] border-current/20 border-t-current shrink-0"
      style={{ width: size, height: size, color: color ?? "currentColor" }}
      aria-hidden="true"
    />
  )
}

// ─── Drag handle — shared bottom-sheet grip. Was identical inline markup
// duplicated in both HubModal and ServiceDetailModal. ────────────────────────
export function DragHandle() {
  return (
    <div className="flex justify-center pt-2.5 pb-0.5 shrink-0" aria-hidden="true">
      <div className="w-9 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
    </div>
  )
}

// ─── Drag-to-dismiss threshold — same two numbers were duplicated in both
// modals' handleDragEnd. ──────────────────────────────────────────────────────
export function shouldDismissOnDrag(info: PanInfo) {
  return info.offset.y > 120 || info.velocity.y > 600
}

// ─── Back-button modal stack ──────────────────────────────────────────────────
// Returns `closeHub`/`closeService`. Every UI close path (X, backdrop,
// Escape, drag-to-dismiss) must call these instead of setting state
// directly — this guarantees the history entry pushed when a modal opened
// is consumed exactly once, whether the modal closes via a UI control or
// the physical back button. Calling setActiveHub(null)/setSelectedService(null)
// directly from a UI control left a "ghost" history entry that silently
// ate the user's next back-press without navigating anywhere.
//
// Also owns the single Escape-key listener for both modals, so Escape
// closes only the topmost open modal. Previously each modal registered
// its own listener on `window`; when both were open at once (a service
// opened from within a hub), one Escape press fired both listeners and
// closed both modals simultaneously instead of just the top one.
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
      if (selectedService) {
        servicePushed.current = false
        setSelectedService(null)
        if (activeHub) {
          // Re-push so the hub modal's own entry stays consistent — one
          // physical back from "service" should land on "hub", not skip
          // past it and let the next back-press exit the page early.
          window.history.pushState({ abModal: "hub" }, "")
          hubPushed.current = true
        }
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
      // Clear synchronously before the async popstate fires, so a rapid
      // double-close (e.g. double-click) can't call history.back() twice.
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

// ─── Focus trap ───────────────────────────────────────────────────────────────
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
