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

// ─── Brand loader ─────────────────────────────────────────────────────────────
const ABH_LOADER_PATH =
  "M50,4 C68,4 82,10 90,26 C97,40 96,60 88,74 C80,88 64,96 50,96 " +
  "C34,96 18,90 10,74 C3,60 4,40 12,24 C20,10 34,4 50,4 Z"

export function AbhLoader({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0 abh-loader-spin">
      <style>{`
        @keyframes abh-loader-rotate { to { transform: rotate(360deg); } }
        .abh-loader-spin { animation: abh-loader-rotate 2.2s linear infinite; }
        @keyframes abh-loader-dash {
          0%   { stroke-dasharray: 1, 150;  stroke-dashoffset: 0; }
          50%  { stroke-dasharray: 46, 150; stroke-dashoffset: -18; }
          100% { stroke-dasharray: 46, 150; stroke-dashoffset: -63; }
        }
        .abh-loader-dash { animation: abh-loader-dash 1.5s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 100 100" width={size} height={size} className="block" aria-hidden="true">
        <path d={ABH_LOADER_PATH} fill="none" strokeWidth="7" pathLength={100} className="text-zinc-200 dark:text-zinc-700" stroke="currentColor" />
        <path d={ABH_LOADER_PATH} fill="none" stroke="#1E6FA8" strokeWidth="7" strokeLinecap="round" pathLength={100} className="abh-loader-dash" />
      </svg>
    </div>
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
