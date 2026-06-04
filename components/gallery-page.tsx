"use client"

import { useState } from "react"
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
import { cn } from "@/lib/utils"

interface GalleryPageProps {
  onNavigate: (page: string) => void
}

interface PortfolioItem {
  id: number
  title: string
  category: string
  description: string
  // Array of live online images for the slider popup modal workspace
  images: string[]
  clientName?: string
  dateCompleted?: string
  extendedDetails?: string
}

// Complete category registry mapped to Apexbytes Hub service divisions
const CATEGORIES = [
  { id: "all", label: "All Work", icon: ImageIcon },
  { id: "print", label: "Print Hub", icon: Printer },
  { id: "document", label: "Document Hub", icon: FileText },
  { id: "design", label: "Design Hub", icon: Palette },
  { id: "eservice", label: "E-Service Hub", icon: Globe },
  { id: "tech", label: "Tech Hub", icon: Cpu },
]

// Portfolio Items populated with direct online web links to show immediately on mobile
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

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Filter computation logic
  const filteredItems = activeTab === "all" 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeTab)

  const handleOpenModal = (item: PortfolioItem) => {
    setSelectedProject(item)
    setActiveImageIndex(0) // Reset back to the first screenshot index
  }

  const handleNextImage = (e: React.MouseEvent, max: number) => {
    e.stopPropagation()
    setActiveImageIndex((prev) => (prev + 1) % max)
  }

  const handlePrevImage = (e: React.MouseEvent, max: number) => {
    e.stopPropagation()
    setActiveImageIndex((prev) => (prev - 1 + max) % max)
  }

  return (
    <div className="animate-fade-up min-h-screen bg-background">
      {/* ── HERO BANNER SECTION ── */}
      <section className="bg-gradient-to-br from-[#1E6FA8] via-[#15537D] to-[#0F3F66] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.18)_0%,transparent_70%)] rounded-full" />
        <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">
          Gallery &amp; Portfolio
        </h1>
        <p className="text-[#A9D6F2] text-sm md:text-base mt-2 relative z-10 max-w-md mx-auto">
          Real work, real people, real results
        </p>
      </section>

      {/* ── WORKSPACE DISPLAY CONTAINER ── */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Section Heading Label */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 bg-[#CDEB9F] text-[#3E6B0E] dark:bg-[#1A3010] dark:text-[#A8E05A] px-4 py-1.5 rounded-[20px] text-[0.78rem] font-bold font-sans tracking-wider mb-3">
              <Sparkles weight="fill" className="w-3.5 h-3.5" /> LIVE WORKS MATRIX
            </span>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#1E6FA8] dark:text-[#A9D6F2] mb-3">
              Our Work Speaks for Itself
            </h2>
            <p className="text-muted-foreground text-[0.92rem] leading-relaxed max-w-[560px] mx-auto">
              Explore our verified project tracks below. Click on any image card to see detailed multi-angle work photography.
            </p>
          </div>

          {/* Tab Filter Controls Block — ONLY clicked tab lights up branded Blue */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = activeTab === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-sans font-bold text-xs md:text-sm transition-all duration-200 active:scale-95 border",
                    isActive
                      ? "bg-[#1E6FA8] border-[#0F3F66] text-white shadow-sm" // Apexbytes Hub Branded Blue
                      : "bg-secondary/40 border-border/40 text-muted-foreground/80 hover:bg-secondary hover:text-foreground" // Clean neutral gray
                  )}
                >
                  <Icon weight="fill" className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Interactive Photo Grid Framework */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenModal(item)}
                className="group bg-card border-2 border-border/40 rounded-[18px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer"
              >
                {/* Visual Real Photo Thumbnail Box */}
                <div className="aspect-[4/3] bg-muted relative overflow-hidden select-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1E6FA8]/10 to-transparent z-10 pointer-events-none" />
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute bottom-3 left-3 z-20 text-[0.62rem] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md bg-background/90 text-foreground border border-border/50 backdrop-blur-sm">
                    {item.category.replace("eservice", "E-Service")} Hub
                  </span>
                </div>

                {/* Metadata Description Content Area */}
                <div className="p-5 flex flex-col grow">
                  <h4 className="font-sans font-black text-foreground text-[0.98rem] leading-snug mb-1.5 group-hover:text-[#1E6FA8] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-[0.82rem] leading-relaxed line-clamp-2 grow mb-4">
                    {item.description}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E6FA8] dark:text-[#A9D6F2] mt-auto">
                    View Project Images ({item.images.length}) <ArrowRight size={14} weight="bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Fallback */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-border/40 rounded-[22px] max-w-sm mx-auto">
              <p className="text-muted-foreground text-sm font-semibold">No entries uploaded in this segment.</p>
            </div>
          )}

          {/* Call To Action Block Footer */}
          <div className="text-center mt-12 pt-6 border-t border-border/40">
            <p className="text-muted-foreground text-[0.88rem] mb-4">Want to see physical print proofs before ordering?</p>
            <button
              onClick={() => onNavigate("contact")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[28px] font-sans font-extrabold text-[0.92rem] bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.35)]"
            >
              <WhatsappLogo weight="fill" className="w-5 h-5" /> Ask Us on WhatsApp
            </button>
          </div>

        </div>
      </section>

      {/* ── 3. DETAILED MEDIUM-BIG MULTI-IMAGE CAROUSEL MODAL ── */}
      {selectedProject && (
        <div 
          onClick={() => setSelectedProject(null)}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-sm animate-fade-in"
        >
          <div 
            className="relative bg-background border border-border w-full max-w-3xl rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 border border-border text-foreground hover:bg-muted active:scale-90 transition-all backdrop-blur-sm"
              aria-label="Close Preview"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="overflow-y-auto w-full">
              {/* Carousel Showcase Media Frame */}
              <div className="w-full aspect-[16/10] bg-muted relative border-b border-border select-none group/carousel">
                <img 
                  src={selectedProject.images[activeImageIndex]} 
                  alt={`${selectedProject.title} view ${activeImageIndex + 1}`} 
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Image Navigation Controls (Hidden if only 1 image exists) */}
                {selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => handlePrevImage(e, selectedProject.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/90 text-foreground shadow-md hover:bg-muted active:scale-90 transition-all border border-border"
                      aria-label="Previous Image"
                    >
                      <CaretLeft size={20} weight="bold" />
                    </button>
                    <button
                      onClick={(e) => handleNextImage(e, selectedProject.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/90 text-foreground shadow-md hover:bg-muted active:scale-90 transition-all border border-border"
                      aria-label="Next Image"
                    >
                      <CaretRight size={20} weight="bold" />
                    </button>
                  </>
                )}

                {/* Bottom Dot Counters Tracking Stack Index */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                  {selectedProject.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        idx === activeImageIndex ? "w-6 bg-[#1E6FA8]" : "w-2 bg-white/60 hover:bg-white"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Specification Detail Area */}
              <div className="p-6 md:p-8">
                <span className="inline-block px-3 py-1 rounded-full bg-[#A9D6F2]/30 text-[#15537D] dark:bg-[#1E6FA8]/40 dark:text-[#A9D6F2] font-sans font-extrabold text-[0.68rem] tracking-wider uppercase mb-3">
                  {selectedProject.category.replace("eservice", "E-Service")} Hub Track
                </span>
                
                <h3 className="font-sans font-black text-foreground text-xl md:text-2xl leading-tight mb-4">
                  {selectedProject.title}
                </h3>

                {/* Tracking Data Info Board */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/50 border border-border/40 mb-6 text-xs font-sans">
                  <div>
                    <span className="block text-muted-foreground font-medium mb-0.5">Project Client Track:</span>
                    <span className="block text-foreground font-bold">{selectedProject.clientName || "General Intake Account"}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-medium mb-0.5">Completion Reference:</span>
                    <span className="block text-foreground font-bold">{selectedProject.dateCompleted || "Active Track Cycle"}</span>
                  </div>
                </div>

                {/* Subpage Case Work Details */}
                <div className="space-y-3">
                  <h5 className="font-sans font-black text-xs text-foreground uppercase tracking-wider">Project Case Profile</h5>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {selectedProject.extendedDetails}
                  </p>
                </div>

                {/* Immediate Order Routing Integration Footer */}
                <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="block text-[0.72rem] text-muted-foreground font-medium">Love this specific quality turnaround?</span>
                    <span className="block text-xs font-black text-foreground">Order a custom service stream package now</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProject(null)
                      onNavigate("contact")
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-sans font-black text-xs md:text-sm bg-[#1E6FA8] border border-[#0F3F66] text-white hover:bg-[#15537D] active:scale-95 transition-all shadow-sm"
                  >
                    Request Similar Build Package <ArrowRight size={14} weight="bold" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
