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
  Image as ImageIcon 
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface GalleryPageProps {
  onNavigate: (page: string) => void
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

// Production layout elements demonstrating client project case metrics
const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Corporate Identity Package",
    category: "design",
    description: "Tailored vector layouts including corporate cards and distribution flyers.",
  },
  {
    id: 2,
    title: "High-Volume Document Production",
    category: "print",
    description: "Crisp black and white document collating alongside premium physical photo printing.",
  },
  {
    id: 3,
    title: "Professional CV Re-Formatting",
    category: "document",
    description: "Complete modern structural layout optimization and comprehensive application typing.",
  },
  {
    id: 4,
    title: "Bespoke Celebration Invitations",
    category: "design",
    description: "Premium static layouts designed specifically for local social distribution.",
  },
  {
    id: 5,
    title: "OS Optimization & Software Setup",
    category: "tech",
    description: "Full clean system builds, storage tuning, and comprehensive virus mitigation.",
  },
  {
    id: 6,
    title: "Portal Verification Direct Assist",
    category: "eservice",
    description: "Accurate status checking and streamlined administrative documentation assistance.",
  },
]

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  const [activeTab, setActiveTab] = useState("all")

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
          
          {/* Dynamic Descriptive Section Tagline */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 bg-[#CDEB9F] text-[#3E6B0E] dark:bg-[#1A3010] dark:text-[#A8E05A] px-4 py-1.5 rounded-[20px] text-[0.78rem] font-bold font-sans tracking-wider mb-3">
              <Sparkles weight="fill" className="w-3.5 h-3.5" /> LIVE WORKS MATRIX
            </span>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#1E6FA8] dark:text-[#A9D6F2] mb-3">
              Our Work Speaks for Itself
            </h2>
            <p className="text-muted-foreground text-[0.92rem] leading-relaxed max-w-[560px] mx-auto">
              Explore our verified project tracks below. Filter by division to see how we maintain consistent quality across digital solutions.
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

          {/* Interactive Core Grid Framework */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-card border-2 border-border/40 rounded-[18px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
              >
                {/* Simulated Graphical Content Canvas Panel */}
                <div className="aspect-[4/3] bg-gradient-to-br from-secondary/50 to-secondary flex flex-col items-center justify-center p-6 border-b border-border/40 relative overflow-hidden select-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1E6FA8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <ImageIcon weight="fill" className="w-10 h-10 text-muted-foreground/20 mb-2 transition-transform duration-300 group-hover:scale-105" />
                  <span className="text-[0.65rem] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md bg-background text-muted-foreground border border-border/40">
                    {item.category.replace("eservice", "E-Service")} Project Item
                  </span>
                </div>

                {/* Information Metadata Content Wrapper */}
                <div className="p-5 flex flex-col grow">
                  <h4 className="font-sans font-black text-foreground text-[0.98rem] leading-snug mb-1.5 group-hover:text-[#1E6FA8] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-[0.82rem] leading-relaxed">
                    {item.description}
                  </p>
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
 
