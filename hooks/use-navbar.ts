"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function useNavVisibility() {
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > 80) {
        setNavVisible(y <= lastScrollY.current)
      } else {
        setNavVisible(true)
      }
      lastScrollY.current = y
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return navVisible
}

export function useMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return { menuOpen, setMenuOpen }
}

export function useLogoAnimation() {
  const [isTextExpanded, setIsTextExpanded] = useState(true)
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogoMouseEnter = useCallback(() => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    setIsTextExpanded(true)
  }, [])

  const handleLogoMouseLeave = useCallback(() => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 1200)
  }, [])

  useEffect(() => {
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 2670)
    return () => {
      if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    }
  }, [])

  return { isTextExpanded, handleLogoMouseEnter, handleLogoMouseLeave }
}
