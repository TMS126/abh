"use client"


// All nav buttons — add to className:
"transition-all duration-200 ease-in-out active:scale-95"
import { useState } from "react"
import { useTheme } from "next-themes"
import { X } from "lucide-react"
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

  const handleNavigate = (page: string) => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Immersive fullscreen mobile menu */}
      <div 
        className={cn(
          "fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-300 md:hidden",
          mobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Blur background */}
        <div 
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-5 right-5 w-12 h-12 rounded-full bg-secondary flex items-center justify-center z-10 hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>
        
        {/* Centered navigation links */}
        <nav className="relative z-10 flex flex-col items-center gap-4 px-8 w-full max-w-sm">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "w-full py-4 px-8 rounded-2xl font-sans font-bold text-lg transition-all duration-300",
                mobileMenuOpen 
                  ? "translate-y-0 opacity-100" 
                  : "translate-y-4 opacity-0",
                item.isCta
                  ? "bg-[#F4A261] text-white hover:bg-[#D9894B]"
                  : activePage === item.id
                    ? "bg-blue-1 text-white"
                    : "bg-secondary text-foreground hover:bg-muted"
              )}
              style={{ 
                transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms' 
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
              transitionDelay: mobileMenuOpen ? `${navItems.length * 50}ms` : '0ms' 
            }}
          >
            <span className="text-muted-foreground text-sm font-medium">Theme</span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-14 h-8 rounded-full relative transition-colors duration-300 flex items-center p-1",
                theme === "dark" ? "bg-blue-1" : "bg-border"
              )}
            >
              <span 
                className={cn(
                  "w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center text-xs",
                  theme === "dark" ? "translate-x-6" : "translate-x-0"
                )}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </span>
            </button>
          </div>
        </nav>
      </div>
      
      <nav className="fixed top-0 left-0 right-0 h-[68px] bg-[var(--nav-bg)] backdrop-blur-[10px] shadow-[0_2px_24px_rgba(30,111,168,0.09)] z-[9999] flex items-center justify-between px-4 md:px-6 transition-colors duration-300">
        {/* Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => handleNavigate("home")}
        >
          <div className="w-[50px] h-[50px] rounded-xl bg-gradient-to-br from-blue-3 to-blue-1 flex items-center justify-center shadow-[0_3px_12px_rgba(30,111,168,0.35)] dark:from-[#1A2C3E] dark:to-[#243648] dark:shadow-[0_3px_12px_rgba(0,0,0,0.4)]">
            <span className="text-2xl brightness-[3] contrast-[1.2] saturate-[0.3] dark:brightness-[4] dark:contrast-100 dark:saturate-0">🖨️</span>
          </div>
          <div className="font-sans font-black text-[1.25rem] leading-none tracking-tight">
            <span className="text-[#1E6FA8] dark:text-[#7EC8F0]">Apexbytes</span>
            <span className="text-[#6FBF1A] dark:text-[#A8E05A]">Hub</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <ul className="flex gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "px-4 py-2 rounded-[22px] font-sans font-bold text-[0.86rem] transition-all duration-250",
                    item.isCta
                      ? "bg-[#F4A261] text-white hover:bg-[#D9894B]"
                      : activePage === item.id
                        ? "bg-blue-1 text-white"
                        : "text-muted-foreground hover:bg-secondary hover:text-blue-1"
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Theme toggle */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm">
              {theme === "dark" ? "🌙" : "☀️"}
            </span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-[42px] h-[24px] rounded-full relative transition-colors duration-300 flex items-center p-[2px]",
                theme === "dark" ? "bg-blue-1" : "bg-border"
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

        {/* Mobile menu button (hamburger) */}
        <div className="flex md:hidden items-center gap-3">
          <span className="text-sm">
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "w-[42px] h-[24px] rounded-full relative transition-colors duration-300 flex items-center p-[2px]",
              theme === "dark" ? "bg-blue-1" : "bg-border"
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
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col gap-[5px] p-1"
          >
            <span className="block w-6 h-[2.5px] bg-blue-1 rounded-sm transition-all" />
            <span className="block w-6 h-[2.5px] bg-blue-1 rounded-sm transition-all" />
            <span className="block w-6 h-[2.5px] bg-blue-1 rounded-sm transition-all" />
          </button>
        </div>
      </nav>
    </>
  )
}
