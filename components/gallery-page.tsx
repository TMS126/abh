"use client"

interface GalleryPageProps {
  onNavigate: (page: string) => void
}

const comingSoonItems = [
  { icon: "🖨️", label: "Print Jobs", desc: "Bulk printing, photo prints & more" },
  { icon: "📄", label: "CV & Documents", desc: "Professional CVs & typed letters" },
  { icon: "🎨", label: "Logo & Branding", desc: "Business cards, logos & flyers" },
  { icon: "🌐", label: "E-Service Assists", desc: "SASSA, SARS, UIF & more" },
  { icon: "💻", label: "Tech Work", desc: "Windows installs & repairs" },
  { icon: "🎉", label: "Invitations", desc: "Static & video event invites" },
]

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  return (
    <div className="animate-fade-up">
      <section className="bg-gradient-to-br from-blue-3 via-blue-1 to-[#2980b9] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.2)_0%,transparent_70%)] rounded-full" />
        <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">Gallery & Portfolio</h1>
        <p className="text-blue-4 text-base mt-2 relative z-10">Real work, real people, real results</p>
      </section>

      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#FEF3C7] text-[#B86F34] px-4 py-1.5 rounded-[20px] text-[0.78rem] font-bold font-sans tracking-wider mb-3">
              PORTFOLIO LOADING
            </span>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-blue-3 dark:text-blue-4 mb-3">
              Our Work Speaks for Itself
            </h2>
            <p className="text-muted-foreground text-[0.92rem] leading-relaxed max-w-[520px] mx-auto">
              {"We're putting together our best projects. In the meantime, here's a taste of what we do every day — and what we can do for you."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {comingSoonItems.map((item) => (
              <div
                key={item.label}
                className="bg-card border-2 border-[var(--card-border)] rounded-[18px] p-6 text-center transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(30,111,168,0.12)]"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-sans font-black text-blue-3 dark:text-blue-4 text-[0.95rem] mb-1">{item.label}</h4>
                <p className="text-muted-foreground text-[0.8rem]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-muted-foreground text-[0.88rem] mb-4">Want to see examples before you order?</p>
            <button
              onClick={() => onNavigate("contact")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[28px] font-sans font-extrabold text-[0.92rem] bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.3)]"
            >
              Ask Us on WhatsApp
            </button>
          </div>
        </div>
      </section>
    </div>
  )
} 
