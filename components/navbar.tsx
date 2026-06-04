"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { X, Sun, Moon } from "@phosphor-icons/react"

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
      {/* ── 1. FIXED TOP ACTIONS HEADER BAR ── */}
      <div
        className={`fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 transition-all duration-300 h-[74px] items-center pointer-events-none ${
          !navVisible && !menuOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between w-full max-w-[1200px]">
          {/* Logo container block */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none pointer-events-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-800 shadow-sm"
            onClick={() => handleNavigate("home")}
          >
            <div className="font-sans font-black text-[1.15rem] leading-none tracking-tight">
              <span className="text-[#1E6FA8] dark:text-[#A9D6F2]">Apexbytes</span>
              <span className="text-[#6FBF1A] dark:text-[#CDEB9F]">Hub</span>
            </div>
          </div>

          {/* Right Action Widgets Control Station */}
          <div className="flex items-center gap-3 pointer-events-auto ml-auto">
            {/* Theme Toggle Module */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 shadow-sm h-11">
              <span className="text-gray-500 dark:text-zinc-400">
                {theme === "dark" ? <Moon size={14} weight="bold" /> : <Sun size={14} weight="bold" />}
              </span>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`w-[36px] h-[18px] rounded-full relative transition-colors duration-300 flex items-center p-[2px] ${
                  theme === "dark" ? "bg-[#1E6FA8]" : "bg-gray-300 dark:bg-zinc-700"
                }`}
                aria-label="Toggle Theme Mode"
              >
                <span
                  className={`w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    theme === "dark" ? "translate-x-[16px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Menu Trigger Hamburger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`w-11 h-11 rounded-full flex flex-col items-center justify-center gap-[4.5px] transition-all duration-300 active:scale-95 border shadow-sm ${
                menuOpen
                  ? "bg-[#1E6FA8] border-[#0f3f66] text-white rotate-90"
                  : "bg-[#F4A261] border-[#D9894B] text-white hover:bg-[#D9894B]"
              }`}
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

      {/* ── 2. FULLSCREEN BALANCED GLASS BLUR OVERLAY ── */}
      <div
        className={`fixed inset-0 z-[9998] flex flex-col items-center justify-between py-12 px-6 transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Balanced background layer glass blur factor to keep background layout text visible */}
        <div
          className="absolute inset-0 backdrop-blur-md transition-opacity duration-300"
          style={{
            background: theme === "dark" ? "rgba(10, 26, 46, 0.88)" : "rgba(255, 255, 255, 0.88)",
          }}
          onClick={() => setMenuOpen(false)}
        />

        {/* Clear spacer height header offset */}
        <div className="h-[80px] w-full shrink-0" />

        {/* Links Navigation Matrix (Aligned higher on desktop viewports) */}
        <nav className="relative z-10 w-full max-w-[540px] flex flex-col items-center justify-center md:justify-start md:pt-16 grow">
          
          {/* THE ROUNDED SQUARE LINK HOUSE CONTEXT */}
          <div 
            className={`w-full p-6 md:p-8 rounded-[24px] bg-white/90 dark:bg-zinc-900/95 border border-gray-200 dark:border-zinc-800 shadow-xl transition-all duration-300 scale-95 flex flex-col gap-3 ${
              menuOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`py-3.5 px-6 rounded-[16px] font-sans font-black text-base transition-all duration-200 active:scale-97 text-center w-full transform-gpu ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                } ${
                  item.isCta
                    ? "bg-[#F4A261] text-white hover:bg-[#D9894B]"
                    : activePage === item.id
                      ? "bg-[#1E6FA8] text-white"
                      : "bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                }`}
                style={{
                  transitionDelay: menuOpen ? `${index * 35}ms` : "0ms",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

        </nav>

        {/* ── MONOCHROMATIC SUB-LABEL BRAND FOOTER AREA ── */}
        <div
          className={`relative z-10 text-center select-none transition-all duration-500 transform mt-8 shrink-0 ${
            menuOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
          }`}
          style={{ transitionDelay: menuOpen ? `${navItems.length * 35 + 55}ms` : "0ms" }}
        >
          {/* Symmetrical smaller monochrome typographic title representation */}
          <div className="font-sans font-black text-sm tracking-tight text-gray-800 dark:text-zinc-200 uppercase">
            ApexbytesHub
          </div>
          {/* Custom localized structural signature */}
          <p className="text-gray-400 dark:text-zinc-500 text-[0.7rem] font-bold tracking-widest mt-1 uppercase">
            founded by Theji M
          </p>
        </div>

      </div>
    </>
  )
}
