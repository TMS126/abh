import { ContactPage } from "@/components/contact-page"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Contact Us — Apexbytes Hub",
  description: "WhatsApp, call, email or visit us in Kgotsong. We're here to help.",
}

export default function ContactRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <ContactPage />
      </main>
      <Footer />
    </div>
  )
}
