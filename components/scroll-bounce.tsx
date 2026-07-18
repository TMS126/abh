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
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 14,
        mass: 0.9,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
