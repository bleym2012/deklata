import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lkhghadrndzjwlkltqha.supabase.co", // fixed: removed https://
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "iibknadykycghvbjbwxs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Compress responses
  compress: true,
};

export default nextConfig;
