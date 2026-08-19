// components/scroll-bounce.tsx
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
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -80px 0px" }}
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
