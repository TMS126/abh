import { useState } from "react"
import { useRouter } from "next/navigation"
// Import your data collections directly
import * as DataModule from "@/lib/data" 

export function ServicesPage() {
  const router = useRouter()
  const [activeHubId, setActiveHubId] = useState("print") // or your default id

  // 🛡️ Safety Guard: Explicitly verify that we are running against a true Array structure
  const hubsArray = Array.isArray(DataModule.HUBS) 
    ? DataModule.HUBS 
    : (DataModule.default?.HUBS || [])

  // 🎯 Safely execute search pass with structured fallbacks
  const activeHub = hubsArray.length > 0 
    ? hubsArray.find((h: any) => h?.id === activeHubId || h?.slug === activeHubId)
    : null

  return (
    <div className="w-full py-8">
      {/* Your existing tabs / rendering buttons look up */}
      <div className="flex gap-2 overflow-x-auto pb-4">
        {hubsArray.map((hub: any) => (
          <button
            key={hub.id}
            onClick={() => setActiveHubId(hub.id)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              activeHubId === hub.id 
                ? "bg-[#1E6FA8] text-white" 
                : "bg-[#EDEDED] dark:bg-white/10 text-[#333333] dark:text-white"
            }`}
          >
            {hub.name}
          </button>
        ))}
      </div>

      {/* Render the Active Hub Content Safely */}
      {activeHub ? (
        <div className="mt-6 animate-fade-in">
          <h2 className="text-2xl font-black text-[#0F3F66] dark:text-[#A9D6F2] mb-4">
            {activeHub.name}
          </h2>
          <p className="text-[#555555] dark:text-white/70 mb-6">
            {activeHub.description}
          </p>
          
          {/* Loop over services inside the hub safely */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(activeHub.services) && activeHub.services.map((service: any, idx: number) => (
              <div key={idx} className="p-5 bg-white dark:bg-white/5 border border-[#EDEDED] dark:border-white/10 rounded-[20px]">
                <h4 className="font-bold text-[#1E6FA8] dark:text-[#A9D6F2] mb-2">{service.title || service}</h4>
                {service.description && <p className="text-sm text-[#777777] dark:text-white/60">{service.description}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-[#777777]">
          No operational hubs loaded. Please check data structures.
        </div>
      )}
    </div>
  )
}
