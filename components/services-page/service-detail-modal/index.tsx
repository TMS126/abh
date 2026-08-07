"use client"

import { useState, useEffect, useRef, type ChangeEvent, type TouchEvent } from "react"
import { X, ShareNetwork, Clock, Lightbulb, Paperclip, ShoppingCartSimple, Plus, Minus } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ } from "@/lib/brand"
import { HUBS } from "@/lib/data"
import { useFocusTrap, HubIcon } from "../shared"
import {
  SelectedService, naturalServiceLabel, cleanText, formatAcceptHint,
  HUB_ACCEPT, CLD_MAX_MB, CLD_PRESET, BLOCKED_MIME_TYPES, BLOCKED_EXTENSIONS, getCldUrl, trackEvent,
} from "../lib"
import { getCartQtyForItem, getEffectiveRate, getBulkHint, parsePrice, itemHasBulk } from "@/components/quote-calculator/lib"
import { UploadStatus } from "./UploadControl"
import { BulkHint } from "./BulkHint"
import { TipsModal } from "./TipsModal"
import { getServiceTips } from "./fallback-tips"

const BULK_RIBBON_ORANGE = "#B45309"

const HEADER_GRID = "grid grid-cols-[36px_1fr_36px] gap-2"

const SWIPE_MIN_DX = 48
const SWIPE_DOMINANCE = 1.4

type Tab = "bring" | "about"

