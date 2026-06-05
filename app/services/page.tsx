"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CtaBar } from "@/components/strip-section"
import { HUBS, HubId } from "@/lib/data" 

export default function ServicesRoute() {
  // Extract keys directly from the HUBS object structure ('print', 'doc', etc.)
  const hubKeys = Object.keys(HUBS) as HubId[]
  const [activeHubId, setActiveHubId] = useState<HubId>(hubKeys[0] || 'print') 

  // Direct, simple lookup matching your object schema
  const activeHub = HUBS[activeHubId]

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0F3F66]">
      {/* Navigation Bar */}
      <Navbar activePage="services" />
      
      {/* Main Viewport */}
      <main className="pt-[80px] max-w-[1200px] mx-auto px-4 md:px-8 pb-12">
        <div className="mb-10">
          <h1 className="font-sans font-black text-3xl md:text-5xl text-[#0F3F66] dark:text-[#A9D6F2] mb-3">
            Our Services
          </h1>
          <p className="text-[#555555] dark:text-[#EDEDED] text-base max-w-[600px]">
            Explore our specialized hubs. Select a category below to see complete itemised service descriptions and updated pricing menus.
          </p>
        </div>

        {/* Dynamic Category Navigation Ribbon */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-none snap-x">
          {hubKeys.map((key) => {
            const hub = HUBS[key]
            const isActive = activeHubId === key
            return (
              <button
                key={key}
                onClick={() => setActiveHubId(key)}
                className={`px-5 py-2.5 rounded-full font-sans font-bold text-sm transition-all whitespace-nowrap snap-center ${
                  isActive 
                    ? "bg-[#1E6FA8] text-white shadow-md shadow-[#1E6FA8]/25" 
                    : "bg-[#EDEDED] dark:bg-[#15537D] text-[#333333] dark:text-[#A9D6F2] hover:bg-[#D6D6D6]"
                }`}
              >
                {hub.title}
              </button>
            )
          })}
        </div>

        {/* Active Hub Header Banner Layout */}
        {activeHub ? (
          <div className="mt-4 animate-fade-in">
            <div 
              style={{ background: activeHub.grad }} 
              className="mb-8 p-6 text-white rounded-[24px] shadow-sm"
            >
              <h2 className="text-2xl font-black mb-2">
                {activeHub.title}
              </h2>
              <p className="text-sm text-white/90 max-w-[700px] leading-relaxed">
                {activeHub.desc}
              </p>
            </div>
            
            {/* Displaying Service Sections & Submenus */}
            <div className="space-y-10">
              {activeHub.sections?.map((section, sIdx) => (
                <div key={sIdx} className="animate-fade-up">
                  <h3 className="text-lg font-black text-[#1E6FA8] dark:text-[#CDEB9F] mb-4 border-b border-[#EDEDED] dark:border-white/10 pb-2">
                    {section.title}
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {section.items?.map((item, iIdx) => (
                      <div 
                        key={iIdx} 
                        className="flex flex-col justify-between p-5 bg-white dark:bg-[#15537D] border border-[#EDEDED] dark:border-[#0F3F66] rounded-[20px] shadow-sm hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-sans font-bold text-[#333333] dark:text-white text-base mb-2">
                          {item.name}
                        </h4>
                        <div className="mt-2 self-start px-3 py-1 bg-[#CDEB9F] dark:bg-[#6FBF1A] text-[#333333] dark:text-white font-mono font-bold text-sm rounded-lg">
                          {item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-[#F4F4F4] dark:bg-white/5 rounded-[24px] text-[#777777]">
            Failed to parse target business configurations.
          </div>
        )}
      </main>

      {/* Interactive Floating Action Banner */}
      <CtaBar
        title="Not sure what you need?"
        description="Just WhatsApp us and we'll guide you in the right direction."
        buttonText="Chat With Us"
        buttonHref="https://wa.me/27753338260"
      />

      {/* Global Brand Footer Container */}
      <Footer />
    </div>
  )
}
 
