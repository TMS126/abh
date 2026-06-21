"use client"

// Tiny shared coordinator so floating widgets (WhatsApp FAB, Quote Calculator,
// and any future ones) can enforce "only one open at a time" without prop
// drilling or a full Context provider rewrite. Each widget calls
// `useExclusiveWidget(id)` and gets back the open state + a setter; setting
// one widget open automatically closes any other registered widget.

import { useEffect, useState, useCallback } from "react"

const EVENT_NAME = "abh-widget-open"

export function useExclusiveWidget(widgetId: string) {
  const [isOpen, setIsOpenState] = useState(false)

  useEffect(() => {
    const onOtherOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string }
      if (detail.id !== widgetId) setIsOpenState(false)
    }
    window.addEventListener(EVENT_NAME, onOtherOpen)
    return () => window.removeEventListener(EVENT_NAME, onOtherOpen)
  }, [widgetId])

  const setIsOpen = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    setIsOpenState((prev) => {
      const resolved = typeof next === "function" ? (next as (p: boolean) => boolean)(prev) : next
      if (resolved) {
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { id: widgetId } }))
      }
      return resolved
    })
  }, [widgetId])

  return [isOpen, setIsOpen] as const
}
