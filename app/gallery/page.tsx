import { GalleryPage } from "@/components/gallery-page"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Portfolio — ApexbytesHub",
  description: "Real clients', sample and practice projects from ApexbytesHub and real clients across all five hubs.",
}

export default function GalleryRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <GalleryPage />
      </main>
      <Footer />
    </div>
  )
}
