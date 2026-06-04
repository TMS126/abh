"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StripSection, CtaBar } from "@/components/strip-section"
import { ServicesPage } from "@/components/services-page"
import { AboutPage } from "@/components/about-page"
import { GalleryPage } from "@/components/gallery-page"
import { ContactPage } from "@/components/contact-page"
import { Footer } from "@/components/footer"

type PageId = "home" | "services" | "about" | "gallery" | "contact"

export default function ApexbytesHub() {
  const [activePage, setActivePage] = useState<PageId>("home")

  const handleNavigate = (page: string) => {
    setActivePage(page as PageId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage={activePage} onNavigate={handleNavigate} />
      
      {/* Main content area with padding for fixed navbar */}
      <main className="pt-[68px]">
        {/* Home Page */}
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

        {/* Services Page */}
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

        {/* About Page */}
        {activePage === "about" && <AboutPage />}

        {/* Gallery Page */}
        {activePage === "gallery" && <GalleryPage onNavigate={handleNavigate} />}

        {/* Contact Page */}
        {activePage === "contact" && <ContactPage />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
