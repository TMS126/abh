"use client"

import { useState } from "react"
import { HUBS } from "@/lib/data"

export default function ServicesRoute() {
  const [activeHub, setActiveHub] = useState<keyof typeof HUBS>("print")

  const hub = HUBS[activeHub]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Services</h1>

      {/* HUB SELECT */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(HUBS).map((key) => (
          <button
            key={key}
            onClick={() => setActiveHub(key as keyof typeof HUBS)}
            className="px-4 py-2 border rounded"
          >
            {HUBS[key as keyof typeof HUBS].title}
          </button>
        ))}
      </div>

      {/* SECTIONS */}
      <div className="space-y-6">
        {hub.sections.map((section) => (
          <div key={section.title} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{section.title}</h2>

            <ul className="mt-2 space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  {item.name} - {item.price}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
