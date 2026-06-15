import { MetadataRoute } from 'next'
import { BIZ } from '@/lib/brand'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://v0-apexbytes-hub-website.vercel.app'
  
  const routes = [
    '',
    '/about',
    '/services',
    '/gallery',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
