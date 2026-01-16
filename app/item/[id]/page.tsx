"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔁 Restore homepage state
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

  useEffect(() => {
    loadItem();
    // eslint-disable-next-line
  }, []);

  async function loadItem() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);

    const { data: itemData } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    const { data: imageData } = await supabase
      .from("item_images")
      .select("*")
      .eq("item_id", id);

    if (user) {
      const { data: existingRequest } = await supabase
        .from("requests")
        .select("id")
        .eq("item_id", id)
        .eq("requester_id", user.id)
        .in("status", ["pending", "approved"])
        .maybeSingle();

      if (existingRequest) setHasRequested(true);
    }

    setItem(itemData);
    setImages(imageData || []);
    setLoading(false);
  }

  async function requestItem() {
    if (!userId) return alert("Please log in");

    setRequesting(true);

    const { error } = await supabase.from("requests").insert({
      item_id: id,
      requester_id: userId,
      status: "pending",
    });

    setRequesting(false);

    if (!error) {
      setHasRequested(true);
    } else {
      alert("You have already requested this item");
    }
  }

  async function deleteItem() {
    if (!confirm("Delete this item permanently?")) return;

    await supabase.from("requests").delete().eq("item_id", id);
    await supabase.from("item_images").delete().eq("item_id", id);
    await supabase.from("items").delete().eq("id", id);

    router.push(backUrl);
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
        Loading item…
      </div>
    );
  }

  const isOwner = userId === item.owner_id;

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      {/* 🔙 BACK TO RESULTS */}
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

      {/* TWO COLUMN LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* 🖼 IMAGE CAROUSEL */}
        <div
          style={{
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

          {/* ACTIONS */}
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

          {!isOwner && !hasRequested && (
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

          {!isOwner && hasRequested && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                background: "#ecfdf5",
                color: "#065f46",
                borderRadius: 14,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              ✅ Item already requested
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
