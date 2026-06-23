"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Sun, Moon, X } from "@phosphor-icons/react"
import { NAV_ITEMS } from "@/lib/brand"
import { cn } from "@/lib/utils"

// Surgical fix: Helper to map paths to hub-specific CSS variables
const getHubColor = (path: string) => {
  if (path.includes("/about")) return "var(--brand-orange)"
  if (path.includes("/contact")) return "var(--brand-gray)"
  if (path.includes("/services")) return "var(--brand-green)"
  if (path.includes("/tech")) return "var(--brand-blue-dark)"
  return "var(--brand-blue)" // Default primary
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
  const menuRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const navigate = useCallback((path: string) => {
    router.push(path); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" })
  }, [router])

  const handleLogoMouseEnter = () => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    setIsTextExpanded(true)
  }
  const handleLogoMouseLeave = () => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 1200)
  }

  const pillClass = "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 rounded-[14px] border border-gray-200 dark:border-zinc-800 shadow-sm"

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 pt-5 h-[--nav-h] items-center pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-[1200px]">
          
          {/* Logo Section */}
          <div className={cn(pillClass, "flex items-center cursor-pointer select-none pointer-events-auto", isTextExpanded ? "pl-3 pr-4 gap-2.5" : "px-2.5 gap-0", menuOpen ? "opacity-0 pointer-events-none" : "opacity-100")}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
            onClick={() => navigate("/")}
          >
            <div className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-[14px] overflow-hidden" 
              style={mounted && theme === "dark" ? { filter: "invert(1) sepia(1) saturate(2.5) hue-rotate(150deg) brightness(0.85)" } : undefined}>
              <Image src="/logo.png" alt="" fill priority sizes="36px" className="object-contain" />
            </div>
            <div className="font-sans font-black text-[1.1rem] overflow-hidden flex items-center" style={{ maxWidth: isTextExpanded ? "180px" : "0px", opacity: isTextExpanded ? 1 : 0 }}>
              <span className="text-brand-blue dark:text-brand-light-blue whitespace-nowrap">Apexbytes</span><span className="text-brand-green dark:text-brand-light-green whitespace-nowrap">Hub</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className={cn(pillClass, "hidden md:flex items-center gap-1 px-1 pointer-events-auto absolute left-1/2 -translate-x-1/2 transition-all duration-300", !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path
              const hubColor = getHubColor(item.path)
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    backgroundColor: isActive ? `${hubColor}20` : undefined,
                    color: isActive ? hubColor : undefined,
                    boxShadow: isActive ? `0 0 0 2px ${hubColor}` : undefined
                  }}
                  className="px-4 py-2 rounded-[14px] text-[0.84rem] font-black transition-all duration-300 hover:text-brand-blue dark:hover:text-brand-light-blue"
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className={cn(pillClass, "flex items-center gap-3 pl-3 pr-3 pointer-events-auto ml-4 transition-all duration-300")}>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
            </button>
            <button ref={menuTriggerRef} onClick={() => setMenuOpen(true)} className="md:hidden">Menu</button>
          </div>
        </div>
      </header>
    </>
  )
}
