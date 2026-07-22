"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ProjectData } from "@/lib/data"

export function ProjectsPopover({
  projects, accent, isDark, onSelect,
}: {
  projects: ProjectData[]
  accent: string
  isDark: boolean
  onSelect: (p: ProjectData) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const openedByClickRef = useRef(false)
  const pushedRef = useRef(false)

  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches

  const closePopover = useCallback(() => {
    openedByClickRef.current = false
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    } else {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closePopover()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, closePopover])

  useEffect(() => {
    if (open && openedByClickRef.current && !pushedRef.current) {
      window.history.pushState({ projectsPopover: true }, "")
      pushedRef.current = true
    }
  }, [open])

  useEffect(() => {
    const onPop = () => {
      if (pushedRef.current) {
        pushedRef.current = false
        openedByClickRef.current = false
        setOpen(false)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const handleToggleClick = () => {
    if (open) {
      closePopover()
    } else {
      openedByClickRef.current = true
      setOpen(true)
    }
  }

  return (
    <div
      ref={ref}
      className="relative ml-auto"
      onMouseEnter={() => canHover && setOpen(true)}
      onMouseLeave={() => { if (canHover) { setOpen(false); openedByClickRef.current = false } }}
    >
      <button
        onClick={handleToggleClick}
        className={`text-xs font-bold px-3 py-1 rounded-[14px] transition-opacity duration-200 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:scale-105 ${open ? "opacity-0 pointer-events-none" : ""}`}
        aria-expanded={open}
      >
        {projects.length} {projects.length === 1 ? "project" : "projects"}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={`Projects in this hub`}
          className="absolute right-0 top-0 z-50 w-64 abh-shadow-popover bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-4 py-3 cursor-pointer" onClick={closePopover}>
            <span className="text-[0.65rem] font-black" style={{ color: accent }}>
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
            {projects.map(p => (
              <button
                key={p.id}
                role="option"
                aria-selected={false}
                onClick={() => { onSelect(p); closePopover() }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left group/item"
              >
                <div className="relative w-8 h-8 rounded-[8px] shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                  {p.image ? (
                    <Image src={p.image} alt={p.title} fill sizes="32px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: `${accent}20` }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate group-hover/item:underline" style={{ textDecorationColor: accent }}>
                    {p.title}
                  </p>
                  <p className="text-[0.6rem] font-medium text-zinc-400 truncate">{p.shortDesc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
                      } 
