// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Poppins, Instrument_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { InstanceGuardProvider } from '@/hooks/use-instance-guard'
import { BIZ, BRAND } from '@/lib/brand'
import { LocalBusinessJsonLd } from '@/components/ui/json-ld'
import { FloatingSearchWidget } from '@/components/floating-search-widget'
import { QuoteCalculatorWidget } from "@/components/quote-calculator"
import { WhatsAppFAB } from '@/components/whatsapp-fab'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://apexbytes.vercel.app'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-3FJ8QET6RE'

// ─── Poppins First + Modern Fallbacks ──────────────────────────────
const poppinsHeading = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const soraFallback = localFont({
  src: [
    { path: '../public/fonts/Sora-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/Sora-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sora',
  display: 'swap',
})

const instrumentFallback = Instrument_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-instrument',
  display: 'swap',
})

const dmSansBody = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
})

// FIX: renamed from '--font-mono' to '--font-jetbrains-mono'. Tailwind's
// own @theme inline block in globals.css wants --font-mono as ITS
// output variable name for the "mono" font-family utility — having the
// font loader claim that same name created a self-referential CSS custom
// property (a cycle), which silently invalidated the whole declaration.
// globals.css now points --font-mono at --font-jetbrains-mono instead.
const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${BIZ.name} — ${BIZ.tagline}`,
  description: `We make technology and important services accessible to everyone — no jargon, no stress. Right here in ${BIZ.address}.`,
  keywords: ['printing Bothaville','printing Kgotsong','CV writing Kgotsong','SASSA help Kgotsong','Apexbytes Hub'],
  authors: [{ name: BIZ.name }],
  openGraph: {
    type: 'website', locale: 'en_ZA', url: SITE_URL, siteName: BIZ.name,
    title: `${BIZ.name} — ${BIZ.tagline}`,
    description: `Printing, CVs, design, SASSA/SARS help, and tech support in ${BIZ.location}.`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: BIZ.name }],
  },
  twitter: { card: 'summary_large_image', title: `${BIZ.name} — ${BIZ.tagline}`, images: [`${SITE_URL}/og-image.png`] },
  icons: {
    icon: [
      { url: '/favicon-light-32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-light-16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark-32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-dark-16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-1.ico', type: 'image/ico' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
    shortcut: [{ url: '/logo.png', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND.blue },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width', initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isProd = process.env.NODE_ENV === 'production'

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppinsHeading.variable} ${soraFallback.variable} ${instrumentFallback.variable} ${dmSansBody.variable} ${monoFont.variable}`}
    >
      <body className="font-sans antialiased min-h-screen bg-white dark:bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-300 text-[17.5px] leading-relaxed">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-white focus:text-brand-blue focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none">
          Skip to main content
        </a>

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <LocalBusinessJsonLd />
          {/* This is the ONLY <main id="main-content"> in the whole app.
              Every route's page.tsx below now renders a plain <div> for its
              own wrapper instead of a second <main> with the same id. */}
          <InstanceGuardProvider><main id="main-content">{children}</main></InstanceGuardProvider>
          <FloatingSearchWidget />
          <QuoteCalculatorWidget />
          <WhatsAppFAB />
        </ThemeProvider>

        {isProd && (
          <>
            <Analytics />
            <SpeedInsights />
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}</Script>
          </>
        )}
      </body>
    </html>
  )
        } 
