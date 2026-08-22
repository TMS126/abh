// app/services/page.tsx
import { Suspense } from "react"
import { ServicesPage } from "@/components/services-page"
import { CtaBar } from "@/components/strip-section"
import { Navbar } from "@/components/navbar"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Services — ApexbytesHub",
  description: "Printing, documents, design, government services and tech support — all in one place.",
}

export default function ServicesRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div>
        <Suspense fallback={null}>
          <ServicesPage />
        </Suspense>
        <TestimonialsSection />
        <CtaBar
          title="Not sure what you need?"
          description="Just WhatsApp us and we'll guide you in the right direction."
          buttonText="Chat With Us"
          buttonHref="https://wa.me/27753338260"
        />
      </div>
      <Footer />
    </div>
  )
} 
