"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CtaBar } from "@/components/strip-section"
import { ServicesPage } from "@/components/services-page" // Adjust this name to match the file name in your components folder

export default function ServicesRoute() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Global Navigation Layout */}
      <Navbar activePage="services" />
      
      {/* 2. Your Original Interactive Hub Component */}
      <main className="pt-[68px]">
        <ServicesPage onNavigate={(page: string) => router.push(`/${page}`)} />
      </main>

      {/* 3. Floating Action Banner */}
      <CtaBar
        title="Not sure what you need?"
        description="Just WhatsApp us and we'll guide you in the right direction."
        buttonText="Chat With Us"
        buttonHref="https://wa.me/27753338260"
      />

      {/* 4. Global Brand Footer */}
      <Footer />
    </div>
  )
}
