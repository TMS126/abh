"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  WhatsappLogo,
  Printer,
  FileText,
  PaintBrush,
  Globe,
  Desktop,
} from "@phosphor-icons/react"
import { BIZ, WA, HUB_COLORS } from "@/lib/brand"

const HUBS = [
  { name: "Print", icon: Printer, color: HUB_COLORS.print.primary },
  { name: "Document", icon: FileText, color: HUB_COLORS.doc.primary },
  { name: "Design", icon: PaintBrush, color: HUB_COLORS.design.primary },
  { name: "E-Service", icon: Globe, color: HUB_COLORS.eservice.primary },
  { name: "Tech", icon: Desktop, color: HUB_COLORS.tech.primary },
]

export default function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 bg-background overflow-hidden">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-dark via-background to-brand-light-blue/20 opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">

        {/* TEXT */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-brand-blue-dark dark:text-brand-light-blue leading-tight mb-4">
            {BIZ.tagline}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground">
            Fast printing, clean designs, document help, and online services —
            all in one place in {BIZ.location}.
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => router.push("/services")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-bold shadow-md active:scale-95 transition"
          >
            Services
            <ArrowRight size={18} />
          </button>

          <a
            href={WA.general}
            target="_blank"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-green text-white shadow-md active:scale-95 transition"
          >
            <WhatsappLogo size={22} weight="fill" />
          </a>
        </div>

        {/* HUB GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

          {HUBS.map((hub, i) => {
            const Icon = hub.icon

            return (
              <div
                key={i}
                onClick={() => router.push("/services")}
                className="aspect-square rounded-xl border border-border bg-white dark:bg-zinc-900 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.04] active:scale-95 shadow-sm"
              >
                <Icon
                  size={32}
                  weight="fill"
                  style={{ color: hub.color }}
                />

                <span className="text-[11px] font-bold text-center text-muted-foreground">
                  {hub.name}
                </span>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
} 
