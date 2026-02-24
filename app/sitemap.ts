import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://deklata.app'

  const staticPages = [
    { url: base, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${base}/how-it-works`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${base}/add-item`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/login`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${base}/register`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${base}/contact`, priority: 0.4, changeFrequency: 'monthly' as const },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${base}/guidelines`, priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  return staticPages.map(page => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
