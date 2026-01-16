"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabaseClient";

const CATEGORIES = ["all", "books", "electronics", "furniture", "others"];

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [requestedItemIds, setRequestedItemIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeDataSafe() {
      try {
        setLoading(true);

        /* 1️⃣ LOAD ITEMS FIRST (FAST, NON-BLOCKING) */
        const { data: itemsData, error } = await supabase
          .from("items")
          .select("id, name, description, category, pickup_location, owner_id")
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .limit(20);

        if (!cancelled) {
          setItems(itemsData || []);
          setFilteredItems(itemsData || []);
          setLoading(false); // stop loading immediately
        }

        if (error) console.error(error);

        /* 2️⃣ NON-BLOCKING USER ENHANCEMENT */
        supabase.auth.getUser().then(({ data }) => {
          if (!data?.user || cancelled) return;

          setUserId(data.user.id);

          supabase
            .from("requests")
            .select("item_id")
            .eq("requester_id", data.user.id)
            .in("status", ["pending", "approved"])
            .then(({ data: requests }) => {
              if (!cancelled && requests) {
                setRequestedItemIds(
                  new Set(requests.map((r) => r.item_id))
                );
              }
            });
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoading(false);
      }
    }

    loadHomeDataSafe();

    /* 🛑 SAFETY TIMEOUT — NEVER HANGS */
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  /* 🔍 FILTERING */
  useEffect(() => {
    let result = [...items];

    if (category !== "all") {
      result = result.filter(
        (item) =>
          item.category &&
          item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    setFilteredItems(result);
  }, [search, category, items]);

  /* 🦴 SKELETON LOADER */
  if (loading) {
    return (
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        {/* Skeleton search bar */}
        <div
          style={{
            height: 48,
            borderRadius: 10,
            background: "#f3f4f6",
            marginBottom: 18,
            animation: "pulse 1.5s infinite",
          }}
        />

        {/* Skeleton category pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 32,
                width: 80,
                borderRadius: 999,
                background: "#f3f4f6",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>

        {/* Skeleton cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 160,
                borderRadius: 14,
                background: "#f3f4f6",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 16px",
          marginBottom: 18,
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          fontSize: 15,
          outline: "none",
        }}
      />

      {/* 🏷 CATEGORIES */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: category === cat ? "#111" : "#fff",
              color: category === cat ? "#fff" : "#111",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* 🧱 ITEMS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {filteredItems.map((item) => {
          const isOwner = userId === item.owner_id;
          const isRequested = requestedItemIds.has(item.id);

          return (
            <div
              key={item.id}
              style={{
                borderRadius: 14,
                padding: 16,
                background: "#fff",
                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                opacity: !isOwner && isRequested ? 0.5 : 1,
                pointerEvents: !isOwner && isRequested ? "none" : "auto",
                position: "relative",
              }}
            >
              {!isOwner && isRequested && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "#f3f4f6",
                    color: "#555",
                    padding: "4px 10px",
                    fontSize: 12,
                    borderRadius: 999,
                  }}
                >
                  Requested
                </span>
              )}

              <Link
                href={`/item/${item.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                  {item.name}
                </h3>

                <p style={{ fontSize: 14, color: "#555", marginBottom: 10 }}>
                  {item.description}
                </p>

                <p style={{ fontSize: 13, color: "#666" }}>
                  <strong>Category:</strong> {item.category}
                </p>
                <p style={{ fontSize: 13, color: "#666" }}>
                  <strong>Pickup:</strong> {item.pickup_location}
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
