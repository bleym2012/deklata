"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

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
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  /* ✅ NEW: active image index */
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadItem() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user ? user.id : null);

    const { data: itemData } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    const { data: imageData } = await supabase
      .from("item_images")
      .select("*")
      .eq("item_id", id);

    setItem(itemData);
    setImages(imageData || []);
    setActiveIndex(0);
    setLoading(false);
  }

  async function requestItem() {
    if (!userId) {
      router.push(`/login?redirect=/item/${id}`);
      return;
    }

    if (item?.is_locked) return;

    setRequesting(true);

    await supabase.rpc("request_item", {
      p_item_id: id,
      p_user_id: userId,
    });

    await loadItem();
    setRequesting(false);
  }

  async function deleteItem() {
    if (!confirm("Delete this item permanently?")) return;

    await supabase.from("requests").delete().eq("item_id", id);
    await supabase.from("item_images").delete().eq("item_id", id);
    await supabase.from("items").delete().eq("id", id);

    router.push(backUrl);
  }

  if (loading || !item) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
        Loading item…
      </div>
    );
  }

  const isOwner = userId === item.owner_id;
  const isLocked = item.is_locked === true;
  const isLoggedIn = !!userId;

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      {/* 🔙 BACK */}
      <button
        onClick={() => router.push(backUrl)}
        style={{
          background: "none",
          border: "none",
          color: "#2563eb",
          cursor: "pointer",
          marginBottom: 24,
          fontSize: 14,
        }}
      >
        ← Back to results
      </button>

      {/* 🔁 RESPONSIVE LAYOUT */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* 🖼 IMAGE CAROUSEL */}
        <div>
          <div
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.clientWidth;
              const index = Math.round(scrollLeft / width);
              setActiveIndex(index);
            }}
            style={{
              width: "100%",
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              gap: 16,
              paddingBottom: 10,
            }}
          >
            {images.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={item.name}
                style={{
                  minWidth: "100%",
                  height: 420,
                  objectFit: "cover",
                  borderRadius: 18,
                  scrollSnapAlign: "start",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                }}
              />
            ))}
          </div>

          {/* ✅ IMAGE COUNT */}
          {images.length > 1 && (
            <div
              style={{
                marginTop: 8,
                textAlign: "center",
                fontSize: 13,
                color: "#666",
                fontWeight: 500,
              }}
            >
              {activeIndex + 1} of {images.length}
            </div>
          )}
        </div>

        {/* 📄 DETAILS */}
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 10 }}>
            {item.name}
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#555",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {item.description}
          </p>

          <div
            style={{
              background: "#f9fafb",
              padding: 16,
              borderRadius: 14,
              marginBottom: 24,
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Category:</strong> {item.category}
            </p>
            <p style={{ marginTop: 6 }}>
              <strong>Pickup location:</strong> {item.pickup_location}
            </p>
          </div>

          {!isOwner && isLoggedIn && isLocked && (
            <div
              style={{
                marginBottom: 16,
                padding: 14,
                background: "#f3f4f6",
                color: "#555",
                borderRadius: 14,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              🚫 This item has already been requested
            </div>
          )}

          {isOwner && (
            <button
              onClick={deleteItem}
              style={{
                width: "100%",
                padding: "14px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Delete Item
            </button>
          )}

          {!isOwner && !isLoggedIn && (
            <button
              onClick={() => router.push(`/login?redirect=/item/${id}`)}
              style={{
                width: "100%",
                padding: "14px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Request Item
            </button>
          )}

          {!isOwner && isLoggedIn && !isLocked && (
            <button
              onClick={requestItem}
              disabled={requesting}
              style={{
                width: "100%",
                padding: "14px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                opacity: requesting ? 0.7 : 1,
              }}
            >
              {requesting ? "Requesting…" : "Request Item"}
            </button>
          )}
        </div>
      </div>

      {/* 🖥 DESKTOP ENHANCEMENT */}
      <style jsx>{`
        @media (min-width: 1024px) {
          main > div {
            flex-direction: row;
            align-items: flex-start;
          }

          main > div > div:first-child {
            flex: 1.2;
          }

          main > div > div:last-child {
            flex: 1;
          }
        }
      `}</style>
    </main>
  );
}
