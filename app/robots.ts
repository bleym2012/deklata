import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/my-requests',
          '/profile',
          '/reset-password',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://deklata.app/sitemap.xml',
    host: 'https://deklata.app',
  }
}
