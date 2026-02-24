"use client";

import { useEffect, useState } from "react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (don't show again for 7 days)
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 30 * 24 * 60 * 60 * 1000) return;

    // iOS detection — Safari doesn't fire beforeinstallprompt
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    const safariOnly = ios && /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);

    if (safariOnly) {
      setIsIOS(true);
      // Show after a longer delay on iOS
      const t = setTimeout(() => setShowBanner(true), 20000);
      return () => clearTimeout(t);
    }

    // Android / Chrome — catch the native prompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const t = setTimeout(() => setShowBanner(true), 20000);
      return () => clearTimeout(t);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem("pwa-banner-dismissed", String(Date.now()));
    setShowBanner(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  }

  if (!showBanner || isInstalled) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 998,
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* BOTTOM SHEET */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: "var(--white)",
        borderRadius: "24px 24px 0 0",
        padding: "28px 24px 36px",
        boxShadow: "0 -8px 40px rgba(15,61,34,0.18)",
        animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        maxWidth: 520,
        margin: "0 auto",
      }}>
        {/* DRAG HANDLE */}
        <div style={{
          width: 40,
          height: 4,
          background: "var(--ink-100)",
          borderRadius: 999,
          margin: "0 auto 24px",
        }} />

        {/* ICON + TEXT */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: "var(--green-800)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(26,92,58,0.3)",
          }}>
            <span style={{ fontSize: 28 }}>🎓</span>
          </div>
          <div>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 800,
              marginBottom: 4,
              color: "var(--ink-900)",
            }}>
              Install Deklata
            </h3>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--ink-500)",
              margin: 0,
              lineHeight: 1.5,
            }}>
              Add to your home screen for quick access — works offline too.
            </p>
          </div>
        </div>

        {/* iOS INSTRUCTIONS */}
        {isIOS ? (
          <div style={{
            background: "var(--green-50)",
            border: "1px solid var(--green-100)",
            borderRadius: 14,
            padding: "16px",
            marginBottom: 16,
          }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--green-800)",
              margin: 0,
              lineHeight: 1.6,
            }}>
              Tap the <strong>Share</strong> button{" "}
              <span style={{ fontSize: 16 }}>⬆️</span> at the bottom of Safari,
              then tap{" "}
              <strong>"Add to Home Screen"</strong>{" "}
              <span style={{ fontSize: 16 }}>➕</span>
            </p>
          </div>
        ) : (
          /* ANDROID/CHROME BUTTON */
          <button
            onClick={install}
            style={{
              width: "100%",
              padding: "15px",
              background: "var(--green-800)",
              color: "var(--white)",
              border: "none",
              borderRadius: 14,
              fontFamily: "var(--font-display)",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(26,92,58,0.28)",
            }}
          >
            📲 Add to Home Screen
          </button>
        )}

        <button
          onClick={dismiss}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            color: "var(--ink-500)",
            border: "none",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Not now
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
