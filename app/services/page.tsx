"use client"

import { useRouter } from "next/navigation"
import { ServicesPage } from "@/components/services-page"
import { CtaBar } from "@/components/strip-section"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ServicesRoute() {
  const router = useRouter()

  const handleNavigate = (page: string) => {
    router.push(`/${page === "home" ? "" : page}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="services" onNavigate={handleNavigate} />
      <main className="pt-[68px]">
        <ServicesPage onNavigate={handleNavigate} />
        <CtaBar
          title="Not sure what you need?"
          description="Just WhatsApp us and we'll guide you in the right direction."
          buttonText="Chat With Us"
          buttonHref="https://wa.me/27753338260"
        />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
