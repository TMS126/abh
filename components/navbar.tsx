"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Sun, Moon, X } from "@phosphor-icons/react"
import { NAV_ITEMS, HUB_COLORS } from "@/lib/brand"
import { cn } from "@/lib/utils"

// Helper to determine the specific color for each hub
const getHubColor = (path: string) => {
  if (path.includes("/print")) return HUB_COLORS.print.tagText
  if (path.includes("/docs")) return HUB_COLORS.doc.tagText
  if (path.includes("/design")) return HUB_COLORS.design.tagText
  if (path.includes("/services")) return HUB_COLORS.service.tagText
  if (path.includes("/tech")) return HUB_COLORS.tech.tagText
  return "#1E6FA8" // Default: Brand Blue
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const [isTextExpanded, setIsTextExpanded] = useState(true)

  const lastScrollY = useRef(0)
  const logoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 2670)
    return () => { if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current) }
  }, [mounted])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > 80) setNavVisible(y <= lastScrollY.current)
      else setNavVisible(true)
      lastScrollY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navigate = useCallback((path: string) => {
    router.push(path)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [router])

  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path))

  const pillClass = "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 rounded-[14px] border border-gray-200 dark:border-zinc-800 shadow-sm"

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 pt-5 h-[--nav-h] items-center pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-[1200px]">
          
          {/* Logo Section - No pill background on mobile, pill on desktop */}
          <div
            className={cn("flex items-center cursor-pointer select-none pointer-events-auto transition-all duration-300", 
              "md:bg-white/80 md:dark:bg-zinc-900/80 md:backdrop-blur-md md:rounded-[14px] md:border md:border-gray-200 md:dark:border-zinc-800 md:shadow-sm",
              isTextExpanded ? "pl-3 pr-4 gap-2.5" : "px-2.5 gap-0", menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onClick={() => navigate("/")}
          >
            <div className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-[14px] overflow-hidden transition-all duration-300" style={mounted && theme === "dark" ? { filter: "invert(1) sepia(1) saturate(2.5) hue-rotate(150deg) brightness(0.85)" } : undefined}>
              <Image src="/logo.png" alt="ApexBytes" fill priority sizes="36px" className="object-contain" />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className={cn(pillClass, "hidden md:flex items-center gap-1 px-1 pointer-events-auto absolute left-1/2 -translate-x-1/2 transition-all duration-300", !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path)
              const color = getHubColor(item.path)
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    backgroundColor: active ? `${color}20` : undefined,
                    color: active ? color : undefined,
                    boxShadow: active ? `0 0 0 2px ${color}` : undefined
                  }}
                  className="px-4 py-2 rounded-[14px] text-[0.84rem] font-black transition-all duration-300"
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className={cn(pillClass, "flex items-center gap-3 pl-3 pr-3 pointer-events-auto ml-4 transition-all duration-300", !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex items-center justify-center w-7 h-7 active:scale-90 transition-transform">
              {mounted && (theme === "dark" ? <Moon size={20} weight="fill" className="text-brand-light-blue" /> : <Sun size={20} weight="fill" className="text-brand-orange" />)}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <X size={24} /> : <div className="space-y-1"><div className="w-6 h-0.5 bg-zinc-600" /><div className="w-6 h-0.5 bg-zinc-600" /></div>}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu */}
      <div className={cn("fixed inset-0 z-[9998] flex flex-col items-center justify-center transition-all duration-300", menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-2xl" onClick={() => setMenuOpen(false)} />
        <nav className="relative z-10 flex flex-col gap-6">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path)
            const color = getHubColor(item.path)
            return (
              <button 
                key={item.id} 
                onClick={() => navigate(item.path)}
                style={{ color: active ? color : undefined }}
                className="text-2xl font-black transition-all"
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
