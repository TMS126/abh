import { ProjectData } from "@/lib/data"

export type HubId = "print" | "doc" | "design" | "eservice" | "tech"

export const ROW_ORDER: { id: HubId; label: string; short: string }[] = [
  { id: "print",    label: "Print Hub",     short: "Print" },
  { id: "design",   label: "Design Hub",    short: "Design" },
  { id: "doc",      label: "Document Hub",  short: "Document" },
  { id: "eservice", label: "E-Service Hub", short: "E-Service" },
  { id: "tech",     label: "Tech Hub",      short: "Tech" },
]

export const BA_HUBS: HubId[] = ["design", "tech"]

export const CLIENT_TYPE_LABEL: Record<string, string> = {
  client:   "Real Client Work",
  sample:   "Representative Example",
  practice: "Practice Project",
}
export const CLIENT_TYPE_BADGE_BG: Record<string, string> = {
  client:   "rgba(34,197,94,0.85)",
  sample:   "rgba(244,162,97,0.9)",
  practice: "rgba(63,63,70,0.85)",
}

export function hubLabelFor(hub: string): string {
  return ROW_ORDER.find(r => r.id === hub)?.label ?? ""
}

export function buildInquireHref(project: ProjectData): string {
  const params = new URLSearchParams({
    service: hubLabelFor(project.hub),
    message: `I'm interested in a project like "${project.title}" — could we discuss pricing and turnaround?`,
  })
  return `/contact?${params.toString()}`
}

export function playClickSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx  = new AudioCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(680, ctx.currentTime)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.09)
  } catch {
    // Audio blocked/unavailable — fail silently, never block the click.
  }
}
