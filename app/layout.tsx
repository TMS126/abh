import type { Metadata, Viewport } from 'next'
import { Nunito, DM_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'
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

export const metadata: Metadata = {
  title: 'Apexbytes Hub — Your Local Tech & Print Partner',
  description: 'From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong, Bothaville.',
  keywords: ['printing', 'CV services', 'tech support', 'government services', 'SASSA', 'SARS', 'Kgotsong', 'Bothaville'],
  authors: [{ name: 'Apexbytes Hub' }],
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1E6FA8' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1B2A' },
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
    <html lang="en" suppressHydrationWarning className={`${nunito.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
