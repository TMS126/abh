"use client"

import { useState } from "react"
import { Image as ImageIcon } from "@phosphor-icons/react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function ImagePlaceholder({ accent, label }: { accent: string; label?: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none"
      style={{ background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 60%, transparent 100%)` }}
    >
      <div className="absolute w-48 h-48 rounded-full opacity-10" style={{ border: `2px solid ${accent}`, top: "10%", right: "-10%" }} />
      <div className="absolute w-28 h-28 rounded-full opacity-10" style={{ border: `2px solid ${accent}`, bottom: "5%", left: "-5%" }} />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center abh-shadow-icon-inset" style={{ backgroundColor: `${accent}20`, border: `1.5px solid ${accent}30` }}>
        <ImageIcon size={26} weight="thin" style={{ color: accent }} />
      </div>
      <p className="text-xs font-bold tracking-wider uppercase opacity-60" style={{ color: accent }}>{label ?? "No image"}</p>
    </div>
  )
}

export function SafeImage({ src, alt, accent, fill, sizes, className, priority = false }: {
  src: string; alt: string; accent: string
  fill?: boolean; sizes?: string; className?: string; priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  if (!src || src === "" || failed) return <ImagePlaceholder accent={accent} label={alt} />
  return (
    <>
      {!loaded && <ImagePlaceholder accent={accent} label={alt} />}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        className={cn(className, "transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        loading={priority ? undefined : "lazy"}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
        priority={priority}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}
