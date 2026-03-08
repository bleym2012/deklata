import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── IMAGE OPTIMISATION ────────────────────────────────────────────────────
  images: {
    // Convert all images to WebP/AVIF automatically.
    // AVIF is ~50% smaller than JPEG. WebP is ~30% smaller.
    // Next.js serves the best format the browser supports.
    formats: ["image/avif", "image/webp"],

    // Device sizes — Next.js picks the closest size and serves a
    // resized version. Mobile gets a small image, not a desktop one.
    deviceSizes: [375, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 128, 256],

    // Cache optimised images for 7 days on Vercel CDN
    minimumCacheTTL: 60 * 60 * 24 * 7,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lkhghadrndzjwlkltqha.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "iibknadykycghvbjbwxs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },

  // Compress HTML/JSON responses with gzip
  compress: true,
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },

  // ── CACHE HEADERS ─────────────────────────────────────────────────────────
  // Tell browsers and Vercel's CDN how long to cache static assets.
  // JS/CSS files get a 1-year cache (they have content hashes in their names
  // so a new deploy always busts the cache automatically).
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache SVG logos for 1 week
        source: "/images/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Cache PWA icons for 1 week
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
