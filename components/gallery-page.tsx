"use client"

import { useState } from "react"
import { 
  Printer, 
  FileText, 
  Palette, 
  Globe, 
  Cpu, 
  Image as ImageIcon 
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

// 1. Gallery Categories matching Apexbytes Hub divisions
const CATEGORIES = [
  { id: "all", label: "All Work", icon: ImageIcon },
  { id: "print", label: "Print Hub", icon: Printer },
  { id: "document", label: "Document Hub", icon: FileText },
  { id: "design", label: "Design Hub", icon: Palette },
  { id: "eservice", label: "E-Service Hub", icon: Globe },
  { id: "tech", label: "Tech Hub", icon: Cpu },
]

// 2. High-quality placeholders ready for actual project imagery/renders
const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Professional Business Card Design",
    category: "design",
    description: "Custom vector brand layout with modern typography.",
  },
  {
    id: 2,
    title: "High-Gloss Photo Print Runs",
    category: "print",
    description: "Vibrant colour photo processing and framing prints.",
  },
  {
    id: 3,
    title: "Corporate CV & Profile Formatting",
    category: "document",
    description: "Professional structural typesetting and layout editing.",
  },
  {
    id: 4,
    title: "Custom Event Invitation Media",
    category: "design",
    description: "Elegant layout for community events and celebrations.",
  },
  {
    id: 5,
    title: "OS Installation & Desktop Tune-up",
    category: "tech",
    description: "Clean Windows setup, driver optimization, and speed tuning.",
  },
  {
    id: 6,
    title: "Official Government Portal Submissions",
    category: "eservice",
    description: "Fast registration assistance and official document printing.",
  },
]

export function GalleryPage() {
  const [activeTab, setActiveTab] = useState("all")

  // Filter items dynamically based on selection
  const filteredItems = activeTab === "all" 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeTab)

  return (
    <div className="animate-fade-up min-h-screen bg-background">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#1E6FA8] via-[#15537D] to-[#0F3F66] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.15)_0%,transparent_70%)] rounded-full" />
        <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">
          Our Portfolio
        </h1>
        <p className="text-[#A9D6F2] text-sm md:text-base mt-2 relative z-10 max-w-md mx-auto">
          Real work, real results — look through what we do every single day.
        </p>
      </section>

      {/* Main Portfolio Workspace */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-16">
        
        {/* Category Navigation Filter Tabs */}
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
                    : "bg-secondary/60 border-border/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon weight={isActive ? "fill" : "regular"} className="w-4 h-4" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Visual Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group bg-card border border-border/60 rounded-[18px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
            >
              {/* Asset Box Wrapper (Ready for your vector design files or showcase photos) */}
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary/40 to-secondary flex flex-col items-center justify-center p-6 border-b border-border/40 relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1E6FA8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ImageIcon weight="thin" className="w-12 h-12 text-muted-foreground/30 mb-2 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-[0.68rem] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md bg-background/80 border border-border/40 text-muted-foreground">
                  {item.category.replace("eservice", "E-Service")} Project Case
                </span>
              </div>

              {/* Text Description Box */}
              <div className="p-5 flex flex-col grow">
                <h3 className="font-sans font-black text-foreground text-base leading-snug mb-1.5 group-hover:text-[#1E6FA8] transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-[0.82rem] leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Empty State Checker */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-border/40 rounded-[22px] max-w-md mx-auto">
            <p className="text-muted-foreground text-sm font-medium">No items uploaded under this division yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}
