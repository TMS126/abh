"use client"

import { useState } from "react"
import { Image as ImageIcon } from "@phosphor-icons/react"
import { HUB_COLORS, type HubKey } from "@/lib/brand"
import { HUBS, PROJECTS, type HubId } from "@/lib/data"
import { SafeImage } from "./safe-image"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]
const VISIBLE_COUNT = 3

export function HubCollectionsGrid({
  isDark, onSelectHub,
}: {
  isDark: boolean
  onSelectHub: (hubId: HubId) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const hubCards = HUB_ORDER.map(hubId => {
    const hubProjects = PROJECTS.filter(p => p.hub === hubId)
    if (hubProjects.length === 0) return null

    const accent = isDark ? HUB_COLORS[hubId as HubKey].accentDark : HUB_COLORS[hubId as HubKey].accentLight
    const mainImage = hubProjects[0].image

    const seen = new Set([mainImage])
    const thumbnails: string[] = []
    for (const p of hubProjects) {
      const imgs = p.images?.length ? p.images : [p.image]
      for (const img of imgs) {
        if (!seen.has(img)) { seen.add(img); thumbnails.push(img) }
        if (thumbnails.length >= 3) break
      }
      if (thumbnails.length >= 3) break
    }

    return {
      hubId,
      title: HUBS[hubId].title,
      count: hubProjects.length,
      mainImage,
      thumbnails,
      accent,
    }
  }).filter((h): h is NonNullable<typeof h> => h !== null)

  const visible   = expanded ? hubCards : hubCards.slice(0, VISIBLE_COUNT)
  const remaining = hubCards.length - VISIBLE_COUNT

  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-3 gap-6">
        {visible.map(hub => (
          <button
            key={hub.hubId}
            onClick={() => onSelectHub(hub.hubId)}
            aria-label={`View ${hub.title} projects`}
            className="text-left rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all duration-300 p-3 group"
          >
            <div className="relative aspect-[4/3] rounded-[14px] overflow-hidden mb-3">
              <SafeImage
                src={hub.mainImage}
                alt={hub.title}
                accent={hub.accent}
                fill
                sizes="(max-width: 1024px) 33vw, 400px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {hub.thumbnails.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {hub.thumbnails.map((thumb, i) => (
                  <div key={i} className="relative aspect-square rounded-[10px] overflow-hidden">
                    <SafeImage
                      src={thumb}
                      alt={`${hub.title} example ${i + 1}`}
                      accent={hub.accent}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between px-1 pb-1">
              <h3 className="font-sans font-black text-lg text-zinc-900 dark:text-zinc-50">{hub.title}</h3>
              <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                <ImageIcon size={14} weight="fill" aria-hidden="true" />
                {hub.count}
              </span>
            </div>
          </button>
        ))}
      </div>

      {!expanded && remaining > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setExpanded(true)}
            className="px-5 py-2.5 rounded-full text-sm font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {remaining}+ more
          </button>
        </div>
      )}
    </div>
  )
}
