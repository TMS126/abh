"use client"

// Tiny shared coordinator so floating widgets (WhatsApp FAB, Quote Calculator,
// and any future ones) can enforce "only one open at a time" without prop
// drilling or a full Context provider rewrite. Each widget calls
// `useExclusiveWidget(id)` and gets back its own open state + a setter, plus
// `isOtherOpen` so it can hide its own FAB entirely while a different widget
// is open. Setting one widget open automatically closes any other registered
// widget and notifies them all of who's currently open.

import { useEffect, useState, useCallback } from "react"

const EVENT_NAME = "abh-widget-open"

export function useExclusiveWidget(widgetId: string) {
  const [isOpen, setIsOpenState] = useState(false)
  const [openWidgetId, setOpenWidgetId] = useState<string | null>(null)

  useEffect(() => {
    const onOtherOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string | null }
      setOpenWidgetId(detail.id)
      if (detail.id !== widgetId) setIsOpenState(false)
    }
    window.addEventListener(EVENT_NAME, onOtherOpen)
    return () => window.removeEventListener(EVENT_NAME, onOtherOpen)
  }, [widgetId])

  const setIsOpen = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    setIsOpenState((prev) => {
      const resolved = typeof next === "function" ? (next as (p: boolean) => boolean)(prev) : next
      const nextId = resolved ? widgetId : null
      setOpenWidgetId(nextId)
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { id: nextId } }))
      return resolved
    })
  }, [widgetId])

  const isOtherOpen = openWidgetId !== null && openWidgetId !== widgetId

  return [isOpen, setIsOpen, isOtherOpen] as const
}
