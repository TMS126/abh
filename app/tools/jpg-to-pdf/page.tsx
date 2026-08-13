// app/tools/jpg-to-pdf/page.tsx
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
import { ImageList } from "./image-list"
import { ReconvertBanner } from "./reconvert-banner"
import { ResultsPanel } from "./results-panel"
import { HistoryPanel } from "./history-panel"

export default function JpgToPdfPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
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

        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-[720px] mx-auto">
            <ScrollBounce>
              <SettingsBar
                mode={t.mode} setMode={t.setMode}
                pageSize={t.pageSize} setPageSize={t.setPageSize}
                qualityPreset={t.qualityPreset} setQualityPreset={t.setQualityPreset}
                accentColor={accentColor}
              />
            </ScrollBounce>

            <ScrollBounce delay={0.05}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`mt-5 rounded-[14px] border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center gap-2.5 py-10 px-6 text-center ${isDragging ? "border-brand-blue bg-brand-blue/5" : "border-zinc-200 dark:border-zinc-800 hover:border-brand-blue/50"}`}
              >
                <UploadSimple weight="bold" className="w-7 h-7 text-zinc-400" aria-hidden="true" />
                <p className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Drag & drop, or tap to browse</p>
                <p className="text-xs text-zinc-400">JPG or PNG · up to 20 images</p>
                <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handleFileInput} className="hidden" />
              </div>
            </ScrollBounce>

            {t.errors.length > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-red-50 dark:bg-red-950/30 px-4 py-2.5" aria-live="polite">
                <WarningCircle weight="fill" className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {t.errors.length} file{t.errors.length > 1 ? "s" : ""} skipped — check thumbnails below for details.
                </span>
              </div>
            )}

            {t.images.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={() => t.selectAll(!allSelected)} className="text-sm font-black" style={{ color: accentColor }}>
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                  <span className="text-sm font-semibold text-zinc-400">{t.selectedCount} of {t.images.length} selected</span>
                  <button type="button" onClick={t.clearAll} className="text-sm font-semibold text-zinc-400 hover:text-red-500 transition-colors">
                    Clear
                  </button>
                </div>

                <ImageList
                  images={t.images}
                  mode={t.mode}
                  rotations={t.rotations}
                  errors={t.errors}
                  convertedIds={t.convertedIds}
                  accentColor={accentColor}
                  onToggleSelect={t.toggleSelect}
                  onRotate={t.rotateImage}
                  onMove={t.moveImage}
                  onRemove={t.removeImage}
                  onReorder={t.reorder}
                />

                <ReconvertBanner prompt={t.reconvertPrompt} onResolve={t.resolveReconvert} />

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={t.requestConvert}
                    disabled={t.isConverting || t.selectedCount === 0}
                    className="rounded-[14px] font-black py-3 px-8 flex items-center justify-center gap-2.5 text-white active:scale-[0.99] transition-all disabled:opacity-60"
                    style={{ backgroundColor: accentColor }}
                  >
                    {t.isConverting ? (
                      <span className="text-sm" aria-live="polite">{t.progress}%</span>
                    ) : (
                      <>
                        <FilePdf weight="fill" className="w-4 h-4" aria-hidden="true" />
                        <span className="text-sm">Convert</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
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
        </section>

        <CtaBar
          title="Need something printed?"
          description="WhatsApp us or visit us in Kgotsong, Bothaville — we're always happy to help."
          buttonText="WhatsApp Us Now"
        />
      </main>
      <Footer />
    </div>
  )
} 
