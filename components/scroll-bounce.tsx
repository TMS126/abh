// components/scroll-bounce.tsx — full file, paste over the current one
"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface ScrollBounceProps {
  children: ReactNode
  className?: string
  delay?: number
}

// Easing = Material Design 3's "Emphasized Decelerate" curve — the one
// Android itself uses for content entering the screen (app icon reveals,
// list items, cards). Cubic-bezier, not a spring: it decelerates into a
// single soft overshoot and settles, rather than oscillating back and
// forth like a spring can. That single-overshoot settle is the specific
// "Android" bounce feel being asked for here.
const ANDROID_EMPHASIZED_DECELERATE: [number, number, number, number] = [0.05, 0.7, 0.1, 1.0]

export function ScrollBounce({ children, className, delay = 0 }: ScrollBounceProps) {
  return (
    <motion.div
      className={className}
      style={{ willChange: "transform, opacity" }}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      // FIX: was `margin: "0px 0px -80px 0px"`, which shrank the trigger
      // zone from the bottom. On mobile, the initial viewport (toolbar
      // visible) is shorter than the real one users see after their first
      // scroll — shrinking it further left above/near-fold cards outside
      // the zone until a scroll forced Framer to recalculate. A positive
      // bottom margin does the opposite: it extends the zone past the
      // visible edge, so content is considered "in view" a little before
      // it's literally on screen — which also covers the mobile toolbar
      // gap instead of getting caught by it. Lowered `amount` too, so a
      // sliver of visibility is enough instead of needing 20% in frame.
      viewport={{ once: true, amount: 0, margin: "0px 0px 200px 0px" }}
      transition={{
        duration: 0.5,
        ease: ANDROID_EMPHASIZED_DECELERATE,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
} 
