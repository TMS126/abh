"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { Sun, Moon, X, List } from "@phosphor-icons/react"
import { NAV_ITEMS, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useNavVisibility, useMobileMenu, useLogoAnimation } from "@/hooks/use-navbar"
import { MobileMenu } from "@/components/navbar/mobile-menu"

// Hover accent for plain-text nav links — not currently in BRAND under this
// file's imports, so pinned to the same orange used elsewhere on the site
// (Design Hub accent / notice banners) rather than guessing a token name.
const HOVER_ORANGE = "#F4A261"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [desktopNavOpen, setDesktopNavOpen] = useState(false)
  const [contactHovered, setContactHovered] = useState(false)

  const navVisible = useNavVisibility()
  const { menuOpen, setMenuOpen } = useMobileMenu()
  const { isTextExpanded, handleLogoMouseEnter, handleLogoMouseLeave } = useLogoAnimation()

  const desktopNavRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    setDesktopNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!desktopNavOpen) return

    const onPointerDown = (e: PointerEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setDesktopNavOpen(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [desktopNavOpen])

  const navigate = useCallback((path: string) => {
    router.push(path)
    setMenuOpen(false)
    setDesktopNavOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [router, setMenuOpen])

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Acrylic pill for logo + controls — backdrop-blur only, no visible fill
  // or border at rest. The frosted-glass effect only becomes visible once
  // something actually scrolls underneath it; nothing is drawn on top of
  // an empty background otherwise.
  const glassPillClass = "backdrop-blur-md py-2 rounded-[14px] pointer-events-auto"

  const neutralColor = useMemo(() => {
    return mounted && theme === "dark" ? "#e4e4e7" : "#3f3f46"
  }, [mounted, theme])

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 pt-5 h-[--nav-h] items-center pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-[1200px]">

          {/* Logo - FIXED */}
          <div
            className={cn(
              glassPillClass,
              "flex items-center cursor-pointer select-none pointer-events-auto group transition-all duration-300",
              isTextExpanded ? "pl-3 pr-4 gap-2.5" : "px-2.5 gap-0",
              menuOpen || !navVisible ? "opacity-0 -translate-y-20 pointer-events-none" : "opacity-100 translate-y-0 pointer-events-auto"
            )}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
            onClick={() => navigate("/")}
          >
            <div
              className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-[14px] overflow-hidden transition-colors duration-300"
              style={{
                backgroundColor: neutralColor,
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
            <div 
              className="font-sans font-black text-[1.1rem] leading-none tracking-tight transition-all duration-500 overflow-hidden flex items-center" 
              style={{ maxWidth: isTextExpanded ? "180px" : "0px" }}
            >
              <span className="whitespace-nowrap transition-colors duration-300" style={{ color: BRAND.blue }}>
                Apexbytes
              </span>
              <span 
                className="whitespace-nowrap transition-colors duration-300"
                style={{ color: mounted && theme === "dark" ? BRAND.lightGreen : BRAND.green }}
              >
                Hub
              </span>
            </div>
          </div>

          {/* Desktop Nav — hamburger itself stays completely bare (no
              blur/fill applied to it directly). Only the expanded links
              row gets the same acrylic backdrop-blur treatment as the
              logo/controls pills, matching the rest of the nav's glass
              language, once it actually has content behind it to blur. */}
          <div
            ref={desktopNavRef}
            onMouseEnter={() => setDesktopNavOpen(true)}
            onMouseLeave={() => setDesktopNavOpen(false)}
            className={cn(
              "hidden md:flex items-center pointer-events-auto absolute left-1/2 -translate-x-1/2 transition-all duration-300",
              !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100"
            )}
          >
            <div className={cn(
              "flex items-center py-2 transition-all duration-300 ease-out",
              desktopNavOpen ? "gap-1 px-1" : "px-2"
            )}>
              <button
                onClick={() => setDesktopNavOpen(v => !v)}
                aria-label={desktopNavOpen ? "Collapse navigation" : "Expand navigation"}
                aria-expanded={desktopNavOpen}
                className={cn(
                  "relative flex items-center justify-center shrink-0 transition-all duration-200 ease-out",
                  desktopNavOpen ? "w-0 opacity-0 scale-75 pointer-events-none" : "w-9 h-9 opacity-100 scale-100"
                )}
              >
                <List size={18} weight="bold" style={{ color: neutralColor }} className="transition-colors duration-300" />
              </button>

              <div className={cn(
                "flex items-center gap-1 transition-all duration-300 ease-out backdrop-blur-md rounded-[14px]",
                desktopNavOpen ? "opacity-100 translate-x-0 max-w-[600px] px-1" : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
              )}>
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = pathname === item.path

                  if (item.isCta) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        onMouseEnter={() => setContactHovered(true)}
                        onMouseLeave={() => setContactHovered(false)}
                        style={{
                          transitionDelay: desktopNavOpen ? `${idx * 30}ms` : "0ms",
                          backgroundColor: contactHovered ? HOVER_ORANGE : BRAND.blue,
                          borderColor: contactHovered ? HOVER_ORANGE : BRAND.blue,
                          color: "#ffffff",
                        }}
                        className={cn(
                          "px-4 py-2 rounded-[10px] text-[0.84rem] whitespace-nowrap border-2 font-black transition-all duration-200",
                          desktopNavOpen ? "opacity-100 scale-100" : "opacity-0 scale-75"
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      style={{
                        transitionDelay: desktopNavOpen ? `${idx * 30}ms` : "0ms",
                        color: isActive ? HOVER_ORANGE : undefined,
                      }}
                      className={cn(
                        "px-3.5 py-2 text-[0.84rem] whitespace-nowrap bg-transparent border-2 border-transparent transition-all duration-200",
                        desktopNavOpen ? "opacity-100 scale-100" : "opacity-0 scale-75",
                        isActive ? "font-black" : "font-medium text-zinc-500 dark:text-zinc-400",
                        `hover:text-[${HOVER_ORANGE}]`
                      )}
                      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = HOVER_ORANGE }}
                      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "" }}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Controls — same acrylic glass treatment as the logo */}
          <div className={cn(
            glassPillClass, 
            "flex items-center gap-3 pl-3 pr-3 pointer-events-auto ml-4 transition-all duration-300",
            !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100"
          )}>
            <button 
              onClick={handleThemeToggle} 
              className="flex items-center justify-center w-7 h-7 active:scale-90 transition-transform" 
              aria-label="Toggle theme"
            >
              {mounted && (
                theme === "dark"
                  ? <Moon size={20} weight="fill" style={{ color: neutralColor }} className="transition-colors duration-300" />
                  : <Sun size={20} weight="fill" style={{ color: neutralColor }} className="transition-colors duration-300" />
              )}
            </button>

            <button 
              onClick={() => setMenuOpen(true)} 
              className={cn("flex items-center justify-center w-7 h-7 active:scale-90 md:hidden", menuOpen ? "opacity-0 pointer-events-none" : "opacity-100")}
            >
              <div className="w-4 h-[12px] flex flex-col justify-between items-center">
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: neutralColor }} />
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: neutralColor }} />
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: neutralColor }} />
              </div>
            </button>

            <button 
              onClick={() => setMenuOpen(false)} 
              className={cn("flex items-center justify-center w-7 h-7 active:scale-90 absolute right-3 md:hidden", menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
            >
              <X size={20} weight="bold" style={{ color: neutralColor }} className="transition-colors duration-300" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        pathname={pathname}
        navigate={navigate}
        neutralColor={neutralColor}
      />
    </>
  )
} 