import GalleryPage from "@/components/gallery-page"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Portfolio — Apexbytes Hub",
  description: "Real projects from real clients across all five hubs.",
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
