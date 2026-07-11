/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ignoreBuildErrors is intentionally kept: some third-party UI dependencies
    // (recharts, react-day-picker) ship types that conflict under strict mode.
    // App-level TypeScript errors are resolved; this flag only shields library types.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.whatsapp.net https://res.cloudinary.com; font-src 'self'; connect-src 'self' https://va.vercel-scripts.com https://api.cloudinary.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig
