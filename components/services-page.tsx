"use client"

import { useState } from "react"
import { ArrowRight, X, ChevronDown } from "lucide-react"
import { HUBS, type HubId } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface ServiceModalProps {
  hubId: HubId | null
  onClose: () => void
  onNavigateContact: () => void
}

export function ServiceModal({ hubId, onClose, onNavigateContact }: ServiceModalProps) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)
  const { theme } = useTheme()

  if (!hubId) return null

  const hub = HUBS[hubId]
  const isDark = theme === 'dark'
  const tagStyle = isDark ? hub.tagStyleDark : hub.tagStyle

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index)
  }

  return (
    <div 
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Blur background */}
      <div 
        className="absolute inset-0 backdrop-blur-[16px] backdrop-brightness-[0.38] backdrop-saturate-50 bg-[rgba(8,20,40,0.6)]" 
        onClick={onClose} 
      />
      
      {/* Modal box */}
      <div 
        className="relative z-10 bg-card rounded-[24px] max-w-[560px] w-full max-h-[88vh] overflow-hidden flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.45)] animate-in zoom-in-95 fade-in duration-300"
      >
        {/* Header with gradient */}
        <div 
          className="px-6 md:px-8 py-5 md:py-6 relative shrink-0"
          style={{ background: hub.grad }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-4xl mb-2 block">{hub.icon}</span>
          <h2 className="font-sans font-black text-xl md:text-2xl text-white">{hub.title}</h2>
        </div>

        {/* Body */}
        <div className="px-5 md:px-7 py-5 overflow-y-auto flex-1">
          <p className="text-muted-foreground text-[0.88rem] leading-relaxed mb-5 pb-4 border-b border-border">
            {hub.desc}
          </p>

          {/* Accordion sections */}
          <div className="space-y-2">
            {hub.sections.map((section, idx) => (
              <div 
                key={idx} 
                className="border border-border rounded-[13px] overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-secondary hover:bg-muted transition-colors duration-200 cursor-pointer select-none"
                >
                  <span className="font-sans font-extrabold text-[0.88rem] text-foreground">
                    {section.title}
                  </span>
                  <ChevronDown 
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-300",
                      openAccordion === idx && "rotate-180"
                    )}
                  />
                </button>
                
                {openAccordion === idx && (
                  <div className="px-4 py-3 bg-background">
                    <div className="flex flex-wrap gap-1.5">
                      {section.items.map((item, itemIdx) => (
                        <span 
                          key={itemIdx}
                          className="group relative inline-flex items-center px-3 py-1.5 rounded-2xl text-[0.76rem] font-semibold font-sans cursor-default transition-all duration-200 hover:-translate-y-0.5"
                          style={{ 
                            background: tagStyle.bg, 
                            color: tagStyle.color 
                          }}
                        >
                          {item.name}
                          {/* Price tooltip */}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 bg-wa-green text-white px-3 py-1.5 rounded-lg text-[0.78rem] font-extrabold whitespace-nowrap opacity-0 pointer-events-none transition-all duration-200 scale-90 group-hover:opacity-100 group-hover:scale-100 shadow-[0_6px_20px_rgba(37,211,102,0.55)] z-10">
                            {item.price}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-wa-green" />
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-4 border-t border-border">
            <a
              href="https://wa.me/27753338260"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-3 px-4 rounded-xl font-sans font-extrabold text-[0.88rem] bg-wa-green text-white hover:bg-[#1ebe5a] transition-all duration-250 hover:-translate-y-0.5"
            >
              WhatsApp Us
            </a>
            <button
              onClick={() => {
                onClose()
                onNavigateContact()
              }}
              className="flex-1 text-center py-3 px-4 rounded-xl font-sans font-extrabold text-[0.88rem] bg-secondary text-blue-1 border-2 border-blue-4 hover:bg-blue-4 transition-all duration-250 hover:-translate-y-0.5"
            >
              Send Enquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface HubCardProps {
  hubId: HubId
  onSelect: (id: HubId) => void
}

function HubCard({ hubId, onSelect }: HubCardProps) {
  const hub = HUBS[hubId]
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const tagStyle = isDark ? hub.tagStyleDark : hub.tagStyle

  return (
    <div 
      onClick={() => onSelect(hubId)}
      className="bg-card rounded-[22px] shadow-[var(--shadow)] border-2 border-[var(--card-border)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(30,111,168,0.18)]"
    >
      {/* Header with gradient background */}
      <div 
        className="px-5 py-4 flex items-center gap-3 relative"
        style={{ background: hub.grad }}
      >
        <span className="text-[2rem] shrink-0">{hub.icon}</span>
        <h3 className="font-sans font-black text-lg text-white">{hub.title}</h3>
        <span className="ml-auto w-[30px] h-[30px] bg-white/20 rounded-full flex items-center justify-center text-white text-sm shrink-0 transition-all duration-300 group-hover:bg-white/35 group-hover:translate-x-1">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
      
      {/* Body */}
      <div className="px-5 py-4 flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {hub.previews.map((preview) => (
            <span 
              key={preview}
              className="inline-block px-3 py-1 rounded-[14px] text-[0.73rem] font-bold font-sans"
              style={{ 
                background: tagStyle.bg, 
                color: tagStyle.color 
              }}
            >
              {preview}
            </span>
          ))}
        </div>
        <p className="text-[0.8rem] text-muted-foreground italic">and more...</p>
      </div>
    </div>
  )
}

interface ServicesPageProps {
  onNavigate: (page: string) => void
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [selectedHub, setSelectedHub] = useState<HubId | null>(null)

  return (
    <>
      <div className="animate-fade-up">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-3 via-blue-1 to-[#2980b9] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
          <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.2)_0%,transparent_70%)] rounded-full" />
          <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">Our Services</h1>
          <p className="text-blue-4 text-base mt-2 relative z-10">Five hubs, one place — tap any hub to explore</p>
        </section>

        {/* Services grid */}
        <section className="px-4 md:px-8 py-12 md:py-16">
          <div className="max-w-[680px] mx-auto mb-8 md:mb-10 text-center">
            <p className="text-muted-foreground text-[0.95rem] leading-relaxed">
              {"We've organised all our services into 5 hubs. Tap any card to explore everything inside — and hover over any service to see its price."}
            </p>
          </div>
          <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {(Object.keys(HUBS) as HubId[]).map((hubId) => (
              <HubCard key={hubId} hubId={hubId} onSelect={setSelectedHub} />
            ))}
          </div>
        </section>
      </div>

      {/* Modal */}
      {selectedHub && (
        <ServiceModal 
          hubId={selectedHub} 
          onClose={() => setSelectedHub(null)} 
          onNavigateContact={() => onNavigate("contact")}
        />
      )}
    </>
  )
}
