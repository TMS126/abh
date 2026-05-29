"use client"

interface GalleryPageProps {
  onNavigate: (page: string) => void
}

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-3 via-blue-1 to-[#2980b9] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.2)_0%,transparent_70%)] rounded-full" />
        <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">Gallery & Portfolio</h1>
        <p className="text-blue-4 text-base mt-2 relative z-10">Bringing your ideas to life with quality and care</p>
      </section>

      {/* Content */}
      <section className="px-4 md:px-8 py-16 md:py-20">
        <div className="text-center max-w-[600px] mx-auto">
          <h3 className="font-sans font-black text-2xl md:text-3xl text-blue-3 dark:text-blue-4 mb-4">
            🎨 Something Amazing This Way Comes
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed mb-6">
            {"We're currently curating our best work and project showcase. In the meantime, explore our services above or "}
            <button 
              onClick={() => onNavigate("contact")}
              className="text-wa-green font-bold hover:underline cursor-pointer"
            >
              reach out to see live examples
            </button>
            {" of what we can create."}
          </p>
          <p className="text-muted-foreground/70 text-sm mt-6">
            {"Every project tells a story. Let's write yours together."}
          </p>
        </div>
      </section>
    </div>
  )
}
