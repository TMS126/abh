import { Navbar } from "@/components/navbar"
import { HeroSection, StatsBar } from "@/components/hero-section"
import { StripSection, CtaBar } from "@/components/strip-section"
import { Footer } from "@/components/footer"
import { BIZ } from "@/lib/brand"

export default function HomeRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <div className="animate-fade-up">
          <HeroSection />
          <StatsBar />
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
