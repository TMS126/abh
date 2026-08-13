// components/about/about-team.tsx
"use client"

import { WhatsappLogo } from "@phosphor-icons/react"
import { BIZ } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"

const TEAM = [
  { initials: "TM", name: "Theji M.", role: "Owner", note: "Runs Everything" },
  { initials: "FK", name: "Faith K.", role: "Print & Docu Hub Assistant", note: "Helps with printing, copying,  laminating & sending emails" },
  { initials: "MM", name: "Macky M.", role: "Print Hub Assistant", note: "Helps with printing, copying, typing services" },
  { initials: "RK", name: "Rethabile K.", role: "Print Hub Assistant", note: "Helps with copying, printing, laminating & sending emails" },
] as const

export function AboutTeam({ blueColor }: { blueColor: string }) {
  return (
    <section className="px-4 md:px-8 py-14 md:py-16 border-t border-zinc-100 dark:border-zinc-800/60" aria-labelledby="team-title">
      <div className="max-w-[680px] mx-auto">
        <ScrollBounce>
          <div className="text-center mb-6">
            <h2 id="team-title" className="font-sans font-black text-3xl md:text-4xl tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
              Who Runs {BIZ.name}
            </h2>
            <p className="abh-tagline max-w-md mx-auto text-center">
              Family-run, hands-on service — every hub staffed by someone who lives right here in Kgotsong.
            </p>
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.05}>
          <div className="flex justify-center mb-10">
            <a
              href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I'd like to get in touch.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 text-[0.88rem] font-bold text-zinc-600 dark:text-zinc-300 hover:border-brand-whatsapp hover:text-brand-whatsapp hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 shadow-sm"
            >
              <WhatsappLogo size={16} weight="fill" className="text-brand-whatsapp" aria-hidden="true" />
              Chat with the team on WhatsApp
            </a>
          </div>
        </ScrollBounce>

        <ul className="flex flex-col gap-5" aria-label="Team members">
          {TEAM.map((member, index) => {
            const card = (
              <li key={member.initials} className="abh-card p-6 flex items-center text-left gap-4 shadow-md">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg shrink-0"
                  style={{ backgroundColor: `${blueColor}15`, color: blueColor }}
                  aria-hidden="true"
                >
                  {member.initials}
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-base text-zinc-800 dark:text-zinc-200">{member.name}</h3>
                  <p className="text-[0.78rem] font-black uppercase tracking-widest mt-1" style={{ color: blueColor }}>
                    {member.role}
                  </p>
                  <p className="abh-body text-sm mt-2 leading-relaxed">{member.note}</p>
                </div>
              </li>
            )
            return index === 0 ? card : (
              <ScrollBounce key={member.initials} delay={index * 0.1}>
                {card}
              </ScrollBounce>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
