// components/notice-pill.tsx
// Shared expandable notice pill — previously two near-duplicate
// implementations: NoticeNotification (services-page, orange, Megaphone
// icon) and NoticePill (gallery-page, hardcoded blue #1E6FA8, Info icon,
// and a label bug where expanded state still showed "Notice" instead of
// a fuller expanded label). This version fixes both: takes accentColor
// from BRAND/HUB_COLORS instead of a hardcoded hex, and requires distinct
// collapsed/expanded labels.
"use client"

import { useState } from "react"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function NoticePill({
  accentColor,
  Icon,
  collapsedLabel,
  expandedLabel,
  isDark,
  children,
}: {
  accentColor: string
  Icon: React.ElementType
  collapsedLabel: string
  expandedLabel: string
  isDark: boolean
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const pillBg = isDark ? `${accentColor}cc` : accentColor

  return (
    <div
      className="mx-auto w-full overflow-hidden"
      style={{
        maxWidth: expanded ? "28rem" : "120px",
        borderRadius: "14px",
        border: expanded ? `1px solid ${accentColor}33` : "none",
        backgroundColor: expanded ? undefined : pillBg,
        boxShadow: expanded
          ? undefined
          : "0 4px 14px -4px rgba(0,0,0,0.22), 0 2px 6px -2px rgba(0,0,0,0.14)",
        transition:
          "max-width 300ms ease-in-out, box-shadow 300ms ease-in-out, background-color 300ms ease-in-out, border 300ms ease-in-out",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse notice" : collapsedLabel}
        className={cn(
          "w-full flex items-center gap-2 transition-all duration-300 ease-in-out active:scale-[0.97]",
          expanded ? "px-5 py-3.5 justify-between" : "pl-4 pr-5 py-2.5 justify-center"
        )}
        style={{ backgroundColor: expanded ? `${accentColor}0d` : undefined }}
      >
        {!expanded && (
          <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/25 shrink-0">
            <Icon size={11} weight="fill" color="#fff" aria-hidden="true" />
          </span>
        )}
        {expanded && (
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor }}>
            <Icon size={14} weight="fill" color="#fff" aria-hidden="true" />
          </div>
        )}
        <span
          className={cn(
            "whitespace-nowrap font-black text-[0.9rem] tracking-tight transition-colors duration-300 ease-in-out",
            expanded ? "flex-1 text-left" : "text-white"
          )}
          style={{ color: expanded ? accentColor : undefined }}
        >
          {expanded ? expandedLabel : collapsedLabel}
        </span>
        <X
          size={14}
          weight="bold"
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-opacity duration-300 ease-in-out text-zinc-400",
            expanded ? "opacity-100" : "opacity-0 w-0 h-0"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 pt-1">
            <p className="abh-body text-[1rem]">{children}</p>
          </div>
        </div>
      </div>
    </div>
  )
                  }
