import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── IMAGE OPTIMISATION ────────────────────────────────────────────────────
  images: {
    // AVIF ~50% smaller than JPEG, WebP ~30% smaller.
    // Next.js picks best format the browser supports.
    formats: ["image/avif", "image/webp"],

    // Tight device sizes — mobile gets a small image, not a 1200px one.
    // This alone can cut image payload by 60-80% on phones.
    deviceSizes: [375, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 128, 256],

    // Cache optimised images for 30 days (was 7) — images rarely change
    minimumCacheTTL: 60 * 60 * 24 * 30,

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

  // ── CACHE + SECURITY HEADERS ──────────────────────────────────────────────
  async headers() {
    return [
      {
        // Static assets — 1 year cache (content-hashed, safe to cache forever)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // SVG logos — 1 week cache
        source: "/images/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // PWA icons — 1 week cache
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Security headers on all pages — no performance cost, improves trust score
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Stop referrer leaking to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Basic XSS protection for older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Permissions policy — disable features Deklata doesn't use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
