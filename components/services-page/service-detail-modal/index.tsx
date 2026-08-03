"use client"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { motion } from "framer-motion"
import { X, ShareNetwork, Clock } from "@phosphor-icons/react"
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
import { UploadButton, UploadStatus } from "./UploadControl"
import { QuoteControl } from "./QuoteControl"
import { BulkHint } from "./BulkHint"
import { TipsPanel } from "./TipsPanel"
import { getServiceTips } from "./fallback-tips"

const BULK_RIBBON_ORANGE = "#B45309"

type Tab = "bring" | "about" | "tips"

export function ServiceDetailModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [tab, setTab] = useState<Tab>("bring")
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

  // ── Reset local state whenever a new service is opened ──
  useEffect(() => {
    setTab("bring")
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

  // ── File upload handling ──
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

  // ── Derived display values ──
  const colors = HUB_COLORS[svc.hubId as HubKey]
  const accent = isDark ? colors.accentDark : colors.accentLight
  const hubTitle = HUBS[svc.hubId]?.title || svc.sectionTitle
  const naturalLabel = naturalServiceLabel(svc.name, svc.sectionTitle)
  const acceptHint = formatAcceptHint(HUB_ACCEPT[svc.hubId])
  const itemId = `${svc.hubId}-${svc.sectionTitle}-${svc.name}`
  const hasBulk = itemHasBulk(svc.hubId, svc.sectionTitle, svc.name)

  const { tips, isGeneric } = getServiceTips(svc.hubId, svc.sectionTitle, svc.name, svc.tips)
  const tabs: Tab[] = ["bring", "about", "tips"]

  const { amount: baseUnitPrice, unit: priceUnit } = parsePrice(svc.price)
  const effectiveQty = Math.max(quoteQty, 1)
  const effRate = getEffectiveRate(itemId, svc.name, effectiveQty, baseUnitPrice)
  const isBulkDiscount = effRate < baseUnitPrice
  const bulkHint = getBulkHint(itemId, svc.name, effectiveQty, effRate, baseUnitPrice)

  // ── Actions ──
  const handleShare = async () => {
    const shareText = `${naturalLabel} — ${svc.price} at ${BIZ.name}`
    const shareUrl = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${naturalLabel} — ${BIZ.name}`, text: shareText, url: shareUrl })
      } catch {}
      return
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
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

  const waMessage = fileUrl
    ? `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). Price shown: ${svc.price}. My file: ${fileUrl}`
    : `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). Price shown: ${svc.price}. Can you assist?`

  const requirements = svc.requirements?.length ? svc.requirements : ["Just bring your file, document or USB — we'll take care of the rest."]
  const desc = svc.desc?.trim() || null
  const inQuote = quoteQty > 0
  const neutralIconColor = isDark ? "#e4e4e7" : "#3f3f46"

  return (
    <div className="fixed inset-0 z-[10200] flex items-center justify-center p-3 md:p-4">
      <motion.div
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={svc.name}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col outline-none rounded-[14px] overflow-hidden"
        style={{ boxShadow: `0 45px 100px -20px rgba(0,0,0,0.55), 0 20px 48px -14px rgba(0,0,0,0.4), 0 10px 24px -8px ${accent}50` }}
      >
        {hasBulk && (
          <div
            className="absolute top-0 right-0 w-[104px] h-[104px] overflow-hidden pointer-events-none z-10"
            aria-hidden="true"
          >
            <span
              className="absolute block text-center text-[0.66rem] font-black uppercase text-white"
              style={{
                top: "28px",
                right: "-34px",
                width: "150px",
                transform: "rotate(45deg)",
                backgroundColor: BULK_RIBBON_ORANGE,
                padding: "6px 0",
                boxShadow: "0 3px 8px -2px rgba(0,0,0,0.35)",
              }}
            >
              Bulk
            </span>
          </div>
        )}

        {/* ── Header: hub label, title, price ── */}
        <div className="px-6 pt-6 pb-5 flex-shrink-0">
          <div className="flex items-start mb-2">
            <div className="w-[72px] shrink-0" aria-hidden="true" />

            <div className="flex-1 min-w-0 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <HubIcon id={svc.hubId} size={12} color={accent} />
                <span className="text-[0.74rem] font-black uppercase tracking-widest" style={{ color: accent }}>{hubTitle}</span>
              </div>

              <span className="text-[0.74rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2.5 inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>
                {cleanText(svc.sectionTitle)}
              </span>
              <h3 className="abh-card-heading text-[1.32rem] leading-tight">{svc.name}</h3>
            </div>

            <div className="relative z-30 flex items-center justify-end gap-2 shrink-0 w-[72px]">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share this service"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <ShareNetwork size={16} weight="bold" aria-hidden="true" />
              </button>
              {shareCopied && (
                <span className="absolute -bottom-8 right-0 whitespace-nowrap text-[0.74rem] font-black uppercase tracking-widest text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-150">
                  Copied!
                </span>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-5xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span>
            {svc.turnaround && (
              <span className="flex items-center gap-1 text-[0.82rem] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${accent}12`, color: accent }}>
                <Clock size={12} weight="bold" aria-hidden="true" />
                {svc.turnaround}
              </span>
            )}
          </div>
        </div>

        {/* ── Tabs: Needs / Description / Tips ──
            FIXED: previously used a framer-motion `layoutId` shared
            across every instance of this modal to animate the active-tab
            highlight sliding between positions. Because that ID was a
            hardcoded global string, Framer Motion treated it as "the same
            element" across entirely separate modal instances (e.g. after
            closing one service and opening another, or opening the hub
            modal next). That cross-instance layout animation could hang
            mid-transition, which prevented AnimatePresence from ever
            completing the exit animation — so the old modal never
            actually unmounted. It stayed in the DOM, invisible, full-
            screen, and still fully clickable underneath everything else
            — which is exactly what caused hub cards to stop responding,
            WhatsApp to "randomly" fire (it was the stale modal's own
            Request button), and the hub modal to appear to show upload
            UI (that was actually the stuck old modal bleeding through).
            Replaced with a plain, non-shared background-color transition
            — same smooth feel, zero cross-instance risk. */}
        <div className="px-6 pt-1">
          <div
            role="tablist"
            aria-label="Service info sections"
            className="relative flex items-center gap-1 p-1 rounded-[14px] bg-zinc-100 dark:bg-zinc-900"
            style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}
          >
            {tabs.map((t) => {
              const isActive = tab === t
              const label = t === "bring" ? "Needs" : t === "about" ? "Description" : "Tips"
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 py-2.5 rounded-[14px] text-[0.86rem] font-black uppercase tracking-wider transition-all duration-200",
                    !isActive && "text-zinc-500 dark:text-zinc-400"
                  )}
                  style={
                    isActive
                      ? { backgroundColor: accent, color: isDark ? "#0a0a0a" : "#ffffff", boxShadow: `0 4px 14px -4px ${accent}70` }
                      : undefined
                  }
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 min-h-0 text-center">
          {tab === "bring" && (
            <div className="animate-in fade-in duration-150 flex flex-col items-center">
              <ol className="space-y-3 inline-flex flex-col items-start">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-left">
                    <span
                      className={cn("shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.82rem] font-black mt-0.5", isDark ? "text-zinc-900" : "text-white")}
                      style={{ backgroundColor: accent }}
                    >
                      {idx + 1}
                    </span>
                    <span className="abh-body text-base pt-0.5">{req}</span>
                  </li>
                ))}
              </ol>
              <p className="abh-muted mt-5">Not sure? Don't worry — just WhatsApp us first and we'll guide you step by step.</p>
            </div>
          )}
          {tab === "about" && (
            <div className="animate-in fade-in duration-150">
              {desc ? <p className="abh-body text-base">{desc}</p> : <p className="abh-muted text-base">No description available for this service yet.</p>}
              <p className="abh-muted mt-5">
                Have questions? Switch to the <span className="font-black" style={{ color: accent }}>Needs</span> tab or chat with us directly.
              </p>
            </div>
          )}
          {tab === "tips" && (
            <TipsPanel tips={tips} isGeneric={isGeneric} accent={accent} copied={tipsCopied} onCopy={handleCopyTips} />
          )}
        </div>

        {/* ── Footer: upload, quote controls, WhatsApp request ── */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <input ref={fileRef} type="file" accept={HUB_ACCEPT[svc.hubId]} onChange={handleFilePick} className="hidden" />

          <div className="grid grid-cols-2 gap-3">
            <UploadButton phase={uploadPhase} accent={accent} onClick={() => fileRef.current?.click()} />
            <QuoteControl
              inQuote={inQuote}
              quoteQty={quoteQty}
              accent={accent}
              neutralIconColor={neutralIconColor}
              onAdd={handleAddToQuote}
              onStep={handleStepQty}
            />
          </div>

          {bulkHint && (
            <BulkHint
              hint={bulkHint}
              accent={accent}
              isDiscount={isBulkDiscount}
              baseUnitPrice={baseUnitPrice}
              effRate={effRate}
              priceUnit={priceUnit}
            />
          )}

          <UploadStatus
            phase={uploadPhase}
            file={file}
            uploadErr={uploadErr}
            uploadProgress={uploadProgress}
            previewUrl={previewUrl}
            accent={accent}
            acceptHint={acceptHint}
            onClear={clearFile}
            onRetry={() => { setUploadPhase("idle"); setUploadErr(null); fileRef.current?.click() }}
          />

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("request_whatsapp", { hub_id: svc.hubId, service_name: svc.name, section_title: svc.sectionTitle, price: svc.price, had_file_attached: uploadPhase === "done" })}
            className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-[14px] font-black text-base text-white text-center transition-all active:scale-95 shadow-[0_4px_14px_rgba(37,99,235,0.18)]"
            style={{ backgroundColor: "#25D366" }}
          >
            Request {naturalLabel}
          </a>
        </div>
      </motion.div>
    </div>
  )
} 