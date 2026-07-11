import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PrivacyPage } from "@/components/privacy-page"

export const metadata = {
  title:       "Privacy Policy — ApexbytesHub",
  description: "How Apexbytes Hub collects, uses, and protects your personal information in accordance with POPIA.",
}

export default function PrivacyRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <PrivacyPage />
      </main>
      <Footer />
    </div>
  )
}
