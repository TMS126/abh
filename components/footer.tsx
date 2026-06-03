"use client"

interface FooterProps {
  onNavigate: (page: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const pages = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "about", label: "About Us" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ]

  return (
    <footer className="bg-[var(--footer-bg)] text-white px-4 md:px-8 py-10 md:py-12 transition-colors duration-300">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-sans font-black text-xl md:text-2xl mb-2">
            Apexbytes<span className="text-[#F4A261]">Hub</span>
          </h3>
          <p className="text-blue-4 text-[0.83rem] leading-relaxed">
            Your local tech and print partner in Kgotsong. Five hubs, 50+ services — all in one friendly place.
          </p>
          <p className="text-blue-4 text-[0.83rem] mt-3">
          
          </p>
        </div>

        <div>
          <h4 className="font-sans font-bold text-[0.85rem] text-orange-4 mb-4 tracking-wider uppercase">
            Pages
          </h4>
          <ul className="flex flex-col gap-2">
            {pages.map((page) => (
              <li
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className="text-blue-4 text-[0.83rem] cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {page.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-sans font-bold text-[0.85rem] text-orange-4 mb-4 tracking-wider uppercase">
            Contact
          </h4>
          <ul className="flex flex-col gap-2">
            <li className="text-blue-4 text-[0.83rem]">📱 075 333 8260</li>
            <li className="text-blue-4 text-[0.83rem]">✉️ apexbytesza@gmail.com</li>
            <li className="text-blue-4 text-[0.83rem]">📍 Kgotsong, 9660</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto border-t border-white/10 pt-5 flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
        <p className="text-blue-4 text-[0.78rem]">© 2026 Apexbytes Hub. All rights reserved.</p>
        <p className="text-blue-4 text-[0.78rem]">Made with ❤️ for the Kgotsong community</p>
      </div>
    </footer>
  )
}
