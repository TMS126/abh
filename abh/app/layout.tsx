import type { Metadata, Viewport } from 'next'
import { Nunito, DM_Sans, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import { InstanceGuardProvider } from '@/hooks/use-instance-guard'
import { BIZ, BRAND } from '@/lib/brand'
import { LocalBusinessJsonLd } from '@/components/ui/json-ld'
import './globals.css'

const nunito = Nunito({ 
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${BIZ.name} — ${BIZ.tagline}`,
  description: `We make technology and important services accessible to everyone — no jargon, no stress. Right here in ${BIZ.location}.`,
  keywords: ['printing', 'CV services', 'tech support', 'government services', 'SASSA', 'SARS', 'Kgotsong', 'Bothaville'],
  authors: [{ name: BIZ.name }],
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND.blue },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${nunito.variable} ${dmSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
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
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
 
