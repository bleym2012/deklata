export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PWAInstallBanner from "./components/PWAInstallBanner";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Supabase — saves 200-400ms on first DB call */}
        <link rel="preconnect" href="https://iibknadykycghvbjbwxs.supabase.co" />
        <link rel="dns-prefetch" href="https://iibknadykycghvbjbwxs.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />

        {/* PWA */}
        <meta name="theme-color" content="#1a5c3a" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0d1a12" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#1a5c3a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
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
      </head>
      <body>
        <ServiceWorkerRegistrar />
        <Header />
        <div className="page-container">{children}</div>
        <Footer />
        <PWAInstallBanner />
      </body>
    </html>
  );
}
