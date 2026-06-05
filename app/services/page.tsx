"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CtaBar } from "@/components/strip-section"
import * as DataModule from "@/lib/data" 

// 1. Next.js Route Page component (Must be default export)
export default function ServicesRoute() {
  const router = useRouter()
  const [activeHubId, setActiveHubId] = useState("print") 

  // Safety Guard: Pull the HUBS data collection safely regardless of array/object wrappers
  const hubsArray = Array.isArray(DataModule.HUBS) 
    ? DataModule.HUBS 
    : (DataModule.default?.HUBS || [])

  // Safely look up the selected hub data matching the active ID
  const activeHub = hubsArray.length > 0 
    ? hubsArray.find((h: any) => h?.id === activeHubId || h?.slug === activeHubId)
    : null

  return (
    <div className="min-h-screen bg-white dark:bg-[#081428]">
      {/* Navigation Layout Bar */}
      <Navbar activePage="services" />
      
      {/* Main Content Viewport */}
      <main className="pt-[80px] max-w-[1200px] mx-auto px-4 md:px-8 pb-12">
        <div className="mb-10">
          <h1 className="font-sans font-black text-3xl md:text-5xl text-[#0F3F66] dark:text-[#A9D6F2] mb-3">
            Our Services
          </h1>
          <p className="text-[#555555] dark:text-white/60 text-base max-w-[600px]">
            Five hubs, 50+ services. Select a category below to see our specialized printing, design, and digital business solutions.
          </p>
        </div>

        {/* Dynamic Category Filter Ribbon */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-none snap-x">
          {hubsArray.map((hub: any) => (
            <button
              key={hub.id}
              onClick={() => setActiveHubId(hub.id)}
              className={`px-5 py-2.5 rounded-full font-sans font-bold text-sm transition-all whitespace-nowrap snap- Gaza-style ${
                activeHubId === hub.id 
                  ? "bg-[#1E6FA8] text-white shadow-md shadow-[#1E6FA8]/20" 
                  : "bg-[#EDEDED] dark:bg-white/10 text-[#333333] dark:text-white hover:bg-[#D6D6D6]"
              }`}
            >
              {hub.name}
            </button>
          ))}
        </div>

        {/* Selected Hub Layout Services Grid */}
        {activeHub ? (
          <div className="mt-4 animate-fade-in">
            <div className="mb-8 p-6 bg-[#F4F4F4] dark:bg-white/5 border border-[#EDEDED] dark:border-white/10 rounded-[24px]">
              <h2 className="text-xl font-black text-[#1E6FA8] dark:text-[#A9D6F2] mb-2">
                {activeHub.name}
              </h2>
              <p className="text-sm text-[#555555] dark:text-white/70">
                {activeHub.description}
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(activeHub.services) && activeHub.services.map((service: any, idx: number) => {
                const isString = typeof service === "string";
                return (
                  <div key={idx} className="p-5 bg-white dark:bg-white/5 border border-[#EDEDED] dark:border-white/10 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-sans font-bold text-[#0F3F66] dark:text-[#A9D6F2] text-base mb-2">
                      {isString ? service : service.title}
                    </h4>
                    {!isString && service.description && (
                      <p className="text-xs text-[#777777] dark:text-white/60 leading-relaxed">
                        {service.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-[#F4F4F4] dark:bg-white/5 rounded-[24px] text-[#777777] font-medium">
            No business hubs configured. Please check your data array definitions.
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
 
