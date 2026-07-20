"use client"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { motion, type PanInfo } from "framer-motion"
import {
  X, Paperclip, CheckCircle, WarningCircle, ShieldCheck, ShareNetwork, Clock,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ } from "@/lib/brand"
import { HUBS } from "@/lib/data"
import { useFocusTrap, AbhLoader } from "./shared"
import {
  SelectedService, naturalServiceLabel, cleanText, formatAcceptHint,
  HUB_ACCEPT, CLD_MAX_MB, CLD_PRESET, BLOCKED_MIME_TYPES, BLOCKED_EXTENSIONS, getCldUrl, trackEvent,
} from "./lib"

type Tab = "bring" | "about"

export function ServiceDetailModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [tab,           setTab]           = useState<Tab>("bring")
  const [file,          setFile]          = useState<File | null>(null)
  const [uploadPhase,   setUploadPhase]   = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileUrl,       setFileUrl]       = useState<string | null>(null)
  const [uploadErr,     setUploadErr]     = useState<string | null>(null)
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null)
  const [shareCopied,   setShareCopied]   = useState(false)
  const [addedToQuote,  setAddedToQuote]  = useState(false)
  const fileRef      = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTab("bring"); setAddedToQuote(false)
    setFile(null); setFileUrl(null)
    setUploadPhase("idle"); setUploadErr(null); setUploadProgress(0)
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    if (fileRef.current) fileRef.current.value = ""
  }, [svc?.name])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  useEffect(() => {
    if (!svc) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [svc, onClose])

  useFocusTrap(!!svc, containerRef)

  const doUpload = (f: File) => {
    setUploadPhase("uploading"); setUploadProgress(0)
    const fd = new FormData()
    fd.append("file", f); fd.append("upload_preset", CLD_PRESET)
    const xhr = new XMLHttpRequest()
    xhr.open("POST", getCldUrl(f))
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100)) }
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status < 200 || xhr.status >= 300) throw new Error(data?.error?.message || `HTTP ${xhr.status}`)
        if (!data.secure_url) throw new Error("No URL returned")
        setFileUrl(data.secure_url); setUploadPhase("done")
      } catch (err) {
        setUploadErr(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`); setUploadPhase("error")
      }
    }
    xhr.onerror = () => { setUploadErr("Upload failed: network error"); setUploadPhase("error") }
    xhr.send(fd)
  }

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (BLOCKED_MIME_TYPES.has(f.type) || BLOCKED_EXTENSIONS.test(f.name)) {
      setUploadErr("That file type isn't allowed. Please send a document, image, or PDF only."); setUploadPhase("error"); return
    }
    if (f.size > CLD_MAX_MB * 1024 * 1024) {
      setUploadErr(`File too large — please keep it under ${CLD_MAX_MB}MB.`); setUploadPhase("error"); return
    }
    setFile(f); setUploadErr(null)
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    if (f.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(f))
    doUpload(f)
  }

  const clearFile = () => {
    setFile(null); setFileUrl(null); setUploadPhase("idle"); setUploadErr(null); setUploadProgress(0)
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose()
  }

  if (!svc) return null

  const colors      = HUB_COLORS[svc.hubId as HubKey]
  const accent      = isDark ? colors.accentDark : colors.accentLight
  const hubTitle    = HUBS[svc.hubId]?.title || svc.sectionTitle
  const naturalLabel = naturalServiceLabel(svc.name, svc.sectionTitle)
  const acceptHint  = formatAcceptHint(HUB_ACCEPT[svc.hubId])

  const handleShare = async () => {
    const shareText = `${naturalLabel} — ${svc.price} at ${BIZ.name}`
    const shareUrl  = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: `${naturalLabel} — ${BIZ.name}`, text: shareText, url: shareUrl }) } catch { /* cancelled */ }
      return
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setShareCopied(true); setTimeout(() => setShareCopied(false), 2000)
    }
  }

  const waMessage = fileUrl
    ? `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). Price shown: ${svc.price}. My file: ${fileUrl}`
    : `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). Price shown: ${svc.price}. Can you assist?`

  const requirements = svc.requirements?.length
    ? svc.requirements
    : ["Just bring your file, document or USB — we'll take care of the rest."]

  const desc = svc.desc?.trim() || null

  return (
    <div className="fixed inset-0 z-[10200] flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={svc.name}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 340 }}
        className="relative w-full md:max-w-lg bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col outline-none rounded-t-[20px] md:rounded-[14px] cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-center pt-2.5 pb-0.5 shrink-0" aria-hidden="true">
          <div className="w-9 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <div className="px-6 pt-4 pb-5 flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <span
                className="text-[0.62rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2.5 inline-block"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                {cleanText(svc.sectionTitle)}
              </span>
              <h3 className="abh-card-heading text-[1.1rem] leading-tight">{svc.name}</h3>
            </div>
            <div className="flex items-center gap-2 shrink-0 relative">
              <button
                type="button" onClick={handleShare} aria-label="Share this service"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <ShareNetwork size={16} weight="bold" />
              </button>
              {shareCopied && (
                <span className="absolute -bottom-8 right-0 whitespace-nowrap text-[0.62rem] font-black uppercase tracking-widest text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-150">
                  Copied!
                </span>
              )}
              <button
                onClick={onClose} aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span>
            {svc.turnaround && (
              <span className="flex items-center gap-1 text-[0.68rem] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${accent}12`, color: accent }}>
                <Clock size={12} weight="bold" />
                {svc.turnaround}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-8 border-t border-zinc-100 dark:border-zinc-800">
          {(["bring", "about"] as Tab[]).map((t) => {
            const isActive = tab === t
            return (
              <button
                key={t} onClick={() => setTab(t)}
                className={cn(
                  "relative px-1 pt-3 pb-2.5 text-[0.72rem] font-black uppercase tracking-wider transition-colors",
                  isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                {isActive && <span className="absolute top-0 left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: accent }} />}
                {t === "bring" ? "Bring" : "Description"}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 min-h-0">
          {tab === "bring" && (
            <div className="animate-in fade-in duration-150">
              <ol className="space-y-3">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className={cn("shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-black mt-0.5", isDark ? "text-zinc-900" : "text-white")} style={{ backgroundColor: accent }}>
                      {idx + 1}
                    </span>
                    <span className="abh-body text-[0.84rem] pt-0.5">{req}</span>
                  </li>
                ))}
              </ol>
              <p className="abh-muted mt-5">Not sure? Don't worry — just WhatsApp us first and we'll guide you step by step.</p>
            </div>
          )}
          {tab === "about" && (
            <div className="animate-in fade-in duration-150">
              {desc
                ? <p className="abh-body text-[0.84rem]">{desc}</p>
                : <p className="abh-muted text-[0.84rem]">No description available for this service yet.</p>
              }
              <p className="abh-muted mt-5">
                Have questions? Switch to the <span className="font-black" style={{ color: accent }}>What to Bring</span> tab or chat with us directly.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
          <input ref={fileRef} type="file" accept={HUB_ACCEPT[svc.hubId]} onChange={handleFilePick} className="hidden" />

          {uploadPhase === "idle" && (
            <div className="space-y-2">
              <button
                type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[14px] font-bold text-sm border-2 border-dashed transition-all active:scale-95 hover:opacity-80"
                style={{ borderColor: `${accent}40`, color: accent }}
              >
                <Paperclip size={17} weight="bold" />
                Attach a file (optional)
              </button>
              <p className="text-[0.65rem] font-medium text-zinc-400 dark:text-zinc-500 text-center px-1">Accepts: {acceptHint}</p>
              <div className="flex items-start gap-2 px-1">
                <ShieldCheck size={13} weight="fill" className="text-[#6FBF1A] shrink-0 mt-0.5" />
                <p className="abh-muted text-[0.67rem] leading-relaxed">Your file goes directly to ApexbytesHub only — safe, private, and used only for your order. No explicit or inappropriate content allowed.</p>
              </div>
            </div>
          )}

          {uploadPhase === "uploading" && (
            <div className="flex items-center gap-3 w-full px-4 py-3 rounded-[14px] text-sm font-bold bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
              <AbhLoader size={28} />
              <span className="font-black tabular-nums shrink-0" style={{ color: accent }}>{uploadProgress}%</span>
              <span className="truncate">Uploading {file?.name}…</span>
            </div>
          )}

          {uploadPhase === "done" && file && (
            <div className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-[14px] text-sm font-bold border" style={{ borderColor: `${accent}35`, backgroundColor: `${accent}08` }}>
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="relative shrink-0">
                  {previewUrl
                    ? <img src={previewUrl} alt="" className="w-9 h-9 rounded-[8px] object-cover shrink-0 border border-zinc-200 dark:border-zinc-700" />
                    : <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}><Paperclip size={16} weight="bold" /></div>
                  }
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950" style={{ backgroundColor: "#22c55e" }}>
                    <CheckCircle size={10} weight="fill" color="#fff" />
                  </span>
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[0.6rem] font-black uppercase tracking-widest text-green-600 dark:text-green-400">Uploaded</span>
                  <span className="truncate text-zinc-700 dark:text-zinc-300 text-[0.8rem]">{file.name}</span>
                </span>
              </span>
              <button type="button" onClick={clearFile} aria-label="Remove file" className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X size={15} weight="bold" />
              </button>
            </div>
          )}

          {uploadPhase === "error" && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 w-full px-4 py-3 rounded-[14px] text-sm font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
                <WarningCircle size={17} weight="fill" className="shrink-0 mt-0.5" />
                <span className="leading-snug font-medium">{uploadErr}</span>
              </div>
              <button type="button" onClick={() => { setUploadPhase("idle"); setUploadErr(null); fileRef.current?.click() }} className="text-xs font-black underline" style={{ color: accent }}>
                Try a different file
              </button>
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("abh:add-to-quote", { detail: { hubId: svc.hubId, sectionTitle: svc.sectionTitle, name: svc.name, price: svc.price } }))
              trackEvent("add_to_quote", { hub_id: svc.hubId, service_name: svc.name, section_title: svc.sectionTitle, price: svc.price })
              setAddedToQuote(true); setTimeout(() => setAddedToQuote(false), 2200)
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[14px] font-bold text-sm border-2 transition-all duration-200 active:scale-95"
            style={addedToQuote
              ? { borderColor: "#22c55e", backgroundColor: "#22c55e10", color: "#16a34a" }
              : { borderColor: `${accent}35`, color: accent, backgroundColor: "transparent" }
            }
          >
            {addedToQuote ? "✓ Added to Quote" : "+ Add to Quote"}
          </button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("request_whatsapp", { hub_id: svc.hubId, service_name: svc.name, section_title: svc.sectionTitle, price: svc.price, had_file_attached: uploadPhase === "done" })}
            className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-[14px] font-black text-sm text-white text-center transition-all active:scale-95 shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:-translate-y-0.5"
            style={{ backgroundColor: "#25D366" }}
          >
            Request {naturalLabel}
          </a>
        </div>
      </motion.div>
    </div>
  )
    } 
