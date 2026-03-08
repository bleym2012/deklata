// app/layout.tsx
//
// WHAT CHANGED & WHY:
//
// 1. FONTS: Was loading Google Fonts via <link href="fonts.googleapis.com">
//    This creates a render-blocking request. Every page waited for Google's
//    servers before painting text. Switched to next/font which:
//    - Downloads fonts at BUILD TIME and self-hosts them on Vercel
//    - Zero extra network requests at runtime
//    - Eliminates font-related CLS (layout shift from FOUT)
//    - Saves ~300-500ms on mobile in Ghana
//
// 2. ANALYTICS: Was loading synchronously in <head>. Moved to afterInteractive
//    strategy so it loads AFTER the page is visible and interactive.
//    This alone can cut 500-1500ms off Total Blocking Time.
//
// 3. REMOVED: export const dynamic = "force-dynamic" from layout.
//    This was forcing EVERY page to skip static generation. Removed so
//    individual pages can opt into ISR/static as appropriate.

import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PWAInstallBanner from "./components/PWAInstallBanner";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";

// ── FONTS — self-hosted via next/font ────────────────────────────────────────
// These download at build time and serve from Vercel CDN.
// No Google Fonts request at runtime = no render blocking.
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap", // prevents invisible text while loading
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
});

// ── REPLACE THIS with your actual GA Measurement ID ──────────────────────────
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

const BASE_URL = "https://deklata.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Deklata – Free Student Item Exchange in Ghana",
    template: "%s | Deklata",
  },
  description:
    "Deklata connects Ghanaian students to give and receive items they no longer need — safely, simply, and completely free. Browse listings from UDS Tamale, UDS Nyankpala and Tamale Technical University.",
  keywords: [
    "free items Ghana",
    "student exchange Ghana",
    "UDS Tamale free items",
    "student marketplace Ghana",
    "give away items Ghana",
    "Deklata",
    "free student stuff",
    "Tamale Technical University",
    "UDS Nyankpala",
  ],
  authors: [{ name: "Deklata", url: BASE_URL }],
  creator: "Deklata",
  publisher: "Deklata",
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: BASE_URL,
    siteName: "Deklata",
    title: "Deklata – Free Student Item Exchange in Ghana",
    description:
      "Give items you no longer need to fellow students. Browse free listings from campuses across Tamale, Ghana.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Deklata – Free Student Item Exchange",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deklata – Free Student Item Exchange",
    description: "Give and receive items freely between students in Ghana.",
    images: ["/og-image.png"],
    creator: "@deklatapp",
  },
  applicationName: "Deklata",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Deklata" },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <head>
        {/* Preconnect to Supabase — saves 200-400ms on first DB call */}
        <link
          rel="preconnect"
          href="https://iibknadykycghvbjbwxs.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://iibknadykycghvbjbwxs.supabase.co"
        />

        {/* NO MORE Google Fonts <link> here — handled by next/font above */}

        {/* PWA */}
        <meta
          name="theme-color"
          content="#1a5c3a"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0d1a12"
          media="(prefers-color-scheme: dark)"
        />
        <meta name="msapplication-TileColor" content="#1a5c3a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="manifest" href="/icons/site.webmanifest" />
        {/* Prevents nav flash on mobile before CSS hydrates */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
  @media (max-width: 767px) { .desktop-nav { display: none !important; } }
  @media (min-width: 768px) { .hamburger-btn { display: none !important; } }
`,
          }}
        />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Deklata",
              url: BASE_URL,
              logo: `${BASE_URL}/images/deklata-logo.svg`,
              description:
                "Free student-to-student item exchange platform for Ghanaian university students.",
              sameAs: [
                "https://twitter.com/deklatapp",
                "https://instagram.com/deklatapp",
              ],
              areaServed: { "@type": "Country", name: "Ghana" },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Deklata",
              url: BASE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${BASE_URL}/?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>
        <Header />
        <div className="page-container">{children}</div>
        <Footer />
        <PWAInstallBanner />
        <ServiceWorkerRegistrar />

        {/* ── GOOGLE ANALYTICS — loads AFTER page is interactive ─────────────
            strategy="afterInteractive" means GA only runs after the user can
            already see and use the page. This removes GA from the critical path
            and stops it contributing to Total Blocking Time.               ── */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
