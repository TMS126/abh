import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://v0-apexbytes-hub-website.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow:     '/',
      disallow:  ['/maintenance', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
