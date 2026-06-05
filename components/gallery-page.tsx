"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  WhatsappLogo, 
  Printer, 
  FileText, 
  Palette, 
  Globe, 
  Cpu, 
  Sparkles, 
  Image as ImageIcon,
  X,
  ArrowRight,
  CaretLeft,
  CaretRight
} from "@phosphor-icons/react"

interface PortfolioItem {
  id: number
  title: string
  category: string
  description: string
  images: string[]
  clientName?: string
  dateCompleted?: string
  extendedDetails?: string
}

const CATEGORIES = [
  { id: "all", label: "All Work", icon: ImageIcon },
  { id: "print", label: "Print Hub", icon: Printer },
  { id: "document", label: "Document Hub", icon: FileText },
  { id: "design", label: "Design Hub", icon: Palette },
  { id: "eservice", label: "E-Service Hub", icon: Globe },
  { id: "tech", label: "Tech Hub", icon: Cpu },
]

const GALLERY_ITEMS: PortfolioItem[] = [
  {
    id: 1,
    title: "Apexbytes Hub Vector Branding Package",
    category: "design",
    description: "Premium vector corporate identity suite with custom letterheads and business cards.",
    images: [
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541462608141-ad4979e408c9?q=80&w=800&auto=format&fit=crop"
    ],
    clientName: "Internal Venture",
    dateCompleted: "February 2026",
    extendedDetails: "Designed exclusively using standard premium Adobe Illustrator software vectors. Showcases modern typography alignment coupled with our high-contrast Blue and Accent Orange theme layout structure."
  },
  {
    id: 2,
    title: "High-Volume Document & Photo Print Runs",
    category: "print",
    description: "Crisp black and white document collating alongside premium physical photo printing.",
    images: [
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512418490979-917959338e90?q=80&w=800&auto=format&fit=crop"
    ],
    clientName: "Kgotsong Community Project",
    dateCompleted: "March 2026",
    extendedDetails: "Features precise borderless printing calibrations on 220gsm gloss stock. Optimised for heavy-duty duplication output matching high-grade office print requirements."
  },
  {
    id: 3,
    title: "Professional Executive CV Layouts",
    category: "document",
    description: "Complete modern structural layout optimization and comprehensive application typing.",
    images: [
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603201667141-5a2d4c673378?q=80&w=800&auto=format&fit=crop"
    ],
    clientName: "Local Artisan Graduate",
    dateCompleted: "April 2026",
    extendedDetails: "A comprehensive structural text overhaul that modernises old certificates into readable, ATS-friendly corporate resumes. Clean grid margins built for professional visibility."
  },
  {
    id: 4,
    title: "Bespoke Social Celebration Invitations",
    category: "design",
    description: "Premium static layouts designed specifically for local social distribution.",
    images: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop"
    ],
    clientName: "Private Event Client",
    dateCompleted: "May 2026",
    extendedDetails: "Elegant invitation printing blending unique textures and background layers. Structured cleanly for digital messaging platforms or physical handout printing."
  },
  {
    id: 5,
    title: "OS System Optimization & Hardware Repairs",
    category: "tech",
    description: "Full clean system builds, storage tuning, and comprehensive virus mitigation.",
    images: [
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591405351990-4726e331f121?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop"
    ],
    clientName: "Home Office Workstation",
    dateCompleted: "May 2026",
    extendedDetails: "Complete workstation recovery routine including direct registry cleaning, thermal pasting application, and custom partition backups for enhanced local performance metrics."
  },
  {
    id: 6,
    title: "Portal Verification Direct Administrative Support",
    category: "eservice",
    description: "Accurate status checking and streamlined administrative documentation assistance.",
    images: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop"
    ],
    clientName: "Walk-in Resident Support",
    dateCompleted: "June 2026",
    extendedDetails: "Fast-tracked verification workflows enabling seamless processing and immediate status check reference slip printing for official application tracking."
  },
]

