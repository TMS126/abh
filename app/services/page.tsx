"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ServicesPage } from "@/components/services-page" 

export default function ServicesRoute() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Global Layout Top Navigation Bar */}
      <Navbar activePage="services" />
      
      {/* 2. Your Native Interactive Grid Viewport (Pop-ups, Accordions, and Modals) */}
      <main className="pt-[68px]">
        <ServicesPage onNavigate={(page: string) => router.push(`/${page}`)} />
      </main>

      {/* 3. Global Layout Brand Footer */}
      <Footer />
    </div>
  )
}
