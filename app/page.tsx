"use client";

export const dynamic = "force-dynamic";
export const fetchcache = "force-no-store";
export const revalidate = 0;

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "./lib/supabaseClient";

const CATEGORIES = ["all", "books", "electronics", "furniture", "others"];
const PAGE_SIZE = 20;

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  /* 🔁 STATE (INITIALIZED SAFELY — NO BUILD ACCESS) */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  /* 🔁 RESTORE STATE FROM URL (RUNTIME ONLY) */
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "all");
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  /* 🔁 SYNC STATE → URL */
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (category !== "all") params.set("category", category);
    if (search.trim()) params.set("q", search);

    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [page, category, search, router]);

  /* ✅ SAVE RESULTS STATE (CLIENT ONLY) */
  useEffect(() => {
    if (typeof window === "undefined") return;

    sessionStorage.setItem(
      "deklata:lastResults",
      JSON.stringify({ page, category, q: search })
    );
  }, [page, category, search]);

  /* 🔄 LOAD ITEMS */
  useEffect(() => {
    let cancelled = false;

    async function loadHomeDataSafe() {
      try {
        setLoading(true);

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count, error } = await supabase
          .from("items")
          .select(
            "id, name, description, category, pickup_location, owner_id, is_locked",
            { count: "exact" }
          )
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (!cancelled) {
          setItems(data || []);
          setFilteredItems(data || []);
          setTotalCount(count || 0);
          setLoading(false);
        }

        if (error) console.error(error);

        supabase.auth.getUser().then(({ data }) => {
          if (!cancelled && data?.user) {
            setUserId(data.user.id);
          }
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

  /* 🦴 SKELETON */
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
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
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

      {/* 🧱 GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {filteredItems.map((item) => {
          const isOwner = userId === item.owner_id;
          const isLoggedIn = !!userId;
          const isRequested = isLoggedIn && item.is_locked === true;

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
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>{item.name}</h3>
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