export function ServiceDetailModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [tab, setTab] = useState<Tab>("bring")
  const [tipsOpen, setTipsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [uploadErr, setUploadErr] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [tipsCopied, setTipsCopied] = useState(false)
  const [addedToQuote, setAddedToQuote] = useState(false)
  const [quoteQty, setQuoteQty] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [pressed, setPressed] = useState<"none" | "attach" | "add">("none")

  useEffect(() => {
    setTab("bring")
    setTipsOpen(false)
    setAddedToQuote(false)
    setFile(null)
    setFileUrl(null)
    setUploadPhase("idle")
    setUploadErr(null)
    setUploadProgress(0)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (fileRef.current) fileRef.current.value = ""
    if (svc) setQuoteQty(getCartQtyForItem(`${svc.hubId}-${svc.sectionTitle}-${svc.name}`))
  }, [svc?.name])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useFocusTrap(!!svc, containerRef)

  const doUpload = (f: File) => {
    setUploadPhase("uploading")
    setUploadProgress(0)
    const fd = new FormData()
    fd.append("file", f)
    fd.append("upload_preset", CLD_PRESET)
    const xhr = new XMLHttpRequest()
    xhr.open("POST", getCldUrl(f))
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status < 200 || xhr.status >= 300) throw new Error(data?.error?.message || `HTTP ${xhr.status}`)
        if (!data.secure_url) throw new Error("No URL returned")
        setFileUrl(data.secure_url)
        setUploadPhase("done")
      } catch (err) {
        setUploadErr(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`)
        setUploadPhase("error")
      }
    }
    xhr.onerror = () => {
      setUploadErr("Upload failed: network error")
      setUploadPhase("error")
    }
    xhr.send(fd)
  }

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (BLOCKED_MIME_TYPES.has(f.type) || BLOCKED_EXTENSIONS.test(f.name)) {
      setUploadErr("That file type isn't allowed. Please send a document, image, or PDF only.")
      setUploadPhase("error")
      return
    }
    if (f.size > CLD_MAX_MB * 1024 * 1024) {
      setUploadErr(`File too large — please keep it under ${CLD_MAX_MB}MB.`)
      setUploadPhase("error")
      return
    }
    setFile(f)
    setUploadErr(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (f.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(f))
    doUpload(f)
  }

  const clearFile = () => {
    setFile(null)
    setFileUrl(null)
    setUploadPhase("idle")
    setUploadErr(null)
    setUploadProgress(0)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (fileRef.current) fileRef.current.value = ""
  }

  if (!svc) return null

  const colors = HUB_COLORS[svc.hubId as HubKey]
  const accent = isDark ? colors.accentDark : colors.accentLight
  const hubTitle = HUBS[svc.hubId]?.title || svc.sectionTitle
  const naturalLabel = naturalServiceLabel(svc.name, svc.sectionTitle)
  const acceptHint = formatAcceptHint(HUB_ACCEPT[svc.hubId])
  const itemId = `${svc.hubId}-${svc.sectionTitle}-${svc.name}`
  const hasBulk = itemHasBulk(svc.hubId, svc.sectionTitle, svc.name)

  const { tips, isGeneric } = getServiceTips(svc.hubId, svc.sectionTitle, svc.name, svc.tips)
  const tabs: Tab[] = ["bring", "about"]

  const { amount: baseUnitPrice, unit: priceUnit } = parsePrice(svc.price)
  const effectiveQty = Math.max(quoteQty, 1)
  const effRate = getEffectiveRate(itemId, svc.name, effectiveQty, baseUnitPrice)
  const isBulkDiscount = effRate < baseUnitPrice
  const bulkHint = getBulkHint(itemId, svc.name, effectiveQty, effRate, baseUnitPrice)

  const handleShare = async () => {
    const shareText = `${naturalLabel} — ${svc.price} at ${BIZ.name}`
    const shareUrl = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${naturalLabel} — ${BIZ.name}`, text: shareText, url: shareUrl })
      } catch {}
      return
  }

  const handleCopyTips = async () => {
    if (!tips.length) return
    const text = tips.map((t) => `• ${t}`).join("\n")
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        setTipsCopied(true)
        setTimeout(() => setTipsCopied(false), 2000)
      } catch {}
    }
  }

  const handleAddToQuote = () => {
    window.dispatchEvent(
      new CustomEvent("abh:add-to-quote", { detail: { hubId: svc.hubId, sectionTitle: svc.sectionTitle, name: svc.name, price: svc.price } })
    )
    trackEvent("add_to_quote", { hub_id: svc.hubId, service_name: svc.name, section_title: svc.sectionTitle, price: svc.price })
    setAddedToQuote(true)
    setTimeout(() => setAddedToQuote(false), 2200)
    setQuoteQty((prev) => prev + 1)
  }

  const handleStepQty = (delta: number) => {
    const nextQty = Math.max(0, quoteQty + delta)
    window.dispatchEvent(new CustomEvent("abh:step-quote-qty", { detail: { id: itemId, delta } }))
    setQuoteQty(nextQty)
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < SWIPE_MIN_DX || Math.abs(dx) < Math.abs(dy) * SWIPE_DOMINANCE) return
    const idx = tabs.indexOf(tab)
    if (dx < 0 && idx < tabs.length - 1) setTab(tabs[idx + 1])
    else if (dx > 0 && idx > 0) setTab(tabs[idx - 1])
  }

  const waMessage = fileUrl
    ? `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). Price shown: ${svc.price}. My file: ${fileUrl}`
    : `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). Price shown: ${svc.price}. Can you assist?`

  const requirements = svc.requirements?.length ? svc.requirements : ["Just bring your file, document or USB — we'll take care of the rest."]
  const desc = svc.desc?.trim() || null
  const inQuote = quoteQty > 0
  const neutralIconColor = isDark ? "#e4e4e7" : "#3f3f46"

  const pressedTransform = "translateY(1px) scale(0.995)"
  const normalTransform = "translateY(0) scale(1)"
  const pressedBoxShadow = "inset 0 2px 6px rgba(0,0,0,0.12)"
  const normalBoxShadow = "0 10px 30px -12px rgba(0,0,0,0.12)"

  return (
    <div className="fixed inset-0 z-[10200] flex items-center justify-center p-3 md:p-4">
      <div className="absolute inset-0 bg-black/55 animate-in fade-in duration-200" onClick={onClose} />

      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={svc.name}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col outline-none rounded-[14px] overflow-hidden"
        style={{ boxShadow: "0 45px 100px -20px rgba(0,0,0,0.55), 0 20px 48px -14px rgba(0,0,0,0.4)" }}
      >
        {hasBulk && (
          <div className="absolute top-0 right-0 w-[104px] h-[104px] overflow-hidden pointer-events-none z-10" aria-hidden="true">
            <span
              className="absolute block text-center text-[0.66rem] font-black uppercase tracking-widest text-white"
              style={{
                top: "28px", right: "-34px", width: "150px", transform: "rotate(45deg)",
                backgroundColor: BULK_RIBBON_ORANGE, padding: "6px 0",
                boxShadow: "0 3px 8px -2px rgba(0,0,0,0.35)",
              }}
            >
              Bulk
            </span>
          </div>
        )}

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-5 flex-shrink-0">
          {/* Title row — uses the same 3-col rail as the rows below it so
              every row's right-edge icon column lines up exactly. */}
          <div className={cn(HEADER_GRID, "items-start mb-2")}>
            <div aria-hidden="true" />
            <div className="min-w-0 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <HubIcon id={svc.hubId} size={12} color={accent} />
                <span className="text-[0.74rem] font-black uppercase tracking-widest" style={{ color: accent }}>{hubTitle}</span>
              </div>
              <span
{