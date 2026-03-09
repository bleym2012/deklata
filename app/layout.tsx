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
import { createServerSupabaseClient } from "./lib/supabaseServer";
import { cookies } from "next/headers";

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

  // Canonical + alternates
  alternates: {
    canonical: BASE_URL,
  },

  // Open Graph — controls WhatsApp, Facebook, LinkedIn previews
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

  // Twitter / X card
  twitter: {
    card: "summary_large_image",
    title: "Deklata – Free Student Item Exchange",
    description: "Give and receive items freely between students in Ghana.",
    images: ["/og-image.png"],
    creator: "@deklatapp",
  },

  // PWA / mobile
  applicationName: "Deklata",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Deklata",
  },
  formatDetection: {
    telephone: false,
  },

  // Indexing
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the Supabase session cookie server-side.
  // This tells us if the user is logged in BEFORE any HTML is sent to the browser.
  // The correct nav is baked into the HTML — zero flash, zero JS needed for initial state.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("sb-iibknadykycghvbjbwxs-auth-token");
  const initialUser = !!sessionCookie?.value;

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
        {/* Google Fonts links REMOVED — next/font self-hosts them above,
            eliminating this render-blocking external network request */}

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

        {/* JSON-LD structured data — Organisation */}
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
              areaServed: {
                "@type": "Country",
                name: "Ghana",
              },
            }),
          }}
        />

        {/* JSON-LD — WebSite with SearchAction (enables Google Sitelinks Search Box) */}
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
        {/* ── ANTI-FLASH SCRIPT ────────────────────────────────────────────────
            Runs synchronously before <body> is parsed — before React, before
            any component renders. Reads the Supabase session directly from
            localStorage and stamps data-auth="user" or data-auth="guest" on
            <html>. CSS uses that attribute to show the correct nav from the
            very first pixel painted. No flash is physically possible because
            the correct state is known before anything is drawn.
            ──────────────────────────────────────────────────────────────── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var keys = Object.keys(localStorage);
              var sessionKey = keys.find(function(k) {
                return k.startsWith('sb-') && k.endsWith('-auth-token');
              });
              var session = sessionKey ? JSON.parse(localStorage.getItem(sessionKey)) : null;
              var isLoggedIn = !!(session && session.access_token);
              document.documentElement.setAttribute('data-auth', isLoggedIn ? 'user' : 'guest');
            } catch(e) {
              document.documentElement.setAttribute('data-auth', 'guest');
            }
          })();
        `,
          }}
        />

        {/* Header CSS — static, ships with HTML, applied before first paint */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes header-slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .header-desktop-nav   { display: none; }
          .header-hamburger-btn { display: flex; }
          @media (min-width: 768px) {
            .header-desktop-nav   { display: flex !important; }
            .header-hamburger-btn { display: none  !important; }
          }

          /* Hide auth-specific links until data-auth is known.
             The inline script above sets this before body renders,
             so the correct set is visible from frame one. */
          .nav-user  { display: none; }
          .nav-guest { display: none; }

          html[data-auth="user"]  .nav-user  { display: contents; }
          html[data-auth="guest"] .nav-guest { display: contents; }

          /* Fallback: if data-auth not yet set, hide both to prevent flash */
          html:not([data-auth]) .nav-user  { display: none; }
          html:not([data-auth]) .nav-guest { display: none; }
        `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ServiceWorkerRegistrar />
        <Header initialUser={initialUser} />
        <div className="page-container">{children}</div>
        <Footer />
        <PWAInstallBanner />
      </body>
    </html>
  );
}
