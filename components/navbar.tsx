"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { X, Sun, Moon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  activePage: string
  onNavigate: (page: string) => void
}

const navItems = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "about", label: "About Us" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact Us", isCta: true },
]

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  // Scroll tracking visibility states
  const [scrolled, setScrolled] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const goingDown = y > lastScrollY.current

      setScrolled(y > 20)

      if (y > 80) {
        setNavVisible(!goingDown)
      } else {
        setNavVisible(true)
      }

      lastScrollY.current = y
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavigate = (page: string) => {
    onNavigate(page)
    setMenuOpen(false)
  }

  return (
    <>
      {/* ── 1. FIXED CONTENT INTERFACE HEADER ── */}
      <div
        className={cn(
          "fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 transition-all duration-300 h-[74px] items-center pointer-events-none",
          !navVisible && !menuOpen && "-translate-y-full"
        )}
      >
        <div className="flex items-center justify-between w-full max-w-[1200px]">
          {/* Left Block: Elite Clean Brand Architecture */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none pointer-events-auto bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-sm"
            onClick={() => handleNavigate("home")}
          >
            <div className="font-sans font-black text-[1.15rem] leading-none tracking-tight">
              <span className="text-[#1E6FA8] dark:text-[#7EC8F0]">Apexbytes</span>
              <span className="text-[#6FBF1A] dark:text-[#A8E05A]">Hub</span>
            </div>
          </div>

          {/* Right Block: Controls Cluster Panel */}
          <div className="flex items-center gap-3 pointer-events-auto ml-auto">
            {/* Smooth Theme Switching Module */}
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 shadow-sm h-11">
              <span className="text-muted-foreground">
                {theme === "dark" ? <Moon size={14} weight="bold" /> : <Sun size={14} weight="bold" />}
              </span>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "w-[36px] h-[18px] rounded-full relative transition-colors duration-300 flex items-center p-[2px]",
                  theme === "dark" ? "bg-[#1E6FA8]" : "bg-border"
                )}
                aria-label="Toggle Theme Mode"
              >
                <span
                  className={cn(
                    "w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-300",
                    theme === "dark" ? "translate-x-[16px]" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* High-Contrast Standout Horizontal Hamburger Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "w-11 h-11 rounded-full flex flex-col items-center justify-center gap-[4.5px] transition-all duration-300 active:scale-95 border shadow-[0_4px_14px_rgba(244,162,97,0.35)]",
                menuOpen
                  ? "bg-[#1E6FA8] border-[#0f3f66] text-white rotate-90"
                  : "bg-[#F4A261] border-[#D9894B] text-white hover:bg-[#D9894B]"
              )}
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? (
                <X weight="bold" className="w-4 h-4 -rotate-90" />
              ) : (
                <>
                  <span className="block w-5 h-[2.5px] bg-white rounded-full" />
                  <span className="block w-5 h-[2.5px] bg-white rounded-full" />
                  <span className="block w-5 h-[2.5px] bg-white rounded-full" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. FULLSCREEN OVERLAY COMPONENT INTERFACE ── */}
      <div
        className={cn(
          "fixed inset-0 z-[9998] flex flex-col items-center justify-between py-12 px-6 transition-all duration-300",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Dynamic Contextual Layer Backdrop Blur */}
        <div
          className="absolute inset-0 backdrop-blur-2xl transition-opacity duration-300"
          style={{
            background: theme === "dark" ? "rgba(10, 26, 46, 0.97)" : "rgba(255, 255, 255, 0.97)",
          }}
          onClick={() => setMenuOpen(false)}
        />

        {/* Header Spacer layout clear */}
        <div className="h-[70px] w-full shrink-0" />

        {/* Global Navigation Hub Link Wrappers */}
        <nav className="relative z-10 w-full max-w-[1000px] flex flex-col items-center justify-center grow">
          <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-4 w-full">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "py-4 px-8 md:py-3 md:px-6 rounded-2xl font-sans font-black text-lg md:text-base transition-all duration-300 active:scale-95 text-center shrink-0",
                  "w-full md:w-auto",
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  item.isCta
                    ? "bg-[#F4A261] text-white hover:bg-[#D9894B] shadow-[0_4px_14px_rgba(244,162,97,0.3)]"
                    : activePage === item.id
                      ? "bg-[#1E6FA8] text-white"
                      : "bg-secondary border border-border/40 text-foreground hover:bg-muted"
                )}
                style={{
                  transitionDelay: menuOpen ? `${index * 40}ms` : "0ms",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Modern Minimal Signature Brand Placement */}
        <div
          className={cn(
            "relative z-10 text-center select-none transition-all duration-500 transform mt-8 shrink-0",
            menuOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
          )}
          style={{ transitionDelay: menuOpen ? `${navItems.length * 40 + 60}ms` : "0ms" }}
        >
          <div className="font-sans font-black text-lg tracking-tight inline-flex items-center gap-1.5">
            <span className="text-[#1E6FA8] dark:text-[#A9D6F2]">Apexbytes</span>
            <span className="text-[#6FBF1A] dark:text-[#CDEB9F]">Hub</span>
          </div>
          <p className="text-[#777777] dark:text-[#9A9A9A] text-[0.72rem] font-medium tracking-wide mt-1 uppercase">
            Your local tech &amp; print partner in Kgotsong
          </p>
        </div>
      </div>
    </>
  )
}