export function GalleryPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const filteredItems = activeTab === "all" 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeTab)

  const handleOpenModal = (item: PortfolioItem) => {
    setSelectedProject(item)
    setActiveImageIndex(0)
  }

  const handleNextImage = (e: React.MouseEvent, max: number) => {
    e.stopPropagation()
    setActiveImageIndex((prev) => (prev + 1) % max)
  }

  const handlePrevImage = (e: React.MouseEvent, max: number) => {
    e.stopPropagation()
    setActiveImageIndex((prev) => (prev - 1 + max) % max)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* BANNER */}
      <section className="bg-gradient-to-br from-[#1E6FA8] via-[#15537D] to-[#0F3F66] px-4 py-12 text-center relative overflow-hidden">
        <h1 className="font-sans font-black text-2xl text-white relative z-10">
          Gallery &amp; Portfolio
        </h1>
        <p className="text-[#A9D6F2] text-sm mt-2 relative z-10">
          Real work, real results — look through what we do every single day.
        </p>
      </section>

      {/* WORKSPACE */}
      <section className="px-4 py-10">
        <div className="max-w-[1200px] mx-auto">
          
          {/* ── CENTRALIZED PORTFOLIO VISUAL NOTICE BANNER ── */}
          <div className="w-full max-w-[1200px] mx-auto mb-10 p-5 rounded-[18px] bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left transition-colors duration-300 shadow-sm">
            <div className="w-10 h-10 rounded-[12px] bg-[#F4A261] text-white flex items-center justify-center shrink-0 shadow-sm font-sans font-black text-lg select-none">
              !
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-sm text-[#D9894B] dark:text-[#F9D1B0]">
                A Note on Our Portfolio Visuals
              </h4>
              <p className="text-muted-foreground text-[0.82rem] md:text-sm leading-relaxed">
                Please note that the showcase graphics, mockups, and layout workstation environments displayed below serve as our premium design benchmarks and upcoming studio expansion targets. Every print run, custom vector layout, and administrative document pack we compile is individually hand-crafted to meet these exact corporate precision and alignment standards using our agile home-based toolkit.
              </p>
            </div>
          </div>

          {/* Tabs — Only clicked tab shows brand Blue, others show clean Gray */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = activeTab === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-sans font-bold text-xs md:text-sm transition-all duration-200 active:scale-95 border ${
                    isActive
                      ? "bg-[#1E6FA8] border-[#0F3F66] text-white shadow-sm"
                      : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
                  }`}
                >
                  <Icon weight="fill" className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenModal(item)}
                className="group bg-card border-2 border-gray-200 dark:border-zinc-800 rounded-[18px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 left-3 z-20 text-[0.62rem] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md bg-white/90 dark:bg-black/90 text-foreground shadow-sm">
                    {item.category === "eservice" ? "E-Service" : item.category.charAt(0).toUpperCase() + item.category.slice(1)} Hub
                  </span>
                </div>

                <div className="p-5 flex flex-col grow">
                  <h4 className="font-sans font-black text-foreground text-[0.98rem] leading-snug mb-1.5 group-hover:text-[#1E6FA8] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-[0.82rem] leading-relaxed line-clamp-2 grow mb-4">
                    {item.description}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E6FA8]">
                    View Images ({item.images.length}) <ArrowRight size={14} weight="bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-12 pt-6 border-t border-gray-200 dark:border-zinc-800">
            <button
              onClick={() => handleNavigate("/contact")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[28px] font-sans font-extrabold text-[0.92rem] bg-[#25D366] text-white hover:bg-[#1ebe5a] active:scale-95 transition-all"
            >
              <WhatsappLogo weight="fill" className="w-5 h-5" /> Ask Us on WhatsApp
            </button>
          </div>

        </div>
      </section>

      {/* POPUP MODAL */}
      {selectedProject && (
        <div 
          onClick={() => setSelectedProject(null)}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div 
            className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 w-full max-w-2xl rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 dark:bg-black/90 text-foreground shadow-md"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="overflow-y-auto w-full">
              {/* Image Carousel Display Area */}
              <div className="w-full aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 relative select-none">
                <img 
                  src={selectedProject.images[activeImageIndex]} 
                  alt="Gallery content" 
                  className="w-full h-full object-cover"
                />

                {selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => handlePrevImage(e, selectedProject.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-black/90 text-foreground shadow-md"
                    >
                      <CaretLeft size={18} weight="bold" />
                    </button>
                    <button
                      onClick={(e) => handleNextImage(e, selectedProject.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-black/90 text-foreground shadow-md"
                    >
                      <CaretRight size={18} weight="bold" />
                    </button>
                  </>
                )}

                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                  {selectedProject.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activeImageIndex ? "w-5 bg-[#1E6FA8]" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Info Text Meta Details Area */}
              <div className="p-6">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#A9D6F2]/40 text-[#15537D] dark:text-[#A9D6F2] font-sans font-extrabold text-[0.65rem] tracking-wider uppercase mb-2">
                  {selectedProject.category === "eservice" ? "E-Service" : selectedProject.category.toUpperCase()} HUB PROJECT
                </span>
                
                <h3 className="font-sans font-black text-foreground text-lg md:text-xl mb-3">
                  {selectedProject.title}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Client Segment</p>
                    <p className="text-xs font-black text-foreground">{selectedProject.clientName || "Community Member"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Completion Date</p>
                    <p className="text-xs font-black text-foreground">{selectedProject.dateCompleted || "2026 Q2"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h5 className="font-sans font-black text-xs uppercase tracking-wider text-[#1E6FA8]">Technical Overview</h5>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {selectedProject.extendedDetails}
                    </p>
                  </div>

                  <hr className="border-gray-100 dark:border-zinc-800" />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://wa.me/27753338260"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white font-sans font-black text-xs uppercase tracking-widest hover:bg-[#1ebe5a] transition-all"
                    >
                      <WhatsappLogo weight="fill" size={18} /> Request Similar Job
                    </a>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="px-8 py-3.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-foreground font-sans font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
