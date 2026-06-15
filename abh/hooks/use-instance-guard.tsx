"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

export type InstanceKey = "hub-card" | "hub-section" | "faq" | "footer" | "profile" | "terms" | "modal" | null

interface GuardCtx {
  active: InstanceKey
  activate: (key: InstanceKey) => boolean
  deactivate: (key: InstanceKey) => void
  canActivate: (key: InstanceKey) => boolean
}

const InstanceGuardContext = createContext<GuardCtx>({
  active: null,
  activate: () => false,
  deactivate: () => {},
  canActivate: () => false,
})

export function InstanceGuardProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<InstanceKey>(null)

  const canActivate = useCallback((key: InstanceKey) => {
    if (active === key) return true
    return active === null
  }, [active])

  const activate = useCallback((key: InstanceKey) => {
    if (active === key) return true
    if (active !== null) return false
    setActive(key)
    return true
  }, [active])

  const deactivate = useCallback((key: InstanceKey) => {
    setActive(prev => prev === key ? null : prev)
  }, [])

  return (
    <InstanceGuardContext.Provider value={{ active, activate, deactivate, canActivate }}>
      {children}
    </InstanceGuardContext.Provider>
  )
}

export function useInstanceGuard() {
  return useContext(InstanceGuardContext)
}

export function useInstance(key: InstanceKey) {
  const { active, activate, deactivate } = useInstanceGuard()
  const isActive = active === key

  const open = useCallback(() => {
    activate(key)
  }, [key, activate])

  const close = useCallback(() => {
    deactivate(key)
  }, [key, deactivate])

  const toggle = useCallback(() => {
    if (isActive) deactivate(key)
    else activate(key)
  }, [isActive, key, activate, deactivate])

  return { isActive, open, close, toggle, activeKey: active }
}

export function useInstanceConditional(key: InstanceKey) {
  const { active, activate, deactivate } = useInstanceGuard()

  const canActivate = useCallback(() => {
    if (active === key) return true
    return active === null
  }, [active, key])

  const request = useCallback(() => {
    if (active === key) return true
    if (active !== null) return false
    activate(key)
    return true
  }, [active, key, activate])

  const release = useCallback(() => {
    deactivate(key)
  }, [key, deactivate])

  return { request, release, canActivate }
}
