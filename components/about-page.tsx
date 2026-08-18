// components/about-page.tsx
"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { BRAND, THEME_BG } from "@/lib/brand"
import { BackToTopButton, useBackToTop } from "@/components/back-to-top-button"
import { ScrollToBottomButton, useScrollToBottom } from "@/components/scroll-to-bottom-button"
import { ensureAccessible, getContrastText } from "@/lib/color"
import { AboutHeader } from "@/components/about/about-header"
import { AboutStory } from "@/components/about/about-story"
import { AboutTeam } from "@/components/about/about-team"
import { AboutStandards } from "@/components/about/about-standards"
import { AboutTestimonials } from "@/components/about/about-testimonials"
import { AboutMission } from "@/components/about/about-mission"

const ABOUT_NEUTRAL = { light: BRAND.dark100, dark: BRAND.techGreyDark }

export function AboutPage() {
  const showBackToTop = useBackToTop()
  const showScrollToBottom = useScrollToBottom()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  const pageBg = isDark ? THEME_BG.dark.page : THEME_BG.light.page
  const cardBg = isDark ? THEME_BG.dark.card : THEME_BG.light.card
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  const orangeColor = isDark ? BRAND.lightOrange : BRAND.orangeDark
  const neutralColor = isDark ? ABOUT_NEUTRAL.dark : ABOUT_NEUTRAL.light

  const blueOnPage = ensureAccessible(blueColor, pageBg, 4.5)
  const blueOnCard = ensureAccessible(blueColor, cardBg, 4.5)
  const orangeOnCard = ensureAccessible(orangeColor, cardBg, 4.5)

  const missionBadgeBg = blueColor
  const missionBadgeText = getContrastText(missionBadgeBg)

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <AboutHeader blueColor={blueColor} blueOnPage={blueOnPage} />
      <AboutStory blueColor={blueColor} blueOnCard={blueOnCard} orangeOnCard={orangeOnCard} cardBg={cardBg} />
      <AboutTeam blueColor={blueColor} />
      <AboutStandards blueColor={blueColor} neutralColor={neutralColor} />
      <AboutTestimonials isDark={isDark} />
      <AboutMission blueOnPage={blueOnPage} missionBadgeBg={missionBadgeBg} missionBadgeText={missionBadgeText} />
      <ScrollToBottomButton visible={showScrollToBottom} />
      <BackToTopButton visible={showBackToTop} />
    </div>
  )
      } 
