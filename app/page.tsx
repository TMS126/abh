import { HeroSection } from "@/components/hero-section"
import { StripSection, CtaBar } from "@/components/strip-section"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="home" />
      <main className="pt-[68px]">
        <div className="animate-fade-up">
          <HeroSection />
          <StripSection />
          <CtaBar
            title="Ready to get started?"
            description="WhatsApp us or visit us in Kgotsong — we're always happy to help."
            buttonText="WhatsApp Us Now"
            buttonHref="https://wa.me/27753338260"
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
