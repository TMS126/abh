"use client"

import { useCallback, useEffect, useRef } from "react"

/**
 * Ties an open/close boolean to the browser back button: opening pushes
 * a history entry; pressing back, or calling the returned `dismiss`,
 * closes it. If already closed some other way, `dismiss` just calls
 * setOpen(false) without an extra back navigation.
 */
export function useBackButtonDismiss(open: boolean, setOpen: (v: boolean) => void) {
  const pushedRef = useRef(false)

  useEffect(() => {
    if (open && !pushedRef.current) {
      window.history.pushState({ dismissable: true }, "")
      pushedRef.current = true
    }
    if (!open && pushedRef.current) {
      pushedRef.current = false
    }
  }, [open])

  useEffect(() => {
    const onPop = () => {
      if (pushedRef.current) {
        pushedRef.current = false
        setOpen(false)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [setOpen])

  const dismiss = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    } else {
      setOpen(false)
    }
  }, [setOpen])

  return dismiss
}
