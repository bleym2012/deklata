"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { requireVerifiedUser } from "../../lib/requireVerifiedUser";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") || "1";
  const category = searchParams.get("category") || "all";
  const q = searchParams.get("q") || "";
  const backUrl = `/?page=${page}&category=${category}&q=${q}`;

  const [item, setItem] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => { loadItem(); }, []);

  async function loadItem() {
    setLoading(true);

    // Run auth + item + images in parallel — saves ~300ms on mobile
    const [
      { data: { user } },
      { data: itemData },
      { data: imageData },
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("items").select(`*, categories ( id, name )`).eq("id", id).single(),
      supabase.from("item_images").select("*").eq("item_id", id),
    ]);

    setUserId(user ? user.id : null);

    // Only fetch request status if logged in — run after we know user
    if (user) {
      const { data: existingRequest } = await supabase.from("requests")
        .select("id").eq("item_id", id).eq("requester_id", user.id).maybeSingle();
      setHasRequested(!!existingRequest);
    } else {
      setHasRequested(false);
    }

    setItem(itemData);
    setImages(imageData || []);
    setActiveIndex(0);
    setLoading(false);
  }

  // Update document title dynamically for SEO-adjacent UX
  useEffect(() => {
    if (item) {
      document.title = `${item.name} – Free on Deklata`;
    }
    return () => { document.title = 'Deklata – Free Student Item Exchange'; };
  }, [item]);

  async function requestItem() {
    const check = await requireVerifiedUser();
    if (!check.ok) {
      if (check.reason === "not_logged_in") { router.push(`/login?redirect=/item/${id}`); }
      else { alert("Please verify your email before requesting items."); }
      return;
    }
    if (item?.is_locked) return;
    setRequesting(true);

    const { data, error } = await supabase.rpc("request_item", { p_item_id: id, p_user_id: userId });
    if (error) { console.error("X request_item RPC failed:", error); alert(error.message); setRequesting(false); return; }

    try {
      const [
        { data: itemData },
        { data: { session } },
      ] = await Promise.all([
        supabase.from("items").select("name, owner_id").eq("id", id).single(),
        supabase.auth.getSession(),
      ]);
      if (itemData && session?.access_token) {
        // Fire email notification — don't await, let it run in background
        fetch("https://iibknadykycghvbjbwxs.supabase.co/functions/v1/notify-owner-request", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
          body: JSON.stringify({ type: "new_request", request_id: data }),
        }).catch(e => console.error("Email notification failed:", e));
      }
    } catch (emailError) { console.error("Email notification failed:", emailError); }

    await loadItem();
    setRequesting(false);
    setRequestSuccess(true);
    setTimeout(() => setRequestSuccess(false), 4000);
  }

  async function deleteItem() {
    if (!confirm("Delete this item permanently? Any active requests will be cancelled.")) return;
    // First reject/delete all requests so requesters are not left hanging
    await supabase.from("requests")
      .update({ status: "rejected" })
      .eq("item_id", id)
      .in("status", ["pending", "approved"]);
    await supabase.from("requests").delete().eq("item_id", id);
    await supabase.from("item_images").delete().eq("item_id", id);
    const { error } = await supabase.from("items").delete().eq("id", id).eq("owner_id", userId);
    if (error) { alert("Could not delete item. You may not have permission."); return; }
    router.push(backUrl);
  }

  // Dynamic <head> tags once item is loaded
  const pageTitle = item ? `${item.name} – Free on Deklata` : "Item | Deklata";
  const pageDesc = item
    ? `${item.name} available for free pickup${item.pickup_location ? ` at ${item.pickup_location}` : ""}. ${item.description?.slice(0, 120) || ""}`
    : "Free item available on Deklata";
  const pageImage = images[0]?.image_url || "https://deklata.app/og-image.png";
  const pageUrl = `https://deklata.app/item/${id}`;

  if (loading || !item) {
    return (
      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
          <div className="skeleton" style={{ width: "100%", height: 380, borderRadius: 20 }} />
          <div>
            <div className="skeleton" style={{ height: 32, width: "65%", marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "80%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 52, width: "100%", marginTop: 24 }} />
          </div>
        </div>
      </main>
    );
  }

  const isOwner = userId === item.owner_id;
  const isFreshToday = item.created_at && (Date.now() - new Date(item.created_at).getTime()) < 86400000;
  const shareUrl = `https://deklata.app/item/${id}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent("Check out this free item on Deklata: " + item.name + " - " + shareUrl)}`;
  const isLoggedIn = !!userId;

  // JSON-LD for this specific item
  const itemJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.description,
    image: images.map((img: any) => img.image_url),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GHS",
      availability: item.is_locked
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: pageUrl,
      seller: {
        "@type": "Organization",
        name: "Deklata",
      },
    },
    category: item.categories?.name || "General",
  };

  return (
    <>


      <main style={{ width: "100%", maxWidth: 1140, margin: "0 auto", padding: "16px 20px 48px", boxSizing: "border-box" }}>

        {/* BACK */}
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "none", color: "var(--green-700)", cursor: "pointer",
            marginBottom: 24, fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
            display: "flex", alignItems: "center", gap: 6, padding: 0,
          }}
        >
          ← Back to results
        </button>

        {/* LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }} className="detail-grid">

          {/* LEFT — IMAGES */}
          <div>
            <div
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                setActiveIndex(Math.round(scrollLeft / width));
              }}
              style={{
                display: "flex", width: "100%", overflowX: "auto", overflowY: "hidden",
                scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
                borderRadius: 20, gap: 0,
              }}
            >
              {images.length > 0 ? images.map((img) => (
                <div key={img.id} style={{
                  position: "relative", flexShrink: 0, width: "100%",
                  aspectRatio: "4 / 3", maxHeight: "55vh", borderRadius: 20,
                  scrollSnapAlign: "start", background: "var(--green-50)", overflow: "hidden",
                }}>
                  <Image
                    src={img.image_url}
                    alt={`${item.name} – free item on Deklata`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    style={{ objectFit: "cover" }}
                    priority={img === images[0]}
                  />
                </div>
              )) : (
                <div style={{
                  width: "100%", aspectRatio: "4 / 3", maxHeight: "55vh", background: "var(--green-50)",
                  borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 12, color: "var(--ink-300)",
                }}>
                  <span style={{ fontSize: 48 }}>📷</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>No photos yet</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
                {images.map((_, i) => (
                  <div key={i} style={{
                    width: i === activeIndex ? 20 : 6, height: 6, borderRadius: 999,
                    background: i === activeIndex ? "var(--green-800)" : "var(--ink-100)",
                    transition: "all 0.2s ease",
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — DETAILS */}
          <div style={{
            background: "var(--white)", borderRadius: 20, padding: "24px",
            boxShadow: "var(--shadow-card)", border: "1px solid var(--ink-100)",
          }}>
            <span style={{
              display: "inline-block", background: "var(--gold)", color: "var(--white)",
              padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.5px", fontFamily: "var(--font-display)", marginBottom: 14,
            }}>
              FREE
            </span>

            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
              {item.name}
            </h1>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <span className="meta-pill">{item.categories?.name || "Uncategorized"}</span>
              {item.condition && (
                <span className="meta-pill" style={{ background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}>
                  🏷️ {item.condition}
                </span>
              )}
              {item.pickup_location && (
                <span className="meta-pill" style={{ background: "var(--gold-light)", color: "#92400e", borderColor: "#fde68a" }}>
                  📍 {item.pickup_location}
                </span>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 15, color: "var(--ink-700)", lineHeight: 1.7, marginBottom: 8,
                fontFamily: "var(--font-body)",
                display: "-webkit-box",
                WebkitLineClamp: showFullDescription ? ("unset" as any) : 3,
                WebkitBoxOrient: "vertical" as any,
                overflow: "hidden",
              }}>
                {item.description}
              </p>

              {item.description?.length > 160 && (
                <button
                  onClick={() => setShowFullDescription((v) => !v)}
                  style={{
                    background: "none", border: "none", color: "var(--green-700)", fontWeight: 600,
                    padding: 0, cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)",
                  }}
                >
                  {showFullDescription ? "Show less ↑" : "Read more ↓"}
                </button>
              )}
            </div>

            {requestSuccess && (
              <div style={{
                marginBottom: 16, padding: "12px 16px", background: "var(--green-50)",
                color: "var(--green-800)", borderRadius: 12, fontWeight: 700, textAlign: "center",
                fontSize: 14, fontFamily: "var(--font-body)", border: "1px solid var(--green-100)",
                animation: "fadeIn 0.3s ease",
              }}>
                🎉 Request sent! The owner will be notified.
              </div>
            )}

            {!isOwner && isLoggedIn && hasRequested && !requestSuccess && (
              <div style={{
                marginBottom: 20, padding: "12px 16px", background: "var(--green-50)",
                color: "var(--green-800)", borderRadius: 12, fontWeight: 600, textAlign: "center",
                fontSize: 14, fontFamily: "var(--font-body)", border: "1px solid var(--green-100)",
              }}>
                ✅ You've requested this item — check My Requests for updates
              </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              {!isOwner && !isLoggedIn && (
                <button onClick={() => router.push(`/login?redirect=/item/${id}`)} className="btn-primary">
                  Log in to request
                </button>
              )}
              {!isOwner && isLoggedIn && !hasRequested && (
                <button onClick={requestItem} disabled={requesting} className="btn-primary" style={{ opacity: requesting ? 0.7 : 1 }}>
                  {requesting ? "Requesting…" : "Request this item"}
                </button>
              )}
              {isOwner && (
                <button onClick={deleteItem} className="btn-danger">Delete item</button>
              )}
              {/* WhatsApp Share */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px", borderRadius: 14,
                  border: "1.5px solid #22c55e", background: "#f0fdf4",
                  color: "#16a34a", fontWeight: 700, fontSize: 14,
                  textDecoration: "none", fontFamily: "var(--font-display)",
                }}
              >
                <span>💬</span> Share on WhatsApp
              </a>
            </div>

            {/* Report item */}
            <div style={{ marginTop: 8, textAlign: "center" }}>
              <Link
                href={`/contact?type=complaint&subject=Report+item+${id}`}
                style={{ fontSize: 12, color: "var(--ink-300)", fontFamily: "var(--font-body)", textDecoration: "underline" }}
              >
                🚩 Report this item
              </Link>
            </div>

            {/* Campus + fresh badge */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
              {item.campus && (
                <span className="meta-pill" style={{ fontSize: 12 }}>🏫 {item.campus}</span>
              )}
              {isFreshToday && (
                <span style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: "#dcfce7", color: "#16a34a", fontFamily: "var(--font-display)",
                }}>✨ NEW TODAY</span>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (min-width: 1024px) {
            .detail-grid { grid-template-columns: 1.3fr 1fr !important; align-items: start; }
          }
        `}</style>
      </main>
    </>
  );
}
