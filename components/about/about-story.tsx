// components/about/about-story.tsx
"use client"

import Image from "next/image"
import { WhatsappLogo, ShieldCheck, UsersThree } from "@phosphor-icons/react"
import { BIZ, ABOUT_VALUES } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"
import { TheNakedTradersZAReveal } from "@/components/about/naked-traderz-reveal"
import { renderIcon } from "@/components/about/about-icons"

export function AboutStory({
  blueColor,
  blueOnCard,
  orangeOnCard,
  cardBg,
}: {
  blueColor: string
  blueOnCard: string
  orangeOnCard: string
  cardBg: string
}) {
  return (
    <section className="px-4 md:px-8 py-14 md:py-16" aria-label="Our story">
      <div className="max-w-[980px] mx-auto">
        <ScrollBounce delay={0.15}>
          <div className="mb-10 text-center max-w-[720px] mx-auto">
            <p className="font-sans font-semibold text-xl md:text-2xl leading-snug text-zinc-700 dark:text-zinc-300">
              "Not everyone is tech-savvy — and that's exactly why we're here."
            </p>
            <p className="abh-body mt-4 text-base max-w-lg mx-auto text-center">
              We started with one goal: make technology, design, and important government services accessible to
              everyone in Kgotsong — no jargon, no stress, no overcharging.
            </p>
            <p className="abh-body mt-4 text-base max-w-lg mx-auto text-center">
              {BIZ.name} is a family-run, home-based multi-service business operating under the P.D.D.E.T.
              framework — Print, Docu, Design, E-Service, and Tech — serving Kgotsong and the greater Bothaville
              area since {BIZ.yearFounded}.
            </p>
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.18}>
          <div className="max-w-[720px] mx-auto mb-14 rounded-[16px] overflow-hidden abh-shadow-elevated">
            <div className="relative aspect-[16/9]">
              <Image
                src="/storefront.webp"
                alt={`${BIZ.name} storefront in Kgotsong, Bothaville`}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${cardBg} 0%, ${cardBg}99 45%, transparent 100%)`,
                }}
                aria-hidden="true"
              />
            </div>
            <div className="bg-card px-6 py-3 sm:px-7 sm:py-8 md:p-8 -mt-px">
              <h3 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-3">How It Started</h3>
              <p className="abh-body text-base leading-relaxed">
                There was no ApexbytesHub yet — just a phone, WhatsApp, and a status update. A friend spotted a
                simple edited image Theji had posted and asked if he could design a logo. That request was for
                "<TheNakedTradersZAReveal accentColor={blueOnCard} accentOrange={orangeOnCard} />" — the very
                first thing Theji ever designed with a vector program, and the first logo he'd ever made for
                anyone.
              </p>
              <p className="abh-body text-base leading-relaxed mt-3">
                It was 2021, maybe early 2022. There was no plan, no brief, no clue where it would lead — just a
                decision to give the person what they'd asked for. That one logo turned into the realization that
                this could be more than a favor. Theji kept going, kept learning, and kept saying yes to the next
                request — until those requests became {BIZ.name}.
              </p>
              <p className="abh-body text-base leading-relaxed mt-3">
                Today he's the owner, the founder — the one who built this from a WhatsApp status into a real hub
                for the community that asked for it first.
              </p>
            </div>
          </div>
        </ScrollBounce>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          <ul className="flex flex-col gap-4 h-full" aria-label="Our values">
            {ABOUT_VALUES.map((item, index) => (
              <li
                key={index}
                className="abh-card abh-shadow-elevated rounded-[14px] p-5 flex flex-row items-center text-left gap-4 flex-1"
              >
                <div className="shrink-0 flex items-center justify-center" style={{ color: blueColor }} aria-hidden="true">
                  {renderIcon(item.iconName, "w-7 h-7")}
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-base text-zinc-800 dark:text-zinc-200 mb-1">{item.title}</h3>
                  <p className="abh-body text-base">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <ScrollBounce delay={0.2}>
            <div className="abh-shadow-elevated rounded-[14px] bg-card p-7 flex flex-col h-full" aria-label="Business overview">
              <div className="flex flex-col items-center text-center gap-2 mb-7 pb-6 border-b border-zinc-100/60 dark:border-zinc-800/40">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${blueColor}15`, color: blueColor }}>
                  <UsersThree size={20} weight="fill" />
                </div>
                <div>
                  <p className="font-sans font-semibold text-base text-zinc-800 dark:text-zinc-200 leading-none">{BIZ.name}</p>
                  <p className="text-[0.74rem] font-medium uppercase tracking-widest text-zinc-400 mt-1.5">Serving Kgotsong &amp; surrounds</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 flex-1">
                {[
                  { value: <WhatsappLogo weight="fill" className="w-6 h-6" aria-hidden="true" />, label: "WhatsApp Ready" },
                  { value: <ShieldCheck weight="fill" className="w-6 h-6" aria-hidden="true" />, label: "Community Trusted" },
                ].map((stat, index) => (
                  <div key={index} className="rounded-[12px] p-5 flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-900/50 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.20)]">
                    <div className="font-black text-2xl mb-1 flex items-center justify-center text-zinc-700 dark:text-zinc-300">{stat.value}</div>
                    <p className="text-[0.72rem] font-medium uppercase tracking-widest text-zinc-400 text-center">{stat.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-[0.86rem] font-medium text-zinc-400 dark:text-zinc-500 mt-6 leading-relaxed text-center">
                Walk-ins welcome · WhatsApp orders accepted · Same-day service on most requests
              </p>
            </div>
          </ScrollBounce>
        </div>
      </div>
    </section>
  )
}
