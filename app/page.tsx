"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "./lib/supabaseClient";

const PAGE_SIZE = 20;

export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [selectedCampus, setSelectedCampus] = useState(searchParams.get("campus") || "all");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") || "");

  // Debounce search — wait 400ms after user stops typing before hitting the DB
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);
  const [showCategories, setShowCategories] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("homeScroll");
    if (savedScroll) {
      requestAnimationFrame(() => { window.scrollTo(0, Number(savedScroll)); });
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (category !== "all") params.set("category", category);
    if (selectedCampus !== "all") params.set("campus", selectedCampus);
    if (search.trim()) params.set("q", search);
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [page, category, selectedCampus, search, router]);

  useEffect(() => {
    const CACHE_KEY = "deklata_categories";
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) { setCategories(data); return; }
      }
    } catch {}
    supabase.from("categories").select("id, name").order("name")
      .then(({ data }) => {
        setCategories(data || []);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data || [], ts: Date.now() })); } catch {}
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadHomeDataSafe() {
      try {
        setLoading(true);

        // Build query with ALL filters server-side — searches entire database
        let query = supabase
          .from("items")
          .select(`id, name, description, pickup_location, owner_id, campus, is_locked, category_id, categories ( id, name )`, { count: "exact" })
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        // Server-side search across name + description
        if (debouncedSearch.trim()) {
          query = query.or(`name.ilike.%${debouncedSearch.trim()}%,description.ilike.%${debouncedSearch.trim()}%,pickup_location.ilike.%${debouncedSearch.trim()}%`);
        }

        // Server-side category filter
        if (category !== "all") {
          query = query.eq("category_id", category);
        }

        // Server-side campus filter — match both dash and space variants
        if (selectedCampus !== "all") {
          const withSpaces = selectedCampus.replace(/-/g, " ");   // "uds tamale"
          const withDashes = selectedCampus;                       // "uds-tamale"
          query = query.or(`campus.ilike.%${withSpaces}%,campus.ilike.%${withDashes}%`);
        }

        const { data: items, count, error: itemsError } = await query;
        if (itemsError) { console.error(itemsError); if (!cancelled) setLoading(false); return; }
        if (!items || items.length === 0) {
          if (!cancelled) { setItems([]); setTotalCount(0); setLoading(false); }
          return;
        }

        const itemIds = items.map((item: any) => item.id);
        const { data: images = [] } = await supabase
          .from("item_images").select("item_id, image_url").in("item_id", itemIds);

        const itemsWithImages = items.map((item: any) => ({
          ...item,
          item_images: (images ?? []).filter((img: any) => img.item_id === item.id),
        }));

        if (!cancelled) {
          setItems(itemsWithImages);
          setTotalCount(count || 0);
          setLoading(false);
        }

        supabase.auth.getUser().then(({ data }) => {
          if (!cancelled && data?.user) setUserId(data.user.id);
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoading(false);
      }
    }
    loadHomeDataSafe();
    return () => { cancelled = true; };
  }, [page, debouncedSearch, category, selectedCampus]);

  // Filtering and pagination now handled server-side by Supabase
  const filteredItems = items;
  const paginatedItems = items;
  const visibleCount = totalCount;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading) {
    return (
      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 240, animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px 40px", width: "100%", boxSizing: "border-box" }}>

      {/* STICKY FILTER BAR */}
      <div style={{
        position: "sticky",
        top: 64,
        zIndex: 50,
        background: "rgba(250,249,246,0.95)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        paddingTop: 16,
        paddingBottom: 12,
        borderBottom: "1px solid var(--ink-100)",
        marginBottom: 20,
      }}>
        {/* SEARCH */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--ink-300)",
            fontSize: 16,
            pointerEvents: "none",
          }}>🔍</span>
          <input
            placeholder="Search items..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input"
            style={{ paddingLeft: 42, paddingRight: 16 }}
          />
        </div>

        {/* CAMPUS + CONTROLS */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={selectedCampus}
            onChange={(e) => {
              const value = e.target.value;
              const params = new URLSearchParams(searchParams.toString());
              params.set("campus", value);
              params.set("page", "1");
              router.push(`/?${params.toString()}`);
              setSelectedCampus(value);
              setPage(1);
            }}
            className="form-input"
            style={{ flex: 1, minWidth: 160 }}
          >
            <option value="all">All campuses</option>
            <option value="uds-tamale">UDS – Tamale</option>
            <option value="uds-nyankpala">UDS – Nyankpala</option>
            <option value="tamale-technical-university">Tamale Technical University</option>
          </select>

          <button
            onClick={() => setShowFilters((s) => !s)}
            className="btn-secondary"
            style={{ background: showFilters ? "var(--green-50)" : undefined }}
          >
            <span style={{ fontSize: 13 }}>≡</span> Filters
          </button>

          <button
            onClick={() => {
              setCategory("all");
              setSelectedCampus("all");
              setSearch("");
              setPage(1);
              router.replace("/?page=1", { scroll: false });
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ display: !showFilters ? "none" : "block", marginBottom: 4 }} id="filter-panel">
        <div className="category-wrapper">
          <button
            className="category-toggle"
            onClick={() => setShowCategories((v) => !v)}
          >
            ☰ Categories
          </button>
          <div className={`category-content ${showCategories ? "open" : ""}`}
            style={{ display: "flex" }}>
            <button
              aria-pressed={category === "all"}
              className={`category-btn ${category === "all" ? "active" : ""}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("category", "all");
                params.set("page", "1");
                router.push(`/?${params.toString()}`);
                setCategory("all");
                setPage(1);
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                aria-pressed={category === cat.id}
                className={`category-btn ${category === cat.id ? "active" : ""}`}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("category", cat.id);
                  params.set("page", "1");
                  router.push(`/?${params.toString()}`);
                  setCategory(cat.id);
                  setPage(1);
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <p style={{
        marginBottom: 20,
        fontSize: 13,
        color: "var(--ink-500)",
        fontFamily: "var(--font-body)",
      }}>
        <strong style={{ color: "var(--ink-900)", fontFamily: "var(--font-display)" }}>
          {visibleCount}
        </strong>{" "}
        {visibleCount === 1 ? "item" : "items"} available
        {selectedCampus !== "all" && " on this campus"}
      </p>

      {/* EMPTY STATE */}
      {paginatedItems.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "64px 24px",
          color: "var(--ink-500)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink-900)", marginBottom: 8 }}>
            No items found
          </p>
          <p style={{ color: "var(--ink-500)", fontSize: 14, marginBottom: 20 }}>
            Try adjusting your filters or search terms
          </p>
          <Link href="/add-item" style={{
            display: "inline-block",
            background: "var(--green-800)",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: 999,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 14,
          }}>
            + Give something away
          </Link>
        </div>
      )}

      {/* ITEM GRID */}
      <div className="item-grid">
        {paginatedItems.map((item) => {
          const isOwner = userId === item.owner_id;
          const isRequested = !!userId && item.is_locked; // only logged-in users see greyed/locked state
          const hasImage = item.item_images?.length > 0;

          return (
            <div
              key={item.id}
              className="item-card"
              onClick={() => router.push(`/item/${item.id}?${searchParams.toString()}`)}
              style={{
                opacity: isRequested ? 0.5 : 1,
                pointerEvents: isRequested ? "none" : "auto",
                position: "relative",
              }}
            >
              {/* IMAGE */}
              <div style={{ height: 160, background: "var(--green-50)", overflow: "hidden", position: "relative", display: "block" }}>
                {hasImage ? (
                  <Image
                    src={item.item_images[0].image_url}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 8,
                    color: "var(--ink-300)",
                  }}>
                    <span style={{ fontSize: 32 }}>📷</span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-body)" }}>No photo</span>
                  </div>
                )}

                {/* BADGES */}
                {!isOwner && isRequested && (
                  <span className="badge-requested">Requested</span>
                )}
                <span className="badge-free">FREE</span>
              </div>

              {/* CONTENT */}
              <Link
                href={`/item/${item.id}?${searchParams.toString()}`}
                onClick={() => sessionStorage.setItem("homeScroll", String(window.scrollY))}
                style={{ display: "block", color: "inherit", textDecoration: "none" }}
              >
                <div style={{ padding: "12px 14px 14px" }}>
                  <h3 style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 4,
                    lineHeight: 1.3,
                    color: "var(--ink-900)",
                    fontFamily: "var(--font-display)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {item.name}
                  </h3>

                  <p style={{
                    fontSize: 12,
                    color: "var(--ink-500)",
                    margin: "4px 0 10px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.5,
                    minHeight: "2.6em",
                    fontFamily: "var(--font-body)",
                  }}>
                    {item.description}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span className="meta-pill">
                        {item.categories?.name || "Uncategorized"}
                      </span>
                      {(Date.now() - new Date(item.created_at).getTime()) < 86400000 && (
                        <span style={{
                          padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                          background: "#dcfce7", color: "#16a34a", fontFamily: "var(--font-display)",
                          letterSpacing: "0.3px",
                        }}>✨ NEW</span>
                      )}
                    </div>
                    {item.pickup_location && (
                      <span className="location-pill">
                        📍 {item.pickup_location}
                      </span>
                    )}
                    {item.campus && (
                      <span style={{
                        fontSize: 11, color: "var(--ink-400)", fontFamily: "var(--font-body)",
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        🏫 {item.campus}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          marginTop: 40,
          flexWrap: "wrap",
        }}>
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>

          <span style={{
            fontSize: 13,
            color: "var(--ink-500)",
            fontFamily: "var(--font-body)",
          }}>
            Page <strong style={{ color: "var(--ink-900)" }}>{page}</strong> of <strong style={{ color: "var(--ink-900)" }}>{totalPages}</strong>
          </span>

          <button
            className="pagination-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
