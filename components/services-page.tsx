"use client"

import { useState } from "react"
import { ArrowRight, X } from "lucide-react"
import { HUBS, PRICING, type HubId } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ServiceModalProps {
  hubId: HubId | null
  onClose: () => void
  onNavigateContact: () => void
}

export function ServiceModal({ hubId, onClose, onNavigateContact }: ServiceModalProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({ 0: true })

  if (!hubId) return null

  const hub = HUBS[hubId]
  const pricing = PRICING[hubId]

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div 
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Blur background */}
      <div className="absolute inset-0 backdrop-blur-[16px] brightness-[0.4] saturate-[0.6] bg-[rgba(8,20,40,0.6)]" onClick={onClose} />
      
      {/* Modal box */}
      <div className="relative z-10 bg-card rounded-[24px] max-w-[580px] w-full max-h-[88vh] overflow-hidden flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.2)] animate-fade-up">
        {/* Header */}
        <div className="px-6 md:px-8 py-6 md:py-7 relative shrink-0 bg-gradient-to-br from-blue-1 to-blue-3">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-4xl mb-2 block">{hub.icon}</span>
          <h2 className="font-sans font-black text-xl md:text-2xl text-white">{hub.title}</h2>
          <p className="text-white/80 text-sm mt-1">{hub.sub}</p>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-6 overflow-y-auto flex-1">
          <p className="text-muted-foreground text-[0.9rem] leading-relaxed mb-5 pb-4 border-b border-border">
            {hub.desc}
          </p>

          {/* Sections */}
          {hub.sections.map((section, idx) => (
            <div key={idx} className="mb-4">
              <button
                onClick={() => toggleSection(idx)}
                className="flex items-center gap-2 font-sans font-extrabold text-[0.82rem] text-muted-foreground uppercase tracking-wider mb-2 cursor-pointer select-none w-full text-left"
              >
                <span className={cn(
                  "transition-transform duration-200",
                  expandedSections[idx] ? "rotate-90" : ""
                )}>▶</span>
                {section.title}
              </button>
              {expandedSections[idx] && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {section.items.map((item) => (
                    <span 
                      key={item}
                      className="group relative inline-block px-3 py-1 rounded-[14px] text-[0.76rem] font-bold font-sans bg-secondary text-secondary-foreground cursor-default transition-all duration-200 hover:scale-105"
                    >
                      {item}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-wa-green px-3 py-2 rounded-lg text-[0.7rem] font-extrabold whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 z-10">
                        {pricing[item as keyof typeof pricing] || 'Ask us'}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-border">
            <a
              href="https://wa.me/27753338260"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-3 px-4 rounded-xl font-sans font-extrabold text-[0.88rem] bg-wa-green text-white hover:bg-[#1ebe5a] transition-all duration-200 hover:-translate-y-0.5"
            >
              📱 WhatsApp Us
            </a>
            <button
              onClick={() => {
                onClose()
                onNavigateContact()
              }}
              className="flex-1 text-center py-3 px-4 rounded-xl font-sans font-extrabold text-[0.88rem] bg-secondary text-primary border-2 border-blue-4 hover:bg-blue-4 transition-all duration-200 hover:-translate-y-0.5"
            >
              📩 Send Enquiry
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
  
  const colorClasses: Record<HubId, string> = {
    print: "bg-[#EBF5FB] text-[#0F3F66] dark:bg-[#1E3A52] dark:text-blue-4",
    doc: "bg-[#EAFAF1] text-[#3E6B0E] dark:bg-[#1A3010] dark:text-green-4",
    design: "bg-[#FEF3C7] text-[#B86F34] dark:bg-[#3A2010] dark:text-orange-4",
    eservice: "bg-[#EBF5FB] text-[#0F3F66] dark:bg-[#1E3A52] dark:text-blue-4",
    tech: "bg-[#F0F3F6] text-[#2C3E50] dark:bg-[#1E2A38] dark:text-[#B8CCE0]",
  }

  return (
    <div 
      onClick={() => onSelect(hubId)}
      className="bg-card rounded-[22px] shadow-[var(--shadow)] border-2 border-[var(--card-border)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(30,111,168,0.16)] hover:bg-secondary"
    >
      <div className="px-6 py-5 flex items-start gap-4 relative">
        <span className="text-4xl shrink-0 mt-0.5">{hub.icon}</span>
        <div>
          <h3 className="font-sans font-black text-lg text-primary mb-1">{hub.title}</h3>
        </div>
        <span className="absolute top-5 right-5 w-[30px] h-[30px] bg-secondary rounded-full flex items-center justify-center text-sm transition-all duration-200 group-hover:bg-primary group-hover:text-white">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
      <div className="px-6 pb-5 flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hub.highlights.map((highlight) => (
            <span 
              key={highlight.name}
              className={cn(
                "group relative inline-block px-3 py-1 rounded-[14px] text-[0.72rem] font-bold font-sans cursor-pointer transition-all duration-200 hover:scale-105",
                colorClasses[hubId]
              )}
            >
              {highlight.name}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white px-3 py-2 rounded-lg text-[0.7rem] font-extrabold whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 z-10">
                {highlight.price}
              </span>
            </span>
          ))}
        </div>
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
              {"We've organised all our services into 5 hubs. Each hub covers a range of related services — click any card to see everything we offer inside it."}
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
