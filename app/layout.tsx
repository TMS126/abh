import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google'
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://v0-apexbytes-hub-website.vercel.app'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-3FJ8QET6RE'

const instrumentHeading = Instrument_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const instrumentBody = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${BIZ.name} — ${BIZ.tagline}`,
  description: `We make technology and important services accessible to everyone — no jargon, no stress. Right here in ${BIZ.address}.`,
  keywords: ['printing Bothaville','printing Kgotsong','CV writing Kgotsong','SASSA help Kgotsong','Apexbytes Hub'],
  authors: [{ name: BIZ.name }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website', locale: 'en_ZA', url: SITE_URL, siteName: BIZ.name,
    title: `${BIZ.name} — ${BIZ.tagline}`,
    description: `We make technology accessible — Printing, CVs, design, SASSA/SARS help in ${BIZ.location}.`,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: BIZ.name }],
  },
  twitter: { card: 'summary_large_image', title: `${BIZ.name} — ${BIZ.tagline}`, images: ['/og-image.png'] },
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
  themeColor: [{ media: '(prefers-color-scheme: light)', color: BRAND.blue }, { media: '(prefers-color-scheme: dark)', color: '#09090b' }],
  width: 'device-width', initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${instrumentHeading.variable} ${instrumentBody.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-white dark:bg-background text-zinc-900 dark:text-zinc-100 transition-colors duration-300 text-[17px] leading-relaxed">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-white focus:text-brand-blue focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none">Skip to main content</a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <LocalBusinessJsonLd />
          <InstanceGuardProvider>{children}</InstanceGuardProvider>
          <FloatingSearchWidget />
          <QuoteCalculatorWidget />
          <WhatsAppFAB />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && (<><Analytics /><SpeedInsights /></>)}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}</Script>
          </>
        )}
      </body>
    </html>
  )
      } 
