import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/maintenance',
    },
    sitemap: 'https://v0-apexbytes-hub-website.vercel.app/sitemap.xml',
  }
}
