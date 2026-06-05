import { GalleryPage } from "@/components/gallery-page"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Gallery & Portfolio — Apexbytes Hub",
  description: "Real work, real results. Browse our print, design, document, and studio work.",
}

export default function GalleryRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="gallery" />
      <main className="pt-[68px]">
        <GalleryPage />
      </main>
      <Footer />
    </div>
  )
}
