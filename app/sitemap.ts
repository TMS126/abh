import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://v0-apexbytes-hub-website.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '',          priority: 1.0, freq: 'weekly'  },
    { path: '/services', priority: 0.9, freq: 'weekly'  },
    { path: '/about',    priority: 0.8, freq: 'monthly' },
    { path: '/gallery',  priority: 0.7, freq: 'monthly' },
    { path: '/contact',  priority: 0.8, freq: 'monthly' },
    { path: '/privacy',  priority: 0.3, freq: 'yearly'  },
  ].map(({ path, priority, freq }) => ({
    url:             `${SITE_URL}${path}`,
    lastModified:    new Date().toISOString(),
    changeFrequency: freq as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority,
  }))

  return routes
}
