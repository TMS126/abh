"use client"

import { ArrowRight } from "lucide-react"

interface HeroSectionProps {
  onNavigate: (page: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-blue-3 via-blue-1 to-[#2889c8] min-h-[calc(100vh-68px)] flex items-center px-4 md:px-8 py-16 md:py-20 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-[100px] -right-[80px] w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(169,214,242,0.18)_0%,transparent_65%)] rounded-full" />
      <div className="absolute -bottom-[80px] -left-[60px] w-[380px] h-[380px] bg-[radial-gradient(circle,rgba(111,191,26,0.12)_0%,transparent_65%)] rounded-full" />
      
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
        <div className="text-center md:text-left">
          <h1 className="font-sans font-black text-3xl md:text-4xl lg:text-[3.1rem] text-white leading-tight mb-4 md:mb-5 text-balance">
            Your <span className="text-wa-green">Local Tech</span> &amp; Print Partner
          </h1>
          <p className="text-blue-4 text-base md:text-lg leading-relaxed mb-6 md:mb-8 text-pretty">
            From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
            <button
              onClick={() => onNavigate("services")}
              className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base bg-wa-green text-white hover:bg-[#1ebe5a] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(37,211,102,0.4)]"
            >
              See Our Services <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate("contact")}
              className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base bg-transparent text-white border-2 border-white/45 hover:border-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get in Touch
            </button>
          </div>
        </div>
        
        {/* Hero card */}
        <div className="bg-white/10 backdrop-blur-[12px] border border-white/20 rounded-[22px] p-5 md:p-7">
          <h3 className="font-sans font-extrabold text-base text-white mb-4">What we do:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "🖨️ Printing", color: "bg-blue-4/20" },
              { label: "📄 CVs & Documents", color: "bg-green-4/20" },
              { label: "🎨 Design", color: "bg-orange-4/20" },
              { label: "🌐 SASSA & SARS", color: "bg-blue-4/20" },
              { label: "💻 Tech Support", color: "bg-white/15" },
            ].map((item) => (
              <span 
                key={item.label}
                className={`inline-flex items-center gap-2 ${item.color} text-white px-3 py-1.5 rounded-[18px] text-sm`}
              >
                {item.label}
              </span>
            ))}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20 text-center">
            <div>
              <div className="font-sans font-black text-xl md:text-2xl text-wa-green">5</div>
              <div className="text-[0.7rem] text-white/70 mt-0.5">Service Hubs</div>
            </div>
            <div>
              <div className="font-sans font-black text-xl md:text-2xl text-wa-green">50+</div>
              <div className="text-[0.7rem] text-white/70 mt-0.5">Services</div>
            </div>
            <div>
              <div className="font-sans font-black text-xl md:text-2xl text-wa-green">📍</div>
              <div className="text-[0.7rem] text-white/70 mt-0.5">Kgotsong</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
