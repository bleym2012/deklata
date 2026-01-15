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
    loadHomeData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, category, items]);

  async function loadHomeData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);

      const { data: requests } = await supabase
        .from("requests")
        .select("item_id")
        .eq("requester_id", user.id)
        .in("status", ["pending", "approved"]);

      setRequestedItemIds(new Set(requests?.map((r) => r.item_id)));
    }

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (!error) {
      setItems(data || []);
      setFilteredItems(data || []);
    }

    setLoading(false);
  }

  function applyFilters() {
    let result = [...items];

    if (category !== "all") {
       const normalizedCategory =
    category.toLowerCase()
      result = result.filter(
        (item) => 
          item.category && 
          item.category.toLowerCase() === normalizedCategory);
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
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
        Loading items…
      </div>
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
      {/* 🔷 HEADER */}

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
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      />

      {/* 🏷 CATEGORIES */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
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
              transition: "all 0.2s",
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
                transition: "transform 0.15s ease",
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

      {/* 🔻 FOOTER */}
      <footer
        style={{
          marginTop: 60,
          paddingTop: 24,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 14,
          color: "#666",
        }}
      >
        <span>© {new Date().getFullYear()} Deklata</span>
        <Link href="/how-it-works">How It Works</Link>
        <Link href="/terms">Terms of Use</Link>
        <Link href="/guidelines">Community Guidelines</Link>
      </footer>
    </main>
  );
}
