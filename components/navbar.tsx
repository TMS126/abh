import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { X, MessageCircle, Sun, Moon } from "@phosphor-icons/react"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  // Scroll state
  const [scrolled, setScrolled] = useState(false)       // true = past threshold
  const [navVisible, setNavVisible] = useState(true)    // desktop: hide on scroll down
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const goingDown = y > lastScrollY.current

      setScrolled(y > 20)

      // Desktop: hide bar when scrolling down past 80px, show when scrolling up
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
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* ── Immersive fullscreen mobile menu ── */}
      <div
        className={cn(
          "fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-300 md:hidden",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Blurred background — adapts to page bg */}
        <div
          className="absolute inset-0 backdrop-blur-2xl"
          style={{
            background: "rgba(10, 26, 46, 0.92)",
          }}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center z-10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Centered navigation links */}
        <nav className="relative z-10 flex flex-col items-center gap-4 px-8 w-full max-w-sm">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "w-full py-4 px-8 rounded-2xl font-sans font-bold text-lg transition-all duration-300 active:scale-95",
                mobileMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
                item.isCta
                  ? "bg-[#F4A261] text-white hover:bg-[#D9894B]"
                  : activePage === item.id
                    ? "bg-[#1E6FA8] text-white"
                    : "bg-white/10 border border-white/15 text-white hover:bg-white/20"
              )}
              style={{
                transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
              }}
            >
              {item.label}
            </button>
          ))}

          {/* Theme toggle in mobile menu */}
          <div
            className={cn(
              "flex items-center gap-4 mt-6 transition-all duration-300",
              mobileMenuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
            style={{
              transitionDelay: mobileMenuOpen
                ? `${navItems.length * 50}ms`
                : "0ms",
            }}
          >
            <span className="text-white/60 text-sm font-medium">Theme</span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-14 h-8 rounded-full relative transition-colors duration-300 flex items-center p-1",
                theme === "dark" ? "bg-[#1E6FA8]" : "bg-white/30"
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center text-xs",
                  theme === "dark" ? "translate-x-6" : "translate-x-0"
                )}
              >
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* ── Main navbar ── */}
      <nav
        className={cn(
          // Base layout
          "fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-4 md:px-6 transition-all duration-300",
          // Height: normal when visible, shrink when hiding
          "h-[68px]",
          // Blur & bg intensity scales with scroll
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-[0_2px_24px_rgba(30,111,168,0.12)]"
            : "bg-background/40 backdrop-blur-md",
          // Desktop hide/show on scroll
          "md:transition-transform md:duration-300",
          !navVisible && "md:-translate-y-full"
        )}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => handleNavigate("home")}
        >
          <div className="font-sans font-black text-[1.25rem] leading-none tracking-tight">
            <span className="text-[#1E6FA8] dark:text-[#7EC8F0]">Apexbytes</span>
            <span className="text-[#6FBF1A] dark:text-[#A8E05A]">Hub</span>
          </div>
        </div>

        {/* ── Desktop Navigation ── */}
        <div className="hidden md:flex items-center gap-2">
          <ul className="flex gap-1">
            {navItems.map((item) =>
              item.isCta ? (
                // When nav is hidden, this stays as icon; when visible, full label
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.id)}
                    title="Contact Us"
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-full font-sans font-bold text-[0.86rem] transition-all duration-200 ease-in-out active:scale-95",
                      // When scrolled hidden: icon-only circle
                      !navVisible
                        ? "w-10 h-10 bg-[#F4A261] hover:bg-[#D9894B] text-white"
                        : "px-4 py-2 bg-[#F4A261] hover:bg-[#D9894B] text-white"
                    )}
                  >
                    {navVisible ? (
                      "Contact Us"
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                  </button>
                </li>
              ) : (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      "px-4 py-2 rounded-[22px] font-sans font-bold text-[0.86rem] transition-all duration-200 active:scale-95",
                      activePage === item.id
                        ? "bg-[#1E6FA8] text-white"
                        : "text-muted-foreground hover:bg-secondary hover:text-[#1E6FA8]"
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              )
            )}
          </ul>

          {/* Theme toggle */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm">
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-[42px] h-[24px] rounded-full relative transition-colors duration-300 flex items-center p-[2px]",
                theme === "dark" ? "bg-[#1E6FA8]" : "bg-border"
              )}
              aria-label="Toggle dark mode"
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300",
                  theme === "dark" ? "translate-x-[18px]" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* ── Mobile controls ── */}
        <div className="flex md:hidden items-center gap-3">
          <span className="text-sm">
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          </span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "w-[42px] h-[24px] rounded-full relative transition-colors duration-300 flex items-center p-[2px]",
              theme === "dark" ? "bg-[#1E6FA8]" : "bg-border"
            )}
            aria-label="Toggle dark mode"
          >
            <span
              className={cn(
                "w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300",
                theme === "dark" ? "translate-x-[18px]" : "translate-x-0"
              )}
            />
          </button>
          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col gap-[5px] p-1"
            aria-label="Open menu"
          >
            <span className="block w-6 h-[2.5px] bg-[#1E6FA8] rounded-sm" />
            <span className="block w-6 h-[2.5px] bg-[#1E6FA8] rounded-sm" />
            <span className="block w-6 h-[2.5px] bg-[#1E6FA8] rounded-sm" />
          </button>
        </div>
      </nav>

      {/* ── Floating Contact icon — desktop only, appears when nav is hidden ── */}
      <div
        className={cn(
          "fixed top-4 right-4 z-[9998] hidden md:flex transition-all duration-300",
          !navVisible && scrolled
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <button
          onClick={() => handleNavigate("contact")}
          title="Contact Us"
          className="w-11 h-11 rounded-full bg-[#F4A261] hover:bg-[#D9894B] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(244,162,97,0.5)] active:scale-95 transition-all duration-200"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </>
  )
} 
