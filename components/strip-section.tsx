"use client"

export function StripSection() {
  const items = [
    { icon: "🚀", title: "Fast Turnaround", desc: "No long waits, quick service" },
    { icon: "💰", title: "Affordable Rates", desc: "Fair pricing for everyone" },
    { icon: "🤝", title: "Friendly Help", desc: "We explain, never judge" },
    { icon: "📍", title: "Walk-ins Welcome", desc: "Kgotsong, Bothaville 9660" },
  ]

  return (
    <section className="bg-secondary py-10 md:py-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-4 transition-all duration-200 ease-in-out hover:-translate-y-1">
            <div className="w-[50px] h-[50px] bg-card rounded-[13px] flex items-center justify-center text-2xl shadow-[var(--shadow)] shrink-0 transition-transform duration-200 ease-in-out">
              {item.icon}
            </div>
            <div>
              <h4 className="font-sans font-bold text-blue-3 dark:text-blue-4 text-[0.92rem]">{item.title}</h4>
              <p className="text-muted-foreground text-[0.78rem] mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

interface CtaBarProps {
  title: string
  description: string
  buttonText: string
  buttonHref?: string
  onButtonClick?: () => void
}

export function CtaBar({ title, description, buttonText, buttonHref, onButtonClick }: CtaBarProps) {
  return (
    <section className="bg-gradient-to-r from-green-3 to-green-1 py-10 px-4 md:px-8 text-center text-white">
      <h2 className="font-sans font-black text-xl md:text-2xl mb-2">{title}</h2>
      <p className="text-green-4 mb-5 text-[0.95rem]">{description}</p>
      {buttonHref ? (
        <a
          href={buttonHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-[28px] font-sans font-extrabold text-[0.95rem] bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(37,211,102,0.4)]"
        >
          {buttonText}
        </a>
      ) : (
        <button
          onClick={onButtonClick}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-[28px] font-sans font-extrabold text-[0.95rem] bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(37,211,102,0.4)]"
        >
          {buttonText}
        </button>
      )}
    </section>
  )
} 
