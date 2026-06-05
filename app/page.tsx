"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StripSection, CtaBar } from "@/components/strip-section"
import { ServicesPage } from "@/components/services-page"
import { AboutPage } from "@/components/about-page"
import { GalleryPage } from "@/components/gallery-page"
import { ContactPage } from "@/components/contact-page"
import { Footer } from "@/components/footer"

type PageId = "home" | "services" | "about" | "gallery" | "contact"

const VALID_PAGES: PageId[] = ["home", "services", "about", "gallery", "contact"]

function isValidPage(p: string): p is PageId {
  return VALID_PAGES.includes(p as PageId)
}

export default function ApexbytesHub() {
  const [activePage, setActivePage] = useState<PageId>("home")

  // On first load, read the URL path and set the correct page
  useEffect(() => {
    const path = window.location.pathname.replace("/", "") || "home"
    if (isValidPage(path)) {
      setActivePage(path)
    }
    // Push initial state so the very first back press works correctly
    window.history.replaceState({ page: path }, "", window.location.pathname)
  }, [])

  // Listen for browser back/forward button
  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      const page = e.state?.page ?? "home"
      if (isValidPage(page)) {
        setActivePage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [])

  const handleNavigate = (page: string) => {
    if (!isValidPage(page)) return
    const url = page === "home" ? "/" : `/${page}`
    window.history.pushState({ page }, "", url)
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main className="pt-[68px]">
        {activePage === "home" && (
          <div className="animate-fade-up">
            <HeroSection onNavigate={handleNavigate} />
            <StripSection />
            <CtaBar
              title="Ready to get started?"
              description="WhatsApp us or visit us in Kgotsong — we're always happy to help."
              buttonText="WhatsApp Us Now"
              buttonHref="https://wa.me/27753338260"
            />
          </div>
        )}

        {activePage === "services" && (
          <>
            <ServicesPage onNavigate={handleNavigate} />
            <CtaBar
              title="Not sure what you need?"
              description="Just WhatsApp us and we'll guide you in the right direction."
              buttonText="Chat With Us"
              buttonHref="https://wa.me/27753338260"
            />
          </>
        )}

        {activePage === "about" && <AboutPage />}

        {activePage === "gallery" && <GalleryPage onNavigate={handleNavigate} />}

        {activePage === "contact" && <ContactPage />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
