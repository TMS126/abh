"use client"

import { useState } from "react"
import {
  Target,
  Heart,
  Lightning,
  WhatsappLogo,
  ShieldCheck,
  Desktop,
  Printer,
  Scissors,
  DeviceMobile
} from "@phosphor-icons/react"

export function AboutPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const standards = [
    { id: 1, icon: Desktop, title: "Premium Vector Accuracy", description: "We design entirely on our studio workstation using professional vector tools. No generic, low-quality templates—every logo, card layout, and letterhead is built custom for sharp execution at any size." },
    { id: 2, icon: Printer, title: "Megatank Economy Prints", description: "Equipped with the high-yield Canon Pixma G3420 continuous ink system, we provide rich, vibrant color layouts and documents at a fraction of the price of massive commercial retail chains." },
    { id: 3, icon: Scissors, title: "Hand-Crafted Sealing & Care", description: "We take genuine pride in manual precision. Using our Bell laminating machine, professional scissors, and Bostik adhesives, every single card, document pack, and flyer is individually hand-cut and sealed to tactile perfection." },
    { id: 4, icon: DeviceMobile, title: "Direct Samsung Control Hub", description: "No long automated queues or unreturned emails. Our business runs directly via a secure Samsung mobile pipeline on WhatsApp, ensuring your portal tracking, updates, and orders are answered instantly." },
  ]

  return (
    <div className="animate-fade-up">
      {/* Hero — Clean background with solid line separator */}
      <section className="px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden bg-white dark:bg-[#081428]">
        <h1 className="font-sans font-black text-2xl md:text-4xl text-[#0F3F66] dark:text-[#A9D6F2] relative z-10">About Us</h1>
        <p className="text-[#333333] dark:text-white/75 text-base mt-2 relative z-10">A local business built on community, trust, and real help</p>
        
        {/* Solid line separator */}
        <div className="mt-6 h-[1px] bg-[#E5E5E5] dark:bg-white/10 max-w-[200px] mx-auto" />
      </section>

      {/* Main content */}
      <section className="px-4 md:px-8 py-12 md:py-16 bg-white dark:bg-[#081428]">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#1E6FA8] dark:text-[#A9D6F2] leading-tight mb-4">
              Your <span className="text-[#F4A261]">Neighbourhood</span> Digital Hub
            </h2>
            <p className="text-muted-foreground leading-relaxed text-[0.92rem] mb-3">
              Apexbytes Hub is a home-based service business in Kgotsong, Bothaville. We started with one simple goal: make technology and important services accessible to everyone in our community — no jargon, no stress.
            </p>
            <p className="text-muted-foreground leading-relaxed text-[0.92rem] mb-6">
              We understand that not everyone is tech-savvy, and that's perfectly okay. That's exactly why we're here — to make things easy, friendly, and affordable, without the judgment.
            </p>
            <div className="flex flex-col gap-4 mt-6">
              {[
                { icon: <Target weight="fill" className="w-5 h-5 text-[#6FBF1A]" />, title: "We Keep It Simple", desc: "No confusing jargon. We explain everything in plain language." },
                { icon: <Heart weight="fill" className="w-5 h-5 text-[#6FBF1A]" />, title: "Community First", desc: "We serve our neighbourhood with pride and genuine care." },
                { icon: <Lightning weight="fill" className="w-5 h-5 text-[#6FBF1A]" />, title: "Fast & Reliable", desc: "We respect your time and always deliver with consistency." },
              ].map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-[14px] bg-[#E8F5E9] dark:bg-[#1A3010] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[#1E6FA8] dark:text-[#A9D6F2] text-[0.92rem]">{item.title}</h4>
                    <p className="text-muted-foreground text-[0.82rem] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1E6FA8] rounded-[22px] p-6 md:p-8 text-white">
            <h3 className="font-sans font-black text-xl md:text-2xl">Apexbytes Hub</h3>
            <p className="text-[#A9D6F2] text-sm mt-1 mb-6">Serving Kgotsong & surrounding areas</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5", label: "Hubs" },
                { value: "50+", label: "Services" },
                { value: <WhatsappLogo weight="fill" className="w-7 h-7 text-[#F4A261] mx-auto" />, label: "WhatsApp Ready" },
                { value: <ShieldCheck weight="fill" className="w-7 h-7 text-[#F4A261] mx-auto" />, label: "Community Trusted" },
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 rounded-[14px] p-4 text-center flex flex-col justify-center items-center min-h-[92px]">
                  <div className="font-sans font-black text-2xl md:text-3xl text-[#F4A261] flex items-center justify-center">
                    {stat.value}
                  </div>
                  <div className="text-[0.72rem] text-white/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-zinc-950 border-t border-b border-gray-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-sans font-black text-2xl md:text-3xl text-[#1E6FA8] dark:text-[#A9D6F2] mb-3">
              Our Everyday Toolkit Standards
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              How we combine professional technical accuracy with hand-finished local care to bring premium results straight to your doorstep.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {standards.map((item) => {
              const Icon = item.icon
              const isHovered = hoveredCard === item.id
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="p-5 rounded-[18px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 transition-all duration-300 shadow-sm flex flex-col h-full"
                  style={{
                    borderColor: isHovered ? "#1E6FA8" : "",
                    transform: isHovered ? "translateY(-4px)" : "none",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-4 transition-colors duration-300"
                    style={{
                      backgroundColor: isHovered ? "#1E6FA8" : "rgba(30, 111, 168, 0.1)",
                      color: isHovered ? "#FFFFFF" : "#1E6FA8",
                    }}
                  >
                    <Icon weight="bold" className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans font-black text-base text-foreground mb-2 leading-tight">{item.title}</h3>
                  <p className="text-muted-foreground text-[0.82rem] md:text-sm leading-relaxed grow">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-secondary px-4 md:px-8 py-12 md:py-14 text-center transition-colors duration-300">
        <div className="max-w-[700px] mx-auto">
          <span className="inline-block bg-[#A9D6F2] text-[#1E6FA8] px-4 py-1.5 rounded-[14px] text-[0.78rem] font-bold font-sans tracking-wider">
            Our Mission
          </span>
          <h2 className="font-sans font-black text-xl md:text-2xl text-[#1E6FA8] dark:text-[#A9D6F2] mt-3 mb-4">
            Bridging the Digital Gap in Our Community
          </h2>
          <p className="text-muted-foreground leading-relaxed text-[0.95rem]">
            We believe every person deserves access to quality digital services without travelling far or paying too much. Apexbytes Hub is that bridge — bringing printing, design, IT help, and government services to your doorstep.
          </p>
        </div>
      </section>
    </div>
  )
}
