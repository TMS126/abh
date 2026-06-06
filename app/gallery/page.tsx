"use client"

import { useRouter } from "next/navigation"
import { GalleryPage } from "@/components/gallery-page"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function GalleryRoute() {
  const router = useRouter()

  const handleNavigate = (page: string) => {
    router.push(page === "home" ? "/" : `/${page}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar activePage="gallery" />
      <main className="pt-[68px]">
        <GalleryPage onNavigate={handleNavigate} />
      </main>
      <Footer />
    </div>
  )
}
