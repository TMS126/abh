import { AboutPage } from "@/components/about-page"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "About Us — Apexbytes Hub",
  description: "A local business built on community, trust, and real results.",
}

export default function AboutRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="about" />
      <main className="pt-[68px]">
        <AboutPage />
      </main>
      <Footer />
    </div>
  )
}
