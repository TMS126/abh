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
      {/* Hero - Solid Corporate Blue */}
      <section
        className="px-4 md:px-8 py-12 md:py-16 text-center relative overflow-hidden bg-[#1E6FA8]"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,#FFFFFF_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#6FBF1A_0%,transparent_45%)]" />
        <h1 className="font-sans font-black text-3xl md:text-5xl text-white relative z-10">About Us</h1>
        <p className="text-white/90 text-base md:text-lg mt-3 max-w-2xl mx-auto relative z-10">A local business built on community, trust, and real help</p>
      </section>

      {/* Main content */}
      <section className="px-4 md:px-8 py-12 md:py-20 bg-white dark:bg-[#081428]">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="order-2 md:order-1">
            <h2 className="font-sans font-black text-3xl md:text-4xl text-[#0F3F66] dark:text-white leading-tight mb-6">
              Your <span className="text-[#F4A261]">Neighbourhood</span> Digital Hub
            </h2>
            <div className="space-y-4">
              <p className="text-[#333333] dark:text-white/80 leading-relaxed text-base">
                Apexbytes Hub is a home-based service business in Kgotsong, Bothaville. We started with one simple goal: make technology and important services accessible to everyone in our community — no jargon, no stress.
              </p>
              <p className="text-[#333333] dark:text-white/80 leading-relaxed text-base">
                {"We understand that not everyone is tech-savvy, and that's perfectly okay. That's exactly why we're here — to make things easy, friendly, and affordable, without the judgment."}
              </p>
            </div>
            
            <div className="flex flex-col gap-5 mt-10">
              {[
                { icon: <Target weight="fill" className="w-5 h-5 text-white" />, title: "We Keep It Simple", desc: "No confusing jargon. We explain everything in plain language.", color: "#1E6FA8" },
                { icon: <Heart weight="fill" className="w-5 h-5 text-white" />, title: "Community First", desc: "We serve our neighbourhood with pride and genuine care.", color: "#6FBF1A" },
                { icon: <Lightning weight="fill" className="w-5 h-5 text-white" />, title: "Fast & Reliable", desc: "We respect your time and always deliver with consistency.", color: "#F4A261" },
              ].map((item, index) => (
                <div key={index} className="flex gap-5 items-start">
                  <div 
                    className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 shadow-md"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[#0F3F66] dark:text-white text-lg">{item.title}</h4>
                    <p className="text-[#555555] dark:text-white/60 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="bg-[#1E6FA8] rounded-[30px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <h3 className="font-sans font-black text-2xl md:text-3xl relative z-10">Apexbytes Hub</h3>
              <p className="text-white/80 text-base mt-2 mb-8 relative z-10">Serving Kgotsong & surrounding areas</p>
              
              <div className="grid grid-cols-2 gap-5 relative z-10">
                {[
                  { value: "5", label: "Hubs" },
                  { value: "50+", label: "Services" },
                  { value: <WhatsappLogo weight="fill" className="w-8 h-8 text-white mx-auto" />, label: "WhatsApp Ready" },
                  { value: <ShieldCheck weight="fill" className="w-8 h-8 text-white mx-auto" />, label: "Community Trusted" },
                ].map((stat, index) => (
                  <div key={index} className="bg-white/15 rounded-[20px] p-5 text-center flex flex-col justify-center items-center min-h-[110px] backdrop-blur-sm border border-white/10">
                    <div className="font-sans font-black text-3xl text-white flex items-center justify-center">
                      {stat.value}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white/70 mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Standards - Solid Cards */}
      <section className="py-20 px-4 bg-[#F4F4F4] dark:bg-[#0A1A2E] border-t border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-sans font-black text-3xl md:text-4xl text-[#0F3F66] dark:text-white mb-4">
              Our Everyday Toolkit Standards
            </h2>
            <p className="text-[#555555] dark:text-white/60 text-base max-w-2xl mx-auto">
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
                  className="p-7 rounded-[24px] bg-white dark:bg-white/5 border border-transparent transition-all duration-300 shadow-lg flex flex-col h-full"
                  style={{
                    borderColor: isHovered ? "#1E6FA8" : "transparent",
                    transform: isHovered ? "translateY(-8px)" : "none",
                    boxShadow: isHovered ? "0 20px 40px rgba(30, 111, 168, 0.15)" : ""
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-6 transition-all duration-300"
                    style={{
                      backgroundColor: isHovered ? "#1E6FA8" : "#F4F4F4",
                      color: isHovered ? "#FFFFFF" : "#1E6FA8",
                    }}
                  >
                    <Icon weight="bold" className="w-6 h-6" />
                  </div>
                  <h3 className="font-sans font-black text-lg text-[#0F3F66] dark:text-white mb-3 leading-tight">{item.title}</h3>
                  <p className="text-[#555555] dark:text-white/60 text-sm leading-relaxed grow">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission - Solid Blue Block */}
      <section className="bg-[#1E6FA8] px-4 md:px-8 py-16 md:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
        <div className="max-w-[800px] mx-auto relative z-10">
          <span className="inline-block bg-white text-[#1E6FA8] px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]">
            Our Mission
          </span>
          <h2 className="font-sans font-black text-2xl md:text-4xl text-white mt-6 mb-6">
            Bridging the Digital Gap in Our Community
          </h2>
          <p className="text-white/90 leading-relaxed text-base md:text-lg">
            We believe every person deserves access to quality digital services without travelling far or paying too much. Apexbytes Hub is that bridge — bringing printing, design, IT help, and government services to your doorstep.
          </p>
        </div>
      </section>
    </div>
  )
}
