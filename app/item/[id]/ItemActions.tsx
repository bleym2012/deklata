"use client";

// app/item/[id]/ItemActions.tsx
//
// CLIENT COMPONENT — handles all interactive elements:
// - Back button navigation
// - Image carousel scroll + dot indicators
// - Full-screen image lightbox (tap an image to view it large, swipe between)
// - Auth state (is user logged in? have they requested this item?)
// - Request button + request flow
// - Delete button (owner only)
// - Show more/less description
// - Document title update
//
// All static content (item name, description, pills, images HTML) is
// already rendered by the server component — this component only adds
// interactivity on top of what's already visible.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { requireVerifiedUser } from "../../lib/requireVerifiedUser";

interface Props {
  item: any;
  images: any[];
  itemId: string;
  backUrl: string;
}

export default function ItemActions({ item, images, itemId, backUrl }: Props) {
  const router = useRouter();

  // ── Auth state — loads after page is already visible ─────────────────────
  const [userId, setUserId] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [requesting, setRequesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // ── Lightbox state ──────────────────────────────────────────────────────
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxRef = useRef<HTMLDivElement>(null);

  function openLightbox(idx: number) {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }

  function goToLightboxIndex(i: number) {
    const clamped = Math.max(0, Math.min(i, images.length - 1));
    setLightboxIndex(clamped);
    const el = lightboxRef.current;
    if (el) el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

  // When the lightbox opens, jump the scroll container to the tapped image
  // (instant, no animation) so it appears already on the right photo.
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      lightboxRef.current.scrollLeft =
        lightboxIndex * lightboxRef.current.clientWidth;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  // Keyboard nav + body scroll lock while the lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") goToLightboxIndex(lightboxIndex + 1);
      else if (e.key === "ArrowLeft") goToLightboxIndex(lightboxIndex - 1);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, lightboxIndex, images.length]);

  // Update document title — item data is already available from props
  useEffect(() => {
    document.title = `${item.name} – Free on Deklata`;
    return () => {
      document.title = "Deklata – Free Student Item Exchange";
    };
  }, [item.name]);

  // Load auth state after page is visible — non-blocking
  useEffect(() => {
    async function loadAuth() {
      const [{ data: authData }] = await Promise.all([supabase.auth.getUser()]);
      const uid = authData.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: existingRequest } = await supabase
          .from("requests")
          .select("id")
          .eq("item_id", itemId)
          .eq("requester_id", uid)
          .maybeSingle();
        setHasRequested(!!existingRequest);
      }
      setAuthLoaded(true);
    }
    loadAuth();
  }, [itemId]);

  async function requestItem() {
    const check = await requireVerifiedUser();
    console.log("AUTH CHECK:", JSON.stringify(check));
    if (!check.ok) {
      if (check.reason === "not_logged_in") {
        router.push(`/login?redirect=/item/${itemId}`);
      } else if (check.reason === "not_onboarded") {
        router.push("/onboarding");
      } else {
        alert("Please verify your email before requesting items.");
      }
      return;
    }

    setRequesting(true);

    // Get a FRESH session token NOW — before any other async work.
    // getUser() forces a server round-trip and refreshes the token,
    // so the session we grab right after is guaranteed valid.
    const {
      data: { user: freshUser },
    } = await supabase.auth.getUser();
    const {
      data: { session: freshSession },
    } = await supabase.auth.getSession();
    const accessToken = freshSession?.access_token ?? null;

    const { error } = await supabase.rpc("request_item", {
      p_item_id: itemId,
      p_user_id: userId,
    });
    if (error) {
      console.error("X request_item RPC failed:", error);
      alert(error.message);
      setRequesting(false);
      return;
    }

    // Fire email notification in the background — don't block the UI
    if (freshUser && accessToken) {
      (async () => {
        try {
          await fetch(
            "https://iibknadykycghvbjbwxs.supabase.co/functions/v1/notify-owner-request",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
              },
              body: JSON.stringify({ item_id: itemId }),
            },
          );
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
        }
      })();
    }

    setHasRequested(true);
    setRequesting(false);
    setRequestSuccess(true);
    setTimeout(() => setRequestSuccess(false), 4000);
  }

  async function deleteItem() {
    if (
      !confirm(
        "Delete this item permanently? Any active requests will be cancelled.",
      )
    )
      return;
    setDeleting(true);
    // First reject/delete all requests so requesters are not left hanging
    await supabase
      .from("requests")
      .update({ status: "rejected" })
      .eq("item_id", itemId)
      .in("status", ["pending", "approved"]);
    await supabase.from("requests").delete().eq("item_id", itemId);
    await supabase.from("item_images").delete().eq("item_id", itemId);
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId)
      .eq("owner_id", userId);
    if (error) {
      alert("Could not delete item. You may not have permission.");
      setDeleting(false);
      return;
    }
    router.push(backUrl);
  }

  const isOwner = userId === item.owner_id;
  const isFreshToday =
    item.created_at &&
    Date.now() - new Date(item.created_at).getTime() < 86400000;
  const shareUrl = `https://deklata.app/item/${itemId}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    "Check out this free item on Deklata: " + item.name + " - " + shareUrl,
  )}`;
  const isLoggedIn = !!userId;

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1140,
        margin: "0 auto",
        padding: "16px 20px 48px",
        boxSizing: "border-box",
      }}
    >
      {/* BACK */}
      <button
        onClick={() => router.push(backUrl)}
        style={{
          background: "none",
          border: "none",
          color: "var(--green-700)",
          cursor: "pointer",
          marginBottom: 24,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 0",
        }}
      >
        ← Back to results
      </button>

      {/* LAYOUT */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}
        className="detail-grid"
      >
        {/* LEFT — IMAGES */}
        <div>
          <div
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.clientWidth;
              setActiveIndex(Math.round(scrollLeft / width));
            }}
            style={{
              display: "flex",
              width: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              borderRadius: 20,
              gap: 0,
            }}
          >
            {images.length > 0 ? (
              images.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() => openLightbox(idx)}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    width: "100%",
                    aspectRatio: "4 / 3",
                    maxHeight: "55vh",
                    borderRadius: 20,
                    scrollSnapAlign: "start",
                    background: "var(--green-50)",
                    overflow: "hidden",
                    cursor: "zoom-in",
                  }}
                >
                  <Image
                    src={img.image_url}
                    alt={`${item.name} – free item on Deklata`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    style={{ objectFit: "cover" }}
                    quality={80}
                    priority={idx === 0}
                  />
                  {/* Subtle hint that the image is tappable */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      background: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 9px",
                      borderRadius: 999,
                      fontFamily: "var(--font-body)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      pointerEvents: "none",
                    }}
                  >
                    🔍 Tap to view
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  maxHeight: "55vh",
                  background: "var(--green-50)",
                  borderRadius: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  color: "var(--ink-300)",
                }}
              >
                <span style={{ fontSize: 48 }}>📷</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>
                  No photos yet
                </span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginTop: 12,
              }}
            >
              {images.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === activeIndex ? 20 : 6,
                    height: 6,
                    borderRadius: 999,
                    background:
                      i === activeIndex ? "var(--green-800)" : "var(--ink-100)",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — DETAILS */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: 20,
            padding: "clamp(16px, 4vw, 24px)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--ink-100)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "var(--gold)",
              color: "var(--white)",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.5px",
              fontFamily: "var(--font-display)",
              marginBottom: 14,
            }}
          >
            FREE
          </span>

          <h1
            style={{
              fontSize: "clamp(20px, 5vw, 26px)",
              fontWeight: 800,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            {item.name}
          </h1>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <span className="meta-pill">
              {item.categories?.name || "Uncategorized"}
            </span>
            {item.condition && (
              <span
                className="meta-pill"
                style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  borderColor: "#bfdbfe",
                }}
              >
                🏷️ {item.condition}
              </span>
            )}
            {item.pickup_location && (
              <span
                className="meta-pill"
                style={{
                  background: "var(--gold-light)",
                  color: "#92400e",
                  borderColor: "#fde68a",
                }}
              >
                📍 {item.pickup_location}
              </span>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 15,
                color: "var(--ink-700)",
                lineHeight: 1.7,
                marginBottom: 8,
                fontFamily: "var(--font-body)",
                display: "-webkit-box",
                WebkitLineClamp: showFullDescription ? ("unset" as any) : 3,
                WebkitBoxOrient: "vertical" as any,
                overflow: "hidden",
              }}
            >
              {item.description}
            </p>

            {item.description?.length > 160 && (
              <button
                onClick={() => setShowFullDescription((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--green-700)",
                  fontWeight: 600,
                  padding: 0,
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "var(--font-body)",
                }}
              >
                {showFullDescription ? "Show less ↑" : "Read more ↓"}
              </button>
            )}
          </div>

          {requestSuccess && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                background: "var(--green-50)",
                color: "var(--green-800)",
                borderRadius: 12,
                fontWeight: 700,
                textAlign: "center",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                border: "1px solid var(--green-100)",
                animation: "fadeIn 0.3s ease",
              }}
            >
              🎉 Request sent! The owner will be notified.
            </div>
          )}

          {!isOwner && isLoggedIn && hasRequested && !requestSuccess && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
                background: "var(--green-50)",
                color: "var(--green-800)",
                borderRadius: 12,
                fontWeight: 600,
                textAlign: "center",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                border: "1px solid var(--green-100)",
              }}
            >
              ✅ You've requested this item — check My Requests for updates
            </div>
          )}

          <div style={{ display: "grid", gap: 12 }}>
            {/* Show request button area only after auth is loaded
                to avoid button flashing from "Log in" to "Request" */}
            {!authLoaded ? (
              <div
                className="skeleton"
                style={{ height: 52, borderRadius: 14 }}
              />
            ) : (
              <>
                {!isOwner && !isLoggedIn && (
                  <button
                    onClick={() =>
                      router.push(`/login?redirect=/item/${itemId}`)
                    }
                    className="btn-primary"
                  >
                    Log in to request
                  </button>
                )}
                {!isOwner && isLoggedIn && !hasRequested && (
                  <button
                    onClick={requestItem}
                    disabled={requesting}
                    className="btn-primary"
                    style={{ opacity: requesting ? 0.7 : 1 }}
                  >
                    {requesting ? "Requesting…" : "Request this item"}
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={deleteItem}
                    disabled={deleting}
                    className="btn-danger"
                    style={{
                      opacity: deleting ? 0.7 : 1,
                      cursor: deleting ? "wait" : "pointer",
                    }}
                  >
                    {deleting ? "Deleting…" : "Delete item"}
                  </button>
                )}
              </>
            )}

            {/* WhatsApp Share — always visible, no auth needed */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                borderRadius: 14,
                border: "1.5px solid #22c55e",
                background: "#f0fdf4",
                color: "#16a34a",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                fontFamily: "var(--font-display)",
              }}
            >
              <span>💬</span> Share on WhatsApp
            </a>
          </div>

          {/* Report item */}
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <Link
              href={`/contact?type=complaint&subject=Report+item+${itemId}`}
              style={{
                fontSize: 12,
                color: "var(--ink-300)",
                fontFamily: "var(--font-body)",
                textDecoration: "underline",
              }}
            >
              🚩 Report this item
            </Link>
          </div>

          {/* Campus + fresh badge */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            {item.campus && (
              <span className="meta-pill" style={{ fontSize: 12 }}>
                🏫 {item.campus}
              </span>
            )}
            {isFreshToday && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontFamily: "var(--font-display)",
                }}
              >
                ✨ NEW TODAY
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── FULL-SCREEN LIGHTBOX ────────────────────────────────────────────
          Opens when an image is tapped. Shows the full image (objectFit:
          contain, never cropped), swipeable on mobile via the same
          scroll-snap pattern as the carousel, with arrows + keyboard on
          desktop. Tap the backdrop or the X to close. */}
      {lightboxOpen && images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${item.name} images`}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1002,
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              border: "none",
              color: "#fff",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div
              style={{
                position: "absolute",
                top: 22,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                zIndex: 1001,
                pointerEvents: "none",
              }}
            >
              {lightboxIndex + 1} / {images.length}
            </div>
          )}

          {/* Swipeable image track */}
          <div
            ref={lightboxRef}
            onScroll={(e) => {
              const w = e.currentTarget.clientWidth;
              if (w > 0)
                setLightboxIndex(Math.round(e.currentTarget.scrollLeft / w));
            }}
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {images.map((img, idx) => (
              <div
                key={img.id}
                // Tapping the empty area (not the image) closes the lightbox
                onClick={(e) => {
                  if (e.target === e.currentTarget) setLightboxOpen(false);
                }}
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: "100%",
                  height: "100%",
                  scrollSnapAlign: "start",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src={img.image_url}
                  alt={`${item.name} – photo ${idx + 1}`}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "contain" }}
                  quality={90}
                  priority={idx === lightboxIndex}
                />
              </div>
            ))}
          </div>

          {/* Desktop arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => goToLightboxIndex(lightboxIndex - 1)}
                aria-label="Previous image"
                disabled={lightboxIndex === 0}
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  border: "none",
                  color: "#fff",
                  fontSize: 24,
                  cursor: lightboxIndex === 0 ? "default" : "pointer",
                  opacity: lightboxIndex === 0 ? 0.35 : 1,
                  zIndex: 1001,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="lightbox-arrow"
              >
                ‹
              </button>
              <button
                onClick={() => goToLightboxIndex(lightboxIndex + 1)}
                aria-label="Next image"
                disabled={lightboxIndex === images.length - 1}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  border: "none",
                  color: "#fff",
                  fontSize: 24,
                  cursor:
                    lightboxIndex === images.length - 1 ? "default" : "pointer",
                  opacity: lightboxIndex === images.length - 1 ? 0.35 : 1,
                  zIndex: 1001,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="lightbox-arrow"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1.3fr 1fr !important;
            align-items: start;
          }
        }
        /* Hide the lightbox arrows on touch devices where swipe is natural */
        @media (hover: none) and (pointer: coarse) {
          .lightbox-arrow {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
