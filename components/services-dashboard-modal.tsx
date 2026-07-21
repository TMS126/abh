"use client"

import { useEffect } from "react"
import { X } from "@phosphor-icons/react"
import { ServicesPage } from "./services-page"

interface ServicesDashboardModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

export function ServicesDashboardModal({ isOpen, onClose, onNavigate }: ServicesDashboardModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 bg-background w-full h-full sm:h-[85vh] sm:max-w-[1140px] sm:rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 ease-out">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-[36px] h-[36px] rounded-full bg-black/20 text-white backdrop-blur-sm flex items-center justify-center hover:bg-black/40 active:scale-90 transition-all duration-200 shadow-md"
          aria-label="Close Dashboard"
        >
          <X className="w-4 h-4" weight="bold" />
        </button>

        <div className="flex-1 overflow-y-auto pb-12 scrollbar-none">
          <ServicesPage 
            onNavigate={(page) => {
              onClose()
              onNavigate(page)
            }} 
          />
        </div>
      </div>
    </div>
  )
} 
