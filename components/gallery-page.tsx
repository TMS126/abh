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
  ArrowLeft,
  Clock
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface GalleryPageProps {
  onNavigate: (page: string) => void
}

interface GalleryItem {
  id: number
  title: string
  category: string
  description: string
  thumbnail: string
  extendedSpecs?: string[]
}

const CATEGORIES = [
  { id: "all", label: "All Work", icon: ImageIcon },
  { id: "print", label: "Print Hub", icon: Printer },
  { id: "document", label: "Document Hub", icon: FileText },
  { id: "design", label: "Design Hub", icon: Palette },
  { id: "eservice", label: "E-Service Hub", icon: Globe },
  { id: "tech", label: "Tech Hub", icon: Cpu },
]

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "Corporate Identity Package",
    category: "design",
    description: "Tailored vector layouts including corporate cards and distribution flyers.",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop",
    extendedSpecs: ["Vector Master Files (.AI)", "CMYK Print Ready Formats", "Apexbytes Signature Branding Guidelines"]
  },
  {
    id: 2,
    title: "High-Volume Document Production",
    category: "print",
    description: "Crisp black and white document collating alongside premium physical photo printing.",
    thumbnail: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=600&auto=format&fit=crop",
    extendedSpecs: ["High-Gloss Photographic Finishes", "Precision Trimming & Layout Calibration", "Bulk Multi-tier Output Logs"]
  },
  {
    id: 3,
    title: "Professional CV Re-Formatting",
    category: "document",
    description: "Complete modern structural layout optimization and comprehensive application typing.",
    thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop",
    extendedSpecs: ["Applicant Tracking System (ATS) Friendly Syntax", "Tailored Structural Typography Layout", "Digital PDF Delivery Formulation"]
  },
  {
    id: 4,
    title: "Bespoke Celebration Invitations",
    category: "design",
    description: "Premium static layouts designed specifically for local social distribution.",
    thumbnail: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop",
    extendedSpecs: ["Custom Color Matching Schemes", "Social Media Broadcast Optimization", "High-Resolution Asset Renders"]
  },
  {
    id: 5,
    title: "OS Optimization & Software Setup",
    category: "tech",
    description: "Full clean system builds, storage tuning, and comprehensive virus mitigation.",
    thumbnail: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop",
    extendedSpecs: ["Clean OS Installation Configurations", "Complete Malware Mitigation Routines", "System Speed Diagnostics Execution"]
  },
  {
    id: 6,
    title: "Portal Verification Direct Assist",
    category: "eservice",
    description: "Accurate status checking and streamlined administrative documentation assistance.",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop",
    extendedSpecs: ["Direct Portal Verification Routines", "Secure Information Handling Systems", "Printed Form Validation Records"]
  },
]

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const filteredItems = activeTab === "all" 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeTab)

  // Render Subpage View
  if (selectedItem) {
    return (
      <div className="animate-fade-up min-h-screen bg-background">
        {/* Navigation Action Header */}
        <div className="bg-muted px-4 md:px-8 py-4 border-b border-border/40 flex items-center justify-between">
          <button 
            onClick={() => setSelectedItem(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-sans font-bold text-xs bg-background hover:bg-secondary text-foreground border border-border/60 transition-all active:scale-95"
          >
            <ArrowLeft weight="bold" className="w-4 h-4" /> Back To Gallery
          </button>
          <span className="text-[0.68rem] font-extrabold uppercase tracking-widest text-[#777777] bg-background px-3 py-1.5 rounded-md border border-border/40">
            Case Studio ID: #{selectedItem.id}
          </span>
        </div>

        {/* Workspace Splitting Layout */}
        <section className="max-w-[1100px] mx-auto px-4 md:px-8 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Premium Thumbnail Element */}
          <div className="rounded-[22px] overflow-hidden border border-border/60 bg-muted aspect-video md:aspect-square relative shadow-inner">
            <img 
              src={selectedItem.thumbnail} 
              alt={selectedItem.title} 
              className="w-full h-full object-cover select-none pointer-events-none grayscale-[15%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Right Column: Case Scope Specifications & Coming Soon Block */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 text-[0.65rem] font-black uppercase tracking-wider bg-[#1E6FA8] text-white rounded-md mb-3">
                {selectedItem.category.replace("eservice", "E-Service Hub")}
              </span>
              <h2 className="font-sans font-black text-2xl md:text-3xl text-foreground mb-4 leading-tight">
                {selectedItem.title}
              </h2>
              <p className="text-muted-foreground text-[0.92rem] leading-relaxed mb-6">
                {selectedItem.description}
              </p>

              {/* Functional Feature Checklists */}
              {selectedItem.extendedSpecs && (
                <div className="mb-6">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#555555] dark:text-[#9A9A9A] mb-3">
                    Project Matrix Capabilities:
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {selectedItem.extendedSpecs.map((spec, i) => (
                      <li key={i} className="flex items-center gap-3 text-[0.85rem] text-muted-foreground bg-secondary/40 p-2.5 rounded-xl border border-border/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6FBF1A]" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Styled "Coming Soon" Subpage Overlay Layer */}
            <div className="bg-[#EDEDED] dark:bg-secondary border border-border/60 rounded-[18px] p-5 text-center flex flex-col items-center justify-center gap-2 mt-6">
              <div className="inline-flex items-center gap-2 text-[#D9894B] font-sans font-black text-xs uppercase tracking-widest bg-background border border-border/40 px-3 py-1 rounded-full shadow-sm">
                <Clock weight="fill" className="w-3.5 h-3.5 animate-spin-[spin_3s_linear_infinite]" /> Interactive Subpage Pending
              </div>
              <p className="text-muted-foreground text-[0.8rem] max-w-xs mt-1">
                High-resolution vector displays, project renderings, and live tracking sheets will mount onto this viewport soon.
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Render Master Gallery Grid Layout View
  return (
    <div className="animate-fade-up min-h-screen bg-background">
      {/* Hero Header Banner */}
      <section className="bg-gradient-to-br from-[#1E6FA8] via-[#15537D] to-[#0F3F66] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.18)_0%,transparent_70%)] rounded-full" />
        <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">
          Gallery &amp; Portfolio
        </h1>
        <p className="text-[#A9D6F2] text-sm md:text-base mt-2 relative z-10 max-w-md mx-auto">
          Real work, real people, real results
        </p>
      </section>

      {/* Grid Canvas Workspace Section */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Decorative Framing Tagline */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 bg-[#CDEB9F] text-[#3E6B0E] dark:bg-[#1A3010] dark:text-[#A8E05A] px-4 py-1.5 rounded-[20px] text-[0.78rem] font-bold font-sans tracking-wider mb-3">
              <Sparkles weight="fill" className="w-3.5 h-3.5" /> LIVE WORKS MATRIX
            </span>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#1E6FA8] dark:text-[#A9D6F2] mb-3">
              Our Work Speaks for Itself
            </h2>
            <p className="text-muted-foreground text-[0.92rem] leading-relaxed max-w-[560px] mx-auto">
              Explore our verified project tracks below. Select any item card to step inside the dedicated case metrics subpage.
            </p>
          </div>

          {/* Interactive Category Tabs Section */}
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

          {/* Portfolio Adaptive Asset Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group bg-card border-2 border-border/40 rounded-[18px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer"
              >
                {/* Image Presentation Box Thumbnail Node */}
                <div className="aspect-[4/3] bg-secondary flex items-center justify-center border-b border-border/40 relative overflow-hidden select-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1E6FA8]/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 grayscale-[15%] group-hover:grayscale-0"
                    loading="lazy"
                  />
                  <span className="absolute bottom-3 left-3 z-20 text-[0.62rem] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md bg-background/90 text-foreground border border-border/40 shadow-sm">
                    {item.category.replace("eservice", "E-Service")} Case Profile
                  </span>
                </div>

                {/* Info Text Deck Block */}
                <div className="p-5 flex flex-col grow">
                  <h4 className="font-sans font-black text-foreground text-[0.98rem] leading-snug mb-1.5 group-hover:text-[#1E6FA8] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-[0.82rem] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[0.72rem] font-bold text-[#1E6FA8] dark:text-[#A9D6F2]">
                    <span>Inspect Project</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 font-sans">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Fallback Dynamic Handler */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-border/40 rounded-[22px] max-w-sm mx-auto">
              <p className="text-muted-foreground text-sm font-semibold">No entries uploaded in this cluster segment.</p>
            </div>
          )}

          {/* Action Module Footer */}
          <div className="text-center mt-12 pt-6 border-t border-border/40">
            <p className="text-muted-foreground text-[0.88rem] mb-4">Want to see live examples before you order?</p>
            <button
              onClick={() => onNavigate("contact")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[28px] font-sans font-extrabold text-[0.92rem] bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.35)]"
            >
              <WhatsappLogo weight="fill" className="w-5 h-5" /> Ask Us on WhatsApp
            </button>
          </div>

        </div>
      </section>
    </div>
  )
}
