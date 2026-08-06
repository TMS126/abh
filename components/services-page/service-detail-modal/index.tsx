"use client"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
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
import { TipsModal } from "./TipsModal"
import { getServiceTips } from "./fallback-tips"

const BULK_RIBBON_ORANGE = "#B45309"

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
          <div className="flex items-start mb-2">
            <div className="relative z-30 flex items-center justify-start gap-2 shrink-0 w-[72px]">
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
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
                <span className="absolute -bottom-8 left-0 whitespace-nowrap text-[0.74rem] font-black uppercase tracking-widest text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-150">
                  Copied!
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <HubIcon id={svc.hubId} size={12} color={accent} />
                <span className="text-[0.74rem] font-black uppercase tracking-widest" style={{ color: accent }}>{hubTitle}</span>
              </div>

              {/* Section badge — no more pill/chip bg, just plain
                  accent-colored text with a thin underline. */}
              <span
                className="text-[0.74rem] font-black uppercase tracking-widest mb-2.5 inline-block pb-0.5 border-b"
                style={{ color: accent, borderColor: `${accent}50` }}
              >
                {cleanText(svc.sectionTitle)}
              </span>
              <h3 className="abh-card-heading text-[1.32rem] leading-tight">{svc.name}</h3>
            </div>

            <div className="w-[72px] shrink-0" aria-hidden="true" />
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-5xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span>
            {svc.turnaround && (
              // Turnaround pill → plain underlined text, no bg
              <span
                className="flex items-center gap-1 text-[0.82rem] font-bold pb-0.5 border-b"
                style={{ color: accent, borderColor: `${accent}50` }}
              >
                <Clock size={12} weight="bold" aria-hidden="true" />
                {svc.turnaround}
              </span>
            )}
          </div>
        </div>

        {/* ── Tabs — underline only, no filled pill/bg ── */}
        <div className="px-6 pt-1">
          <div className="flex items-center gap-1.5">
            <div role="tablist" aria-label="Service info sections" className="flex-1 flex items-center gap-6 border-b border-zinc-100 dark:border-zinc-800">
              {tabs.map((t) => {
                const isActive = tab === t
                const label = t === "bring" ? "Needs" : "Description"
                return (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTab(t)}
                    className={cn(
                      "py-2.5 text-[0.86rem] font-black uppercase tracking-wider transition-colors duration-200 border-b-2 -mb-px",
                      isActive ? "border-current" : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                    )}
                    style={isActive ? { color: accent } : undefined}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setTipsOpen(true)}
              aria-label="View helpful tips"
              className="shrink-0 w-9 h-9 flex items-center justify-center transition-all active:scale-95"
              style={{ color: accent }}
            >
              <Lightbulb size={18} weight="fill" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 min-h-0 text-center">
          {tab === "bring" && (
            <div className="animate-in fade-in duration-150 flex flex-col items-center">
              <ol className="space-y-3 inline-flex flex-col items-start">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-left">
                    {/* Numbered circle removed — plain "1." "2." "3." text */}
                    <span className="shrink-0 font-black text-[0.86rem] mt-0.5" style={{ color: accent }}>
                      {idx + 1}.
                    </span>
                    <span className="abh-body text-base">{req}</span>
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
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <input ref={fileRef} type="file" accept={HUB_ACCEPT[svc.hubId]} onChange={handleFilePick} className="hidden" />

          {/* Attach File + Quote trigger — one row, no pill/box
              backgrounds, split by a single thin vertical divider. */}
          {!inQuote && (
            <div className="flex items-stretch justify-center gap-4 py-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-[0.86rem] font-bold transition-opacity active:opacity-60"
                style={
                  uploadPhase === "done"
                    ? { color: "#16a34a", borderBottom: "2px solid #16a34a" }
                    : { color: accent }
                }
              >
                <Paperclip size={16} weight="bold" aria-hidden="true" />
                {uploadPhase === "done" ? "Attached" : "Attach File"}
              </button>

              <div className="w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

              <button
                type="button"
                onClick={handleAddToQuote}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-[0.86rem] font-bold transition-opacity active:opacity-60"
                style={{ color: accent }}
              >
                <ShoppingCartSimple size={16} weight="bold" aria-hidden="true" />
                Add to Quote
              </button>
            </div>
          )}

          {/* In-quote state — stepper merged with the bulk hint into ONE
              bar, split by thin vertical dividers, no pill/box bg at all. */}
          {inQuote && (
            <div className="flex items-center justify-center gap-3 py-1 flex-wrap">
              <button
                type="button"
                onClick={() => handleStepQty(-1)}
                aria-label="Remove one from quote"
                className="group w-7 h-7 rounded-full border border-red-500 flex items-center justify-center shrink-0 transition-colors duration-150 hover:bg-red-500 active:scale-90"
              >
                <Minus size={13} weight="bold" style={{ color: neutralIconColor }} className="transition-colors duration-150 group-hover:!text-white" />
              </button>

              <span className="flex items-center gap-1.5 text-[0.9rem] font-black text-green-600 dark:text-green-400">
                Added {quoteQty}
              </span>

              <button
                type="button"
                onClick={() => handleStepQty(1)}
                aria-label="Add one more to quote"
                className="group w-7 h-7 rounded-full border border-green-500 flex items-center justify-center shrink-0 transition-colors duration-150 hover:bg-green-500 active:scale-90"
              >
                <Plus size={13} weight="bold" style={{ color: neutralIconColor }} className="transition-colors duration-150 group-hover:!text-white" />
              </button>

              {bulkHint && (
                <>
                  <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
                  <span className="text-[0.82rem] font-bold" style={{ color: accent }}>
                    {bulkHint}
                  </span>
                </>
              )}

              <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-[0.86rem] font-bold transition-opacity active:opacity-60"
                style={
                  uploadPhase === "done"
                    ? { color: "#16a34a" }
                    : { color: accent }
                }
              >
                <Paperclip size={14} weight="bold" aria-hidden="true" />
                {uploadPhase === "done" ? "Attached" : "Attach File"}
              </button>
            </div>
          )}

          {inQuote && isBulkDiscount && (
            <p className="text-[0.82rem] font-medium text-zinc-400 dark:text-zinc-500 text-center">
              <span className="line-through">R{baseUnitPrice}{priceUnit ? `/${priceUnit}` : ""}</span>
              {" → "}
              <span className="font-black" style={{ color: accent }}>R{effRate}{priceUnit ? `/${priceUnit}` : ""}</span>
              {" each"}
            </p>
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
            className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-[14px] font-black text-base text-white text-center transition-all active:scale-95"
            style={{ backgroundColor: "#25D366" }}
          >
            Request {naturalLabel}
          </a>
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
    </div>
  )
} 