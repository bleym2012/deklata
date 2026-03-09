// NO force-dynamic here — the root layout must be static so Next.js can
// pre-render every page's shell at build time. Individual pages that need
// dynamic data (dashboard, profile, etc.) set force-dynamic themselves.
import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PWAInstallBanner from "./components/PWAInstallBanner";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";

// next/font downloads and self-hosts fonts at build time — zero external
// network request from the browser, eliminates the Google Fonts render-block.
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

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
        <link
          rel="preconnect"
          href="https://iibknadykycghvbjbwxs.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://iibknadykycghvbjbwxs.supabase.co"
        />

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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-72x72.png"
        />
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* JSON-LD — Organisation */}
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

        {/* JSON-LD — WebSite SearchAction */}
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

        {/* ── ANTI-FLASH SCRIPT ──────────────────────────────────────────────
            Runs synchronously BEFORE <body> is parsed — before React, before
            any component, before any paint. Reads Supabase session from
            localStorage and sets data-auth="user" or data-auth="guest" on
            <html>. The CSS below uses that attribute to show the correct nav
            from the very first pixel. Physically impossible to flash because
            the correct state is stamped before anything is drawn.
            ────────────────────────────────────────────────────────────────── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=Object.keys(localStorage).find(function(k){return k.startsWith('sb-')&&k.endsWith('-auth-token');});var s=k?JSON.parse(localStorage.getItem(k)):null;document.documentElement.setAttribute('data-auth',s&&s.access_token?'user':'guest');}catch(e){document.documentElement.setAttribute('data-auth','guest');}})();`,
          }}
        />

        {/* Header CSS — static, ships with the HTML document, applied before
            first paint. No styled-jsx hash, no hydration mismatch possible. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes header-slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .header-desktop-nav   { display: none !important; }
          .header-hamburger-btn { display: flex !important; }
          @media (min-width: 768px) {
            .header-desktop-nav   { display: flex !important; }
            .header-hamburger-btn { display: none !important; }
          }
          /* Show correct nav set from first paint via data-auth on <html> */
          .nav-user  { display: none; }
          .nav-guest { display: none; }
          html[data-auth="user"]  .nav-user  { display: contents; }
          html[data-auth="guest"] .nav-guest { display: contents; }
          html:not([data-auth]) .nav-user,
          html:not([data-auth]) .nav-guest   { display: none; }
        `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ServiceWorkerRegistrar />
        <Header />
        <div className="page-container">{children}</div>
        <Footer />
        <PWAInstallBanner />
      </body>
    </html>
  );
}
