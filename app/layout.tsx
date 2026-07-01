import type { Metadata, Viewport } from 'next'
import { Nunito, DM_Sans, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import { InstanceGuardProvider } from '@/hooks/use-instance-guard'
import { BIZ, BRAND } from '@/lib/brand'
import { LocalBusinessJsonLd } from '@/components/ui/json-ld'
import { QuoteCalculatorWidget } from '@/components/QuoteCalculatorWidget'
import { WhatsAppFAB } from '@/components/whatsapp-fab'
import './globals.css'

// ─── Fonts ────────────────────────────────────────────────────────────────────
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

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       `${BIZ.name} — ${BIZ.tagline}`,
  description: `We make technology and important services accessible to everyone — no jargon, no stress. Right here in ${BIZ.address}.`,
  keywords:    ['printing', 'CV services', 'tech support', 'government services', 'SASSA', 'SARS', 'Kgotsong', 'Bothaville'],
  authors:     [{ name: BIZ.name }],
  icons: {
    icon:     [{ url: '/favicon.ico' }, { url: '/192x192.png', type: 'image/png' }],
    apple:    [{ url: '/apple-touch.png' }],
    shortcut: [{ url: '/favicon.ico' }],
  },
}

// ─── Viewport ─────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND.blue },
    { media: '(prefers-color-scheme: dark)',  color: '#09090b'  },
  ],
  width:        'device-width',
  initialScale: 1,
}

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunito.variable} ${dmSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Theme-aware favicons (SVG) */}
        <link rel="icon" href="/favicon-light.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.svg"  media="(prefers-color-scheme: dark)" />

        <link rel="apple-touch-icon" href="/apple-touch-light.svg" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/apple-touch-dark.svg"  media="(prefers-color-scheme: dark)" />

        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#0D1B2A" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-white dark:bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LocalBusinessJsonLd />
          <InstanceGuardProvider>
            {children}
          </InstanceGuardProvider>
          <QuoteCalculatorWidget />
          <WhatsAppFAB />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
