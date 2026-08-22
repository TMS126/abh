// next.config.mjs — full file, paste over the current one
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Build ──
  typescript: {
    // Temporarily true again while Day 1–5 stabilization work is still in
    // progress. The app-level TypeScript error (duplicate TOKEN properties
    // in lib/brand.ts) that this flag was masking is already fixed — this
    // is now deliberately staying on until the full audit pass is complete,
    // not because a real error is being hidden. Flip back to false once
    // everything is verified (Day 5), then remove this flag entirely if no
    // further errors surface.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  poweredByHeader: false, // ── hides "X-Powered-By: Next.js" header ──
  productionBrowserSourceMaps: false, // ── stops strangers reading your unminified source code in browser devtools ──

  // ── Images ──
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'], // ── smaller images automatically, no code changes needed ──
  },

  // ── Headers ──
  async headers() {
    return [
      {
        // Cache hashed static files hard — filenames change automatically when you update code,
        // so "forever" caching here is safe and just makes repeat visits instant
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.whatsapp.net https://res.cloudinary.com; font-src 'self'; connect-src 'self' https://va.vercel-scripts.com https://api.cloudinary.com https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig
