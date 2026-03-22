import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // ── IMAGE OPTIMISATION ────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 128, 256],
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
      // Cloudflare R2 — new images served from edge CDN
      {
        protocol: "https",
        hostname: "pub-e3efbac08ffb480896bec4659925acd6.r2.dev",
      },
    ],
  },

  compress: true,

  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },

  // ── CACHE + SECURITY HEADERS ──────────────────────────────────────────────
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
        source: "/images/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
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
