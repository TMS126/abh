"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { Sun, Moon, X } from "@phosphor-icons/react"
import { NAV_ITEMS, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

type NavColorPair = { light: string; dark: string }

// Picks white or near-black text against a given background hex, based on
// actual WCAG relative luminance rather than assuming light/dark theme
// tells you which one you need. Some route colors (e.g. light-mode green
// and orange) are mid-brightness and read as failing contrast with white
// text even though "light mode" might suggest white is the safe choice —
// this checks the real color instead of guessing from the theme.
function getReadableTextColor(hex: string): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  // Contrast against white (lum 1.0) vs near-black (lum ~0.012, #18181b)
  const contrastWhite = 1.05 / (luminance + 0.05)
  const contrastDark  = (luminance + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#18181b"
}

export function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [mounted,        setMounted]        = useState(false)
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [navVisible,     setNavVisible]     = useState(true)
  const [isTextExpanded, setIsTextExpanded] = useState(true)

  const lastScrollY    = useRef(0)
  const logoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menuRef        = useRef<HTMLDivElement>(null)
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

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const pillClass = "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 rounded-[14px] border border-gray-200 dark:border-zinc-800 shadow-sm"

  // Per-page accent, used for: the mobile menu's active link, the shared
  // controls pill's route echo, and the desktop nav's active pill fill.
  // Same map drives all three so the palette stays consistent everywhere
  // in the navbar.
  const MOBILE_NAV_COLORS: { [path: string]: NavColorPair } = {
    "/":         { light: BRAND.blue,       dark: BRAND.lightBlue   }, // Home — primary blue
    "/services": { light: BRAND.green,      dark: BRAND.lightGreen  },
    "/gallery":  { light: BRAND.orange,     dark: BRAND.lightOrange },
    "/about":    { light: BRAND.blueDark,   dark: BRAND.lightBlue   }, // "another blue" — same distinct navy used for Contact's page-glow earlier
   "/contact":  { light: BRAND.dark100, dark: BRAND.techGreyDark }, // Tech Hub's grey identity — dark100 passes ~12.6:1 in light mode, techGreyDark (#B8CCE0) passes ~10.7:1 in dark mode
  }

  // Route echo — the shared controls pill (theme toggle, hamburger,
  // close button) picks up the current page's color instead of a fixed
  // orange/blue, tying it to the same per-page palette as the edge glow
  // and mobile nav. Falls back to undefined (existing hardcoded colors)
  // if a route somehow isn't in the map.
  const routeAccent = MOBILE_NAV_COLORS[pathname]
  const routeColor  = mounted && routeAccent ? (theme === "dark" ? routeAccent.dark : routeAccent.light) : undefined

  // Logo icon fill — same routeColor as the controls pill, so the logo
  // itself now re-tints per page (blue on Home, green on Services, orange
  // on Gallery, etc.) instead of the old two-state light/dark CSS filter
  // hack. Falls back to the original blue/lightBlue pairing when a route
  // isn't in the map (or before mount, to avoid a color flash on load).
  const logoColor = routeColor ?? (mounted && theme === "dark" ? BRAND.lightBlue : BRAND.blue)

  // Individual link pill — replaces the old shared frosted-container
  // look on desktop. Rest state: subtle border + soft shadow. Active:
  // solid fill using the link's own routeColor, with text color computed
  // per-color via getReadableTextColor rather than assumed from theme
  // (see note above the helper — some route colors need dark text even
  // in "light mode" contexts). Hover: nudges the whole pill up for a
  // little life, scoped to desktop only.
  const desktopLinkClass = (isActive: boolean, isCta?: boolean) =>
    cn(
      "px-4 py-2 rounded-[14px] text-[0.84rem] transition-all duration-300 border hover:-translate-y-0.5",
      isActive
        ? "font-black border-transparent shadow-sm"
        : "font-medium text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 border-gray-200 dark:border-zinc-800 shadow-sm hover:text-brand-blue dark:hover:text-brand-light-blue hover:shadow-md",
      isCta && "border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/10"
    )

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 pt-5 h-[--nav-h] items-center pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-[1200px]">

          {/* Logo — hides when menu is open, or when scrolling down (same
              show/hide-on-scroll-direction logic as the rest of the nav) */}
          <div
            className={cn(
              pillClass,
              "flex items-center cursor-pointer select-none pointer-events-auto group transition-all duration-300",
              isTextExpanded ? "pl-3 pr-4 gap-2.5" : "px-2.5 gap-0",
              menuOpen || (!navVisible) ? "opacity-0 -translate-y-20 pointer-events-none" : "opacity-100 translate-y-0 pointer-events-auto"
            )}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
            onClick={() => navigate("/")}
          >
            {/* Logo icon — rendered as a CSS mask over a solid fill instead
                of an <img>, so logoColor (route-driven) can tint it to any
                brand color, not just the previous two fixed light/dark
                filter states. */}
            <div
              className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-[14px] overflow-hidden transition-colors duration-300"
              style={{
                backgroundColor: logoColor,
                WebkitMaskImage: "url(/logo.png)",
                maskImage: "url(/logo.png)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
              aria-hidden="true"
            />
            <div className="font-sans font-black text-[1.1rem] leading-none tracking-tight transition-all duration-500 overflow-hidden flex items-center" style={{ maxWidth: isTextExpanded ? "180px" : "0px" }}>
              <span 
                className="whitespace-nowrap transition-colors duration-300"
                style={{ 
                  color: mounted && theme === "dark" ? BRAND.lightBlue : BRAND.blue
                }}
              >
                Apexbytes
              </span>
              <span 
                className="whitespace-nowrap transition-colors duration-300"
                style={{ 
                  color: mounted && theme === "dark" ? BRAND.lightGreen : BRAND.green
                }}
              >
                Hub
              </span>
            </div>
          </div>

          {/* Desktop Nav — shared frosted container removed; each link is
              now its own pill via desktopLinkClass. Each link's own path
              (not the current page) determines its active fill color, and
              text color is computed per-color via getReadableTextColor so
              contrast holds regardless of theme. */}
          <div className={cn("hidden md:flex items-center gap-2 pointer-events-auto absolute left-1/2 -translate-x-1/2 transition-all duration-300", !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
            {NAV_ITEMS.map((item) => {
              const isActive   = pathname === item.path
              const itemAccent = MOBILE_NAV_COLORS[item.path]
              const itemColor  = mounted && itemAccent ? (theme === "dark" ? itemAccent.dark : itemAccent.light) : BRAND.blue
              const itemTextClr = getReadableTextColor(itemColor)

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={isActive ? { backgroundColor: itemColor, color: itemTextClr } : undefined}
                  className={desktopLinkClass(isActive, item.isCta)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Controls — Always visible on desktop, hidden on mobile when menu is open.
              Theme toggle icon, hamburger bars, and mobile close button echo
              the current page's color via routeColor, falling back to the original
              hardcoded orange/light-blue when a route isn't in MOBILE_NAV_COLORS. */}
          <div className={cn(pillClass, "flex items-center gap-3 pl-3 pr-3 pointer-events-auto ml-4 transition-all duration-300", !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
            <button onClick={handleThemeToggle} className="flex items-center justify-center w-7 h-7 active:scale-90 transition-transform" aria-label="Toggle theme">
              {mounted && (
                theme === "dark"
                  ? <Moon size={20} weight="fill" style={{ color: routeColor ?? BRAND.lightBlue }} className="transition-colors duration-300" />
                  : <Sun  size={20} weight="fill" style={{ color: routeColor ?? BRAND.orange }}    className="transition-colors duration-300" />
              )}
            </button>

            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 md:hidden" />

            <button ref={menuTriggerRef} onClick={() => setMenuOpen(true)} className={cn("flex items-center justify-center w-7 h-7 active:scale-90 md:hidden", menuOpen ? "opacity-0 pointer-events-none" : "opacity-100")}>
              <div className="w-4 h-[12px] flex flex-col justify-between items-center">
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: routeColor ?? (mounted && theme === "dark" ? BRAND.lightBlue : BRAND.orange) }} />
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: routeColor ?? (mounted && theme === "dark" ? BRAND.lightBlue : BRAND.orange) }} />
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: routeColor ?? (mounted && theme === "dark" ? BRAND.lightBlue : BRAND.orange) }} />
              </div>
            </button>

            <button onClick={() => setMenuOpen(false)} className={cn("flex items-center justify-center w-7 h-7 active:scale-90 absolute right-3 md:hidden", menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
              <X size={20} weight="bold" style={{ color: routeColor ?? BRAND.orange }} className="transition-colors duration-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={cn("fixed inset-0 z-[9998] md:hidden transition-opacity duration-300", menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
      >
        {/* Rotational fade background */}
        <div
          className={cn("absolute -inset-[50%] transition-opacity duration-700", menuOpen ? "opacity-100 animate-[spin_16s_linear_infinite]" : "opacity-0")}
          style={{ background: "conic-gradient(from 0deg, rgba(30,111,168,0.18), rgba(111,191,26,0.16), rgba(244,162,97,0.16), rgba(30,111,168,0.18))" }}
        />
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />

        {/* Nav links — centered */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
          <nav className="w-full max-w-[320px] flex flex-col items-center gap-2.5">
          {NAV_ITEMS.map((item, idx) => {
  const isActive    = pathname === item.path
  const accent      = MOBILE_NAV_COLORS[item.path]
  const activeColor = accent ? (mounted && theme === "dark" ? accent.dark : accent.light) : undefined

  return (
    <button
      key={item.id}
      onClick={() => navigate(item.path)}
      style={{
        transitionDelay: menuOpen ? `${idx * 60}ms` : "0ms",
        ...(isActive && activeColor
          ? { color: activeColor, backgroundColor: `${activeColor}18` }
          : {}),
      }}
      className={cn(
        "py-3 px-8 rounded-[14px] font-sans text-base transition-all duration-300 active:scale-95 text-center w-[180px] shadow-sm",
        isActive
          ? "font-semibold"
          : "font-medium text-zinc-700 dark:text-zinc-200 hover:text-brand-blue bg-transparent",
        // Contact's CTA marker switched from an orange border to a neutral
        // grey one — it still reads as "this one's different" (the CTA)
        // without pulling in an accent color, matching Contact's own
        // grey/neutral assignment in MOBILE_NAV_COLORS rather than
        // clashing with it.
        item.isCta && "border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
        menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {/* Current-page dot — small colored marker inline before the label,
          only for whichever link matches the live route. Uses the same
          per-page color as the active fill/text above, so it's redundant
          with the tinted background but gives a quicker, more obvious
          "you are here" cue than color alone. */}
      <span className="inline-flex items-center justify-center gap-2">
        {isActive && activeColor && (
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: activeColor }}
          />
        )}
        {item.label}
      </span>
    </button>
  )
})}
          </nav>
        </div>

        {/* Icon-only watermark at bottom of menu — same mask-based tinting
            as the header logo, so it also picks up logoColor instead of
            the old fixed brightness/invert filter pair. */}
        <div
          className={cn(
            "absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center select-none transition-all duration-500 z-10",
            menuOpen ? "opacity-30" : "opacity-0"
          )}
          aria-hidden="true"
        >
          <div
            className="relative w-8 h-8 shrink-0 transition-colors duration-300"
            style={{
              backgroundColor: logoColor,
              WebkitMaskImage: "url(/logo.png)",
              maskImage: "url(/logo.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </div>
      </div>
    </>
  )
    }
