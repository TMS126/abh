import type { Metadata, Viewport } from 'next'
import { Nunito, DM_Sans, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import { InstanceGuardProvider } from '@/hooks/use-instance-guard'
import { BIZ, BRAND } from '@/lib/brand'
import { LocalBusinessJsonLd } from '@/components/ui/json-ld'
import { FloatingSearchWidget } from '@/components/floating-search-widget'
import { QuoteCalculatorWidget } from '@/components/QuoteCalculatorWidget'
import { WhatsAppFAB } from '@/components/whatsapp-fab'
import { PageEdgeGlow } from '@/components/page-edge-glow'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://v0-apexbytes-hub-website.vercel.app'

// ─── Fonts ───────────────────────────────────────────────────────────
const nunito = Nunito({
  subsets:  ['latin'],
  variable: '--font-nunito',
  display:  'swap',
})

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  display:  'swap',
})

const geistMono = Geist_Mono({
  subsets:  ['latin'],
  variable: '--font-mono',
  display:  'swap',
})

// ─── Metadata ──────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       `${BIZ.name} — ${BIZ.tagline}`,
  description: `We make technology and important services accessible to everyone — no jargon, no stress. Right here in ${BIZ.address}.`,
  keywords: [
    'printing Bothaville',
    'printing Kgotsong',
    'CV writing Kgotsong',
    'CV services Bothaville',
    'SASSA help Kgotsong',
    'SARS eFiling help Bothaville',
    'tech support Kgotsong',
    'computer repair Bothaville',
    'logo design Kgotsong',
    'flyer printing Bothaville',
    'government services help Free State',
    'document typing Kgotsong',
    'Apexbytes Hub',
    'ApexbytesHub',
  ],
  authors: [{ name: BIZ.name }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type:        'website',
    locale:      'en_ZA',
    url:         SITE_URL,
    siteName:    BIZ.name,
    title:       `${BIZ.name} — ${BIZ.tagline}`,
    description: `We make technology and important services accessible to everyone — no jargon, no stress. Printing, CVs, design, SASSA/SARS help, and tech support. Right here in ${BIZ.location}.`,
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    `${BIZ.name} — your local tech and print partner in Kgotsong, Bothaville`,
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       `${BIZ.name} — ${BIZ.tagline}`,
    description: `Printing, CVs, design, SASSA/SARS help, and tech support in Kgotsong, Bothaville.`,
    images:      ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-light-32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-light-16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark-32.png',  sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)'  },
      { url: '/favicon-dark-16.png',  sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: dark)'  },
      { url: '/favicon-1.ico', type: 'image/ico' },
    ],
    apple:    [{ url: '/apple-icon.png', type: 'image/png' }],
    shortcut: [{ url: '/logo.png',       type: 'image/png' }],
  },
}

// ─── Viewport ──────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND.blue },
    { media: '(prefers-color-scheme: dark)',  color: '#09090b'  },
  ],
  width:        'device-width',
  initialScale: 1,
}

// ─── Root Layout ─────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunito.variable} ${dmSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased min-h-screen bg-white dark:bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        {/* Skip to main content — visible only on keyboard focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-white focus:text-brand-blue focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <PageEdgeGlow />
          <LocalBusinessJsonLd />
          <InstanceGuardProvider>
            {children}
          </InstanceGuardProvider>
          <FloatingSearchWidget />
          <QuoteCalculatorWidget />
          <WhatsAppFAB />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
