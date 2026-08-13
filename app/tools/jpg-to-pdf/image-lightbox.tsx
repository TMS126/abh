// app/tools/jpg-to-pdf/image-lightbox.tsx
"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { X } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"

// Closes via: backdrop tap, Esc key, X button, or the device/browser back
// gesture (we push a history entry on open and listen for popstate).
export function ImageLightbox({
  imageUrl, fileName, rotation, onClose,
}: {
  imageUrl: string | null
  fileName?: string
  rotation?: number
  onClose: () => void
}) {
  const pushedRef = useRef(false)

  useEffect(() => {
    if (!imageUrl) return
    window.history.pushState({ abhZoom: true }, "")
    pushedRef.current = true
    function onPopState() { pushedRef.current = false; onClose() }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") requestClose() }
    window.addEventListener("popstate", onPopState)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("popstate", onPopState)
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  function requestClose() {
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={fileName ? `Full size view of ${fileName}` : "Full size image"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/85" onClick={requestClose} aria-hidden="true" />
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative w-full h-full max-w-3xl max-h-[85vh]"
            style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
          >
            <Image src={imageUrl} alt={fileName || "Uploaded image"} fill className="object-contain" unoptimized />
          </motion.div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close full size image"
            className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={20} weight="bold" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
