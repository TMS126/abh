import { ServicesPage } from "@/components/services-page"
import { CtaBar } from "@/components/strip-section"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Our Services — Apexbytes Hub",
  description: "Five hubs, 50+ services. Print, Document, Design, E-Service and Tech Hub all in one place in Kgotsong.",
}

export default function ServicesRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="services" />
      <main className="pt-[68px]">
        <ServicesPage />
        <CtaBar
          title="Not sure what you need?"
          description="Just WhatsApp us and we'll guide you in the right direction."
          buttonText="Chat With Us"
          buttonHref="https://wa.me/27753338260"
        />
      </main>
      <Footer />
    </div>
  )
}
