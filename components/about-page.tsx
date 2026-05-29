"use client"

export function AboutPage() {
  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-3 via-blue-1 to-[#2980b9] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.2)_0%,transparent_70%)] rounded-full" />
        <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">About Us</h1>
        <p className="text-blue-4 text-base mt-2 relative z-10">A local business built on community, trust, and real help</p>
      </section>

      {/* Main content */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Text */}
          <div>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-blue-3 dark:text-blue-4 leading-tight mb-4">
              Your <span className="text-wa-green">Neighbourhood</span> Digital Hub
            </h2>
            <p className="text-muted-foreground leading-relaxed text-[0.92rem] mb-3">
              Apexbytes Hub is a home-based service business in Kgotsong, Bothaville. We started with one simple goal: make technology and important services accessible to everyone in our community — no jargon, no stress.
            </p>
            <p className="text-muted-foreground leading-relaxed text-[0.92rem] mb-6">
              {"We understand that not everyone is tech-savvy, and that's perfectly okay. That's exactly why we're here — to make things easy, friendly, and affordable, without the judgment."}
            </p>
            
            {/* Values */}
            <div className="flex flex-col gap-4 mt-6">
              {[
                { icon: "🎯", title: "We Keep It Simple", desc: "No confusing jargon. We explain everything in plain language." },
                { icon: "❤️", title: "Community First", desc: "We serve our neighbourhood with pride and genuine care." },
                { icon: "⚡", title: "Fast & Reliable", desc: "We respect your time and always deliver with consistency." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-[11px] bg-green-4 dark:bg-[#1A3010] flex items-center justify-center text-lg shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-blue-3 dark:text-blue-4 text-[0.92rem]">{item.title}</h4>
                    <p className="text-muted-foreground text-[0.82rem] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="bg-gradient-to-br from-blue-1 to-blue-3 rounded-[22px] p-6 md:p-8 text-white">
            <h3 className="font-sans font-black text-xl md:text-2xl">Apexbytes Hub</h3>
            <p className="text-blue-4 text-sm mt-1 mb-6">Serving Kgotsong & surrounding areas</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5", label: "Hubs" },
                { value: "50+", label: "Services" },
                { value: "💬", label: "WhatsApp Ready" },
                { value: "✅", label: "Community Trusted" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 rounded-[13px] p-4 text-center">
                  <div className="font-sans font-black text-2xl md:text-3xl text-wa-green">{stat.value}</div>
                  <div className="text-[0.72rem] text-white/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-secondary px-4 md:px-8 py-12 md:py-14 text-center transition-colors duration-300">
        <div className="max-w-[700px] mx-auto">
          <span className="inline-block bg-blue-4 text-blue-3 px-4 py-1.5 rounded-[20px] text-[0.78rem] font-bold font-sans tracking-wider">
            Our Mission
          </span>
          <h2 className="font-sans font-black text-xl md:text-2xl text-blue-3 dark:text-blue-4 mt-3 mb-4">
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
