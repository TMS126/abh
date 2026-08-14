"use client"

import { useRef, useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { UploadSimple, FilePdf, WarningCircle } from "@phosphor-icons/react"
import { BRAND, THEME_BG } from "@/lib/brand"
import { ensureAccessible } from "@/lib/color"
import { ScrollBounce } from "@/components/scroll-bounce"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CtaBar } from "@/components/strip-section"
import { useJpgToPdf } from "./use-jpg-to-pdf"
import { SettingsBar } from "./settings-bar"
import { ImageGrid } from "./image-grid"
import { ImageLightbox } from "./image-lightbox"
import { CropModal } from "./crop-modal"
import { ReconvertBanner } from "./reconvert-banner"
import { ResultsPanel } from "./results-panel"
import { HistoryPanel } from "./history-panel"
import { PAGE_TIPS, WHATSAPP_MAGIC_PHRASES } from "./constants"

export default function JpgToPdfPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [zoomId, setZoomId] = useState<string | null>(null)
  const [cropId, setCropId] = useState<string | null>(null)

  // ─── RANDOM TIP / WHATSAPP PHRASE (picked once per page load) ─────────
  const [tip] = useState(() => PAGE_TIPS[Math.floor(Math.random() * PAGE_TIPS.length)])
  const [waPhrase] = useState(() => WHATSAPP_MAGIC_PHRASES[Math.floor(Math.random() * WHATSAPP_MAGIC_PHRASES.length)])

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"
  const pageBg = isDark ? THEME_BG.dark.page : THEME_BG.light.page
  const accentColor = ensureAccessible(BRAND.blue, pageBg, 4.5)

  const t = useJpgToPdf()

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) t.addFiles(e.target.files)
    e.target.value = ""
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) t.addFiles(e.dataTransfer.files)
  }

  const allSelected = t.images.length > 0 && t.selectedCount === t.images.length
  const selectedImages = t.images.filter((i) => i.selected)
  const originalBytes = selectedImages.length > 0 ? selectedImages.reduce((s, i) => s + i.file.size, 0) : null

  const zoomImage = t.images.find((i) => i.id === zoomId)
  const cropImage = t.images.find((i) => i.id === cropId)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        {/* ─── HERO ───────────────────────────────────────────────────── */}
        <section className="px-4 md:px-8 pt-[calc(var(--nav-h)+2rem)] pb-6">
          <div className="max-w-[720px] mx-auto text-center">
            <ScrollBounce>
              <FilePdf weight="fill" className="w-10 h-10 mx-auto mb-4" style={{ color: accentColor }} aria-hidden="true" />
              <h1 className="abh-page-title mb-3">JPG to PDF</h1>
            </ScrollBounce>
            <p className="abh-tagline max-w-md mx-auto">
              Convert images into a PDF right in your browser. Nothing is uploaded — your files never leave your device.
            </p>
            <div className="abh-divider" />
          </div>
        </section>

        {/* ─── MAIN LAYOUT: SIDEBAR + GRID ───────────────────────────── */}
        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-[1100px] mx-auto lg:grid lg:grid-cols-[340px_1fr] lg:gap-10 lg:items-start">
            {/* Desktop: sticky control sidebar. Mobile: stacks on top. */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-5">
              <ScrollBounce>
                <SettingsBar
                  mode={t.mode} setMode={t.setMode}
                  pageSize={t.pageSize} setPageSize={t.setPageSize}
                  quality={t.quality} setQuality={t.setQuality}
                  originalBytes={originalBytes} estimatedBytes={t.estimatedBytes}
                  accentColor={accentColor}
                />
              </ScrollBounce>

              <ScrollBounce delay={0.05}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`rounded-[14px] border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center gap-2.5 py-10 px-6 text-center ${isDragging ? "border-brand-blue bg-brand-blue/5" : "border-zinc-200 dark:border-zinc-800 hover:border-brand-blue/50"}`}
                >
                  <UploadSimple weight="bold" className="w-7 h-7 text-zinc-400" aria-hidden="true" />
                  <p className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Drag & drop, or tap to browse</p>
                  <p className="text-xs text-zinc-400">JPG, PNG or WEBP · up to 20 images</p>
                  <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileInput} className="hidden" />
                </div>
              </ScrollBounce>

              {/* ─── ERROR BANNER ───────────────────────────────────── */}
              {t.errors.length > 0 && (
                <div className="flex items-center gap-2 rounded-[12px] bg-red-50 dark:bg-red-950/30 px-4 py-2.5" aria-live="polite">
                  <WarningCircle weight="fill" className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {t.errors.length} issue{t.errors.length > 1 ? "s" : ""} found — check thumbnails for details.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 lg:mt-0">
              {t.images.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={() => t.selectAll(!allSelected)} className="text-sm font-black" style={{ color: accentColor }}>
                      {allSelected ? "Deselect all" : "Select all"}
                    </button>
                    <span className="text-sm font-semibold text-zinc-400">{t.selectedCount} of {t.images.length} selected</span>
                    <button type="button" onClick={t.clearAll} className="text-sm font-semibold text-zinc-400 hover:text-red-500 transition-colors">
                      Clear
                    </button>
                  </div>

                  <ImageGrid
                    images={t.images}
                    rotations={t.rotations}
                    errors={t.errors}
                    convertedIds={t.convertedIds}
                    accentColor={accentColor}
                    onToggleSelect={t.toggleSelect}
                    onRotate={t.rotateImage}
                    onResetRotation={t.resetRotation}
                    onRemove={t.removeImage}
                    onZoom={setZoomId}
                    onCrop={setCropId}
                    onReorder={t.reorder}
                  />

                  <ReconvertBanner prompt={t.reconvertPrompt} onResolve={t.resolveReconvert} />

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={t.requestConvert}
                      disabled={t.isConverting || t.selectedCount === 0}
                      className="rounded-[14px] font-black py-3 px-8 text-white transition-transform active:scale-[0.98] disabled:opacity-60"
                      style={{ backgroundColor: accentColor }}
                    >
                      {t.isConverting ? `Converting… ${t.progress}%` : "Convert to PDF"}
                    </button>
                  </div>
                </>
              )}

              <ResultsPanel
                convertedFiles={t.convertedFiles}
                selectedHub={t.selectedHub}
                setSelectedHub={t.setSelectedHub}
                sendNotice={t.sendNotice}
                accentColor={accentColor}
                onSend={t.handleSendToHub}
                onAddMore={() => inputRef.current?.click()}
              />

              <HistoryPanel history={t.history} onClear={t.clearRecents} />
            </div>
          </div>
        </section>

        {/* ─── CTA: RANDOM TIP + WHATSAPP PHRASE ─────────────────────── */}
        <CtaBar
          pillLabel="Tips"
          title="While You're Here"
          description={tip}
          buttonText={waPhrase}
        />
      </main>
      <Footer />

      <ImageLightbox
        imageUrl={zoomImage?.previewUrl || null}
        fileName={zoomImage?.file.name}
        rotation={zoomId ? t.rotations[zoomId] : undefined}
        onClose={() => setZoomId(null)}
      />

      {cropImage && (
        <CropModal
          imageUrl={cropImage.previewUrl}
          fileName={cropImage.file.name}
          initialCrop={cropImage.crop}
          onApply={(crop) => { t.setCrop(cropImage.id, crop); setCropId(null) }}
          onClose={() => setCropId(null)}
        />
      )}
    </div>
  )
} 
