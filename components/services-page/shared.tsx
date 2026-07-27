"use client"

import { useEffect, useRef } from "react"
import {
  Printer, FileText, PaintBrush, Globe, Desktop,
} from "@phosphor-icons/react"
import { HubId } from "@/lib/brand"
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

// ─── Back-button modal stack ──────────────────────────────────────────────────
export function useModalBackStack(
  activeHub: HubId | null, setActiveHub: (h: HubId | null) => void,
  selectedService: SelectedService | null, setSelectedService: (s: SelectedService | null) => void,
) {
  const prevHub     = useRef<HubId | null>(null)
  const prevService = useRef<SelectedService | null>(null)

  useEffect(() => {
    if (activeHub && activeHub !== prevHub.current) {
      window.history.pushState({ abModal: "hub" }, "")
      prevHub.current = activeHub
    }
  }, [activeHub])

  useEffect(() => {
    if (selectedService && selectedService !== prevService.current) {
      window.history.pushState({ abModal: "service" }, "")
      prevService.current = selectedService
    }
  }, [selectedService])

  useEffect(() => {
    const onPop = () => {
      if (selectedService) { setSelectedService(null); prevService.current = null; window.history.pushState({ abModal: "hub" }, ""); return }
      if (activeHub) { setActiveHub(null); prevHub.current = null }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [activeHub, selectedService, setActiveHub, setSelectedService])
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
