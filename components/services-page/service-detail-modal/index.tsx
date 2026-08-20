/* components/services-page/service-detail-modal/index.tsx */
"use client"

import { useState, useEffect, useRef, type ChangeEvent, type TouchEvent } from "react"
import { X, ShareNetwork, Clock, Lightbulb, WarningCircle } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, BRAND } from "@/lib/brand"
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
import { TipsModal } from "./TipsModal"
import { NoticeModal } from "./NoticeModal"
import { getServiceTips } from "./fallback-tips"

// ── Layout constants ──
const BULK_RIBBON_BLUE = BRAND.blue
const HEADER_GRID = "grid grid-cols-[36px_1fr_36px] gap-2"
const SWIPE_MIN_DX = 48
const SWIPE_DOMINANCE = 1.4

// Shared focus-visible ring so keyboard users can see where they are —
// none of the icon buttons had this before (mouse-only affordance).
const ICON_BTN_FOCUS = "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"

type Tab = "bring" | "about"

export function ServiceDetailModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [tab, setTab] = useState<Tab>("bring")
  const [tipsOpen, setTipsOpen] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)

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

  useEffect(() => {
    setTab("bring")
    setTipsOpen(false)
    setNoticeOpen(false)
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

  // Escape closes the innermost open layer first (Tips/Notice sub-modals
  // already handle their own Escape internally and call stopPropagation
  // via their own listener order — this only fires the main modal's
  // close when neither sub-modal is open, so Esc never skips a layer).
  useEffect(() => {
    if (!svc) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (tipsOpen || noticeOpen) return
      onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [svc, tipsOpen, noticeOpen, onClose])

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
        // Only trust a URL back from Cloudinary's own domain — defends
        // against a compromised/misconfigured endpoint handing back an
        // arbitrary URL that later gets sent straight into a WhatsApp
        // message link.
        if (!/^https:\/\/res\.cloudinary\.com\//.test(data.secure_url)) {
          throw new Error("Unexpected upload response")
        }
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
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/services?${new URLSearchParams({
          hub: svc.hubId,
          section: svc.sectionTitle,
          service: svc.name,
        }).toString()}`
      : ""
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

  return (
    <div className="fixed inset-0 z-[10200] flex items-center justify-center p-3 md:p-4">
      <div className="absolute inset-0 bg-black/55 animate-in fade-in duration-200" onClick={onClose} />

      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={svc.name}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col outline-none rounded-[14px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 45px 100px -20px rgba(0,0,0,0.55), 0 20px 48px -14px rgba(0,0,0,0.4)" }}
      >
        {hasBulk && (
          <div className="absolute top-0 right-0 w-[104px] h-[104px] overflow-hidden pointer-events-none z-10" aria-hidden="true">
            <span
              className="absolute block text-center text-[0.66rem] font-black uppercase text-white"
              style={{
                top: "28px", right: "-34px", width: "150px", transform: "rotate(45deg)",
                backgroundColor: BULK_RIBBON_BLUE, padding: "6px 0",
                boxShadow: "0 4px 10px -2px rgba(30,111,168,0.55), 0 2px 4px -1px rgba(0,0,0,0.25)",
              }}
            >
              Bulk
            </span>
          </div>
        )}

        {/* ══════════════════ TOP-RIGHT ICON STACK ══════════════════
            When a bulk ribbon is present it occupies the full top-right
            104×104 corner (diagonal band cuts straight through the old
            top-5/right-5 position). Pushing the stack down below that
            zone — instead of just stacking z-index on top of it — keeps
            the ribbon fully legible and the buttons fully tappable,
            with real spacing between the two instead of an overlap. */}
        <div
          className={cn(
            "absolute right-5 z-20 flex flex-col items-center gap-1.5",
            hasBulk ? "top-28" : "top-5"
          )}
        >
          {svc.notice && (
            <button
              type="button"
              onClick={() => setNoticeOpen(true)}
              aria-label="View service notice"
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95",
                ICON_BTN_FOCUS
              )}
              style={{ backgroundColor: `${BRAND.orange}15`, color: BRAND.orange }}
            >
              <WarningCircle size={18} weight="fill" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setTipsOpen(true)}
            aria-label="View helpful tips"
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 active:scale-95",
              ICON_BTN_FOCUS
            )}
          >
            <Lightbulb size={18} weight="fill" aria-hidden="true" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this service"
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150 active:scale-95",
                ICON_BTN_FOCUS
              )}
            >
              <ShareNetwork size={16} weight="bold" aria-hidden="true" />
            </button>
            {shareCopied && (
              <span
                role="status"
                aria-live="polite"
                className="absolute top-1/2 -translate-y-1/2 right-11 whitespace-nowrap text-[0.74rem] font-black uppercase tracking-widest text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-150"
              >
                Copied!
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150 active:scale-95",
              ICON_BTN_FOCUS
            )}
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        {/* ══════════════════ HEADER ══════════════════ */}
        <div className="px-6 pt-6 pb-5 flex-shrink-0">
          <div className={cn(HEADER_GRID, "items-start mb-2")}>
            <div aria-hidden="true" />
            <div className="min-w-0 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <HubIcon id={svc.hubId} size={11} color={accent} />
                <span className="text-[0.72rem] font-black uppercase tracking-widest" style={{ color: accent }}>{hubTitle}</span>
              </div>
              <span className="text-[0.72rem] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2.5 inline-block">
                {cleanText(svc.sectionTitle)}
              </span>
              <h3 className="abh-card-heading text-[1.28rem] leading-tight">{svc.name}</h3>
            </div>
            <div aria-hidden="true" />
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

          <div className={cn(HEADER_GRID, "items-start")}>
            <div aria-hidden="true" />
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-5xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span>
              {svc.turnaround && (
                <span
                  className="flex items-center gap-1 text-[0.82rem] font-bold pb-0.5 border-b"
                  style={{ color: accent, borderColor: `${accent}50` }}
                >
                  <Clock size={12} weight="bold" aria-hidden="true" />
                  {svc.turnaround}
                </span>
              )}
            </div>
            <div aria-hidden="true" />
          </div>
        </div>

        {/* ══════════════════ TABS ("Needs" / "Description") ══════════════════ */}
        <div className="px-6 pt-1">
          <div className={cn(HEADER_GRID, "items-center")}>
            <div aria-hidden="true" />
            <div role="tablist" aria-label="Service info sections" className="flex items-center justify-center gap-6 border-b border-zinc-100 dark:border-zinc-800">
              {tabs.map((t) => {
                const isActive = tab === t
                const label = t === "bring" ? "Needs" : "Description"
                return (
                  <button
                    key={t}
                    id={`svc-tab-${t}`}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls={`svc-tabpanel-${t}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setTab(t)}
                    className={cn(
                      "py-2.5 text-[0.95rem] font-black uppercase tracking-wider transition-colors duration-200 border-b-2 -mb-px focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                      isActive ? "border-current" : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                    )}
                    style={isActive ? { color: accent } : undefined}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <div aria-hidden="true" />
          </div>
        </div>

        {/* ══════════════════ TAB CONTENT ══════════════════ */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 min-h-0 text-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {tab === "bring" && (
            <div
              id="svc-tabpanel-bring"
              role="tabpanel"
              aria-labelledby="svc-tab-bring"
              className="animate-in fade-in duration-150 flex flex-col items-center w-full"
            >
              <ol className="w-full list-none">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 py-2 text-left">
                    <span className="shrink-0 font-black text-[0.8rem] text-zinc-400 dark:text-zinc-500 mt-0.5 w-4 text-right" aria-hidden="true">
                      {idx + 1}.
                    </span>
                    <span className="abh-body text-[0.95rem] leading-relaxed">{req}</span>
                  </li>
                ))}
              </ol>
              <p className="abh-muted text-[0.88rem] mt-4 text-center">Not sure? Don&apos;t worry — just WhatsApp us first and we&apos;ll guide you step by step.</p>
            </div>
          )}
          {tab === "about" && (
            <div
              id="svc-tabpanel-about"
              role="tabpanel"
              aria-labelledby="svc-tab-about"
              className="animate-in fade-in duration-150"
            >
              {desc ? <p className="abh-body text-base">{desc}</p> : <p className="abh-muted text-base">No description available for this service yet.</p>}
              <p className="abh-muted mt-5">
                Have questions? Switch to the <span className="font-black" style={{ color: accent }}>Needs</span> tab or chat with us directly.
              </p>
            </div>
          )}
        </div>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <div className="px-6 pb-8 pt-4 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <input ref={fileRef} type="file" accept={HUB_ACCEPT[svc.hubId]} onChange={handleFilePick} className="hidden" />

          <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
            <UploadButton phase={uploadPhase} accent={accent} onClick={() => fileRef.current?.click()} />
            <div className="w-px bg-zinc-200 dark:bg-zinc-700/60" aria-hidden="true" />
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
            className={cn(
              "flex items-center justify-center gap-2 w-full px-4 py-4 rounded-[14px] font-black text-base text-white text-center transition-all active:scale-95",
              ICON_BTN_FOCUS
            )}
            style={{ backgroundColor: "#25D366" }}
          >
            Request {naturalLabel}
          </a>

          {svc.hubId === "eservice" && (
            <p className="text-[0.78rem] text-center text-zinc-400 dark:text-zinc-500 leading-relaxed pt-1">
              NSFAS 2027 applications are expected to open around September 2026 (exact date not yet officially confirmed). Ask us for the latest details.
            </p>
          )}
        </div>
      </div>

      <TipsModal
        open={tipsOpen}
        onClose={() => setTipsOpen(false)}
        tips={tips}
        isGeneric={isGeneric}
        accent={accent}
        copied={tipsCopied}
        onCopy={handleCopyTips}
        hubTitle={hubTitle}
      />

      {svc.notice && (
        <NoticeModal
          open={noticeOpen}
          onClose={() => setNoticeOpen(false)}
          notice={svc.notice}
          hubTitle={hubTitle}
        />
      )}
    </div>
  )
    }
