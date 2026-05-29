"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Menu, X, Sun, Moon } from "lucide-react"
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
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <nav className="fixed top-0 left-0 right-0 h-[68px] bg-[var(--nav-bg)] backdrop-blur-[10px] shadow-[0_2px_24px_rgba(30,111,168,0.09)] z-[9999] flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => handleNavigate("home")}
        >
          <div className="flex flex-col">
            <span className="font-sans font-black text-[1.1rem] tracking-tight bg-gradient-to-r from-blue-1 to-green-1 bg-clip-text text-transparent dark:from-blue-4 dark:to-green-4">
              ApexbytesHub
            </span>
            <span className="text-green-1 dark:text-green-4 text-[0.65rem] -mt-1 tracking-wider font-semibold">
              Digital Solutions
            </span>
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
                      ? "bg-wa-green text-white hover:bg-[#1ebe5a]"
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

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-blue-1" />
            ) : (
              <Menu className="w-6 h-6 text-blue-1" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-[68px] left-0 right-0 bg-[var(--nav-bg)] p-6 md:hidden z-[9997] flex flex-col gap-3 max-h-[calc(100vh-68px)] overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "w-full py-3 px-6 rounded-[14px] font-sans font-bold text-[0.86rem] transition-all duration-250 text-center",
                  item.isCta
                    ? "bg-wa-green text-white"
                    : activePage === item.id
                      ? "bg-blue-1 text-white"
                      : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}
