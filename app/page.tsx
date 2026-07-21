import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StatsBar } from "@/components/stats-bar"
import { TestimonialsSection } from "@/components/testimonials-section"
import { StripSection, CtaBar } from "@/components/strip-section"
import { Footer } from "@/components/footer"
import { BIZ } from "@/lib/brand"
import PricingPage from '@/components/pricing-page'

export default function Page() {
  return <PricingPage />
}
export default function HomeRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <div className="animate-fade-up">
          <HeroSection />
          <StatsBar />
          <TestimonialsSection />
          <StripSection />
          <CtaBar
            title="Ready to get started?"
            description={`WhatsApp us or visit us in ${BIZ.location} — we're always happy to help.`}
            buttonText="WhatsApp Us Now"
            buttonHref={`https://wa.me/${BIZ.phoneE164.replace("+", "")}`}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
