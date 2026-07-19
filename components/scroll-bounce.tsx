"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface ScrollBounceProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollBounce({ children, className, delay = 0 }: ScrollBounceProps) {
  return (
    <motion.div
      className={className}
      style={{ willChange: "transform, opacity" }}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -80px 0px" }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 22,
        mass: 0.6,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
