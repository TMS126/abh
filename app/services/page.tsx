"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ServicesPage } from "@/components/services-page"

export default function ServicesRoute() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Global Navigation Bar */}
      <Navbar activePage="services" />
      
      {/* 2. Interactive Service Cards, Modals, and Accordions */}
      <main className="pt-[68px]">
        <ServicesPage onNavigate={(page) => router.push(`/${page}`)} />
      </main>

      {/* 3. Global Brand Footer */}
      <Footer />
    </div>
  )
}
