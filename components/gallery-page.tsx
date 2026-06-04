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
  ArrowRight
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
  image: string
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

// Portfolio Items with real local path images instead of fallback vectors
const GALLERY_ITEMS: PortfolioItem[] = [
  {
    id: 1,
    title: "Apexbytes Hub Official Branding Package",
    category: "design",
    description: "Premium vector corporate identity suite with custom letterheads and business cards.",
    image: "/images/portfolio/branding-pack.jpg",
    clientName: "Internal Venture",
    dateCompleted: "February 2026",
    extendedDetails: "Designed exclusively using standard premium Adobe Illustrator software vectors. Showcases modern typography alignment coupled with our high-contrast Blue and Accent Orange theme layout structure."
  },
  {
    id: 2,
    title: "High-Volume Document Production Runs",
    category: "print",
    description: "Crisp black and white document collating alongside premium physical photo printing.",
    image: "/images/portfolio/print-production.jpg",
    clientName: "Kgotsong Community Project",
    dateCompleted: "March 2026",
    extendedDetails: "Features precise borderless printing calibrations on 220gsm gloss stock. Optimised for heavy-duty duplication output matching high-grade office print requirements."
  },
  {
    id: 3,
    title: "Professional Executive CV Re-Formatting",
    category: "document",
    description: "Complete modern structural layout optimization and comprehensive application typing.",
    image: "/images/portfolio/cv-formatting.jpg",
    clientName: "Local Artisan Graduate",
    dateCompleted: "April 2026",
    extendedDetails: "A comprehensive structural text overhaul that modernises old certificates into readable, ATS-friendly corporate resumes. Clean grid margins built for professional visibility."
  },
  {
    id: 4,
    title: "Bespoke Celebration Invitations",
    category: "design",
    description: "Premium static layouts designed specifically for local social distribution.",
    image: "/images/portfolio/invitation-mockup.jpg",
    clientName: "Private Event Client",
    dateCompleted: "May 2026",
    extendedDetails: "Elegant invitation printing blending unique textures and background layers. Structured cleanly for digital messaging platforms or physical handout printing."
  },
  {
    id: 5,
    title: "OS Optimization & Hardware Tuning",
    category: "tech",
    description: "Full clean system builds, storage tuning, and comprehensive virus mitigation.",
    image: "/images/portfolio/tech-bench.jpg",
    clientName: "Home Office Workstation",
    dateCompleted: "May 2026",
    extendedDetails: "Complete workstation recovery routine including direct registry cleaning, thermal pasting application, and custom partition backups for enhanced local performance metrics."
  },
  {
    id: 6,
    title: "Portal Verification Direct Assist",
    category: "eservice",
    description: "Accurate status checking and streamlined administrative documentation assistance.",
    image: "/images/portfolio/eservice-screen.jpg",
    clientName: "Walk-in Resident Support",
    dateCompleted: "June 2026",
    extendedDetails: "Fast-tracked verification workflows enabling seamless processing and immediate status check reference slip printing for official application tracking."
  },
]

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null)

  // Filter computation logic
  const filteredItems = activeTab === "all" 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeTab)

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
              Explore our verified project tracks below. Click on any item card to see detailed work documentation, timelines, and execution metrics.
            </p>
          </div>

          {/* Tab Filter Controls Block */}
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
                      ? "bg-[#1E6FA8] border-[#0F3F66] text-white shadow-sm"
                      : "bg-secondary/70 border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon weight="fill" className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Interactive Core Photo Grid Framework */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedProject(item)}
                className="group bg-card border-2 border-border/40 rounded-[18px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer"
              >
                {/* Visual Real Photo Canvas Thumbnail Box */}
                <div className="aspect-[4/3] bg-muted relative overflow-hidden select-none">
                  {/* Fallback pattern overlay applied while image paths map locally */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1E6FA8]/10 to-transparent z-10 pointer-events-none" />
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Standard fallback text box design render path in case asset image fails locally
                      e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23EDEDED'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' fill='%23777777'>[ Showcase Image Slot ]</text></svg>"
                    }}
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
                    View Real Work Details <ArrowRight size={14} weight="bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Category Fallback Handler */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-border/40 rounded-[22px] max-w-sm mx-auto">
              <p className="text-muted-foreground text-sm font-semibold">No entries uploaded in this cluster segment.</p>
            </div>
          )}

          {/* Call To Action Block Footer */}
          <div className="text-center mt-12 pt-6 border-t border-border/40">
            <p className="text-muted-foreground text-[0.88rem] mb-4">Want to check out physical print proofs before ordering?</p>
            <button
              onClick={() => onNavigate("contact")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[28px] font-sans font-extrabold text-[0.92rem] bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.35)]"
            >
              <WhatsappLogo weight="fill" className="w-5 h-5" /> Ask Us on WhatsApp
            </button>
          </div>

        </div>
      </section>

      {/* ── 3. DETAILED WORKCASE SUBPAGE SHEET OVERLAY (MODAL VIEW) ── */}
      {selectedProject && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative bg-background border border-border w-full max-w-2xl rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Exit Trigger Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 border border-border text-foreground hover:bg-muted active:scale-90 transition-all"
              aria-label="Close Project Specification Panel"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="overflow-y-auto w-full">
              {/* Detailed Showcase Display Header */}
              <div className="w-full aspect-video bg-muted relative border-b border-border">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450'><rect width='100%' height='100%' fill='%23EDEDED'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' fill='%23777777'>[ Live Project Case View ]</text></svg>"
                  }}
                />
              </div>

              {/* Specification Meta Metadata Text Blocks */}
              <div className="p-6 md:p-8">
                <span className="inline-block px-3 py-1 rounded-full bg-[#A9D6F2]/30 text-[#15537D] dark:bg-[#1E6FA8]/40 dark:text-[#A9D6F2] font-sans font-extrabold text-[0.68rem] tracking-wider uppercase mb-3">
                  {selectedProject.category.replace("eservice", "E-Service")} Workspace Track
                </span>
                
                <h3 className="font-sans font-black text-foreground text-xl md:text-2xl leading-tight mb-4">
                  {selectedProject.title}
                </h3>

                {/* Tracking Data Grid Field Info */}
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

                {/* Subpage Case Work Description Details */}
                <div className="space-y-4">
                  <h5 className="font-sans font-black text-sm text-foreground uppercase tracking-wider">Project Engineering Case Profile</h5>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {selectedProject.extendedDetails || "Operational case analysis and detailed deployment parameters logging for this workflow stream are actively archived."}
                  </p>
                </div>

                {/* Subpage Immediate Order Direct Routing Integration Button */}
                <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="block text-[0.72rem] text-muted-foreground font-medium">Love this specific result quality?</span>
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
