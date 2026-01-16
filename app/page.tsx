"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabaseClient";

const CATEGORIES = ["all", "books", "electronics", "furniture", "others"];
const PAGE_SIZE = 20;

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [requestedItemIds, setRequestedItemIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeDataSafe() {
      try {
        setLoading(true);

        /* 1️⃣ LOAD ITEMS (FAST) */
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data: itemsData, count, error } = await supabase
          .from("items")
          .select(
            "id, name, description, category, pickup_location, owner_id",
            { count: "exact" }
          )
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (!cancelled) {
          setItems(itemsData || []);
          setFilteredItems(itemsData || []);
          setTotalCount(count || 0);
          setLoading(false);
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

    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [page]);

  /* 🔍 FILTERING (CLIENT-SIDE) */
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
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 160,
              borderRadius: 14,
              background: "#f3f4f6",
              marginBottom: 16,
              animation: "pulse 1.5s infinite",
            }}
          />
        ))}
      </main>
    );
  }

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
        }}
      />

      {/* 🏷 CATEGORIES */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: category === cat ? "#111" : "#fff",
              color: category === cat ? "#fff" : "#111",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* 📊 RESULT COUNT */}
      <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
        Showing <strong>{startItem}–{endItem}</strong> of{" "}
        <strong>{totalCount}</strong> items
      </p>

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

              <Link href={`/item/${item.id}`} style={{ color: "inherit" }}>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: 14, color: "#555", margin: "8px 0" }}>
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

      {/* 🔢 PAGINATION */}
      <div
        style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: page === i + 1 ? "#111" : "#fff",
              color: page === i + 1 ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </main>
  );
}
