"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "./lib/supabaseClient";

const PAGE_SIZE = 20;

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── ALL filter state lives in the URL — never in React state ──────────────
  // Reading directly from searchParams on every render means the URL IS the truth.
  // No useEffect syncing state→URL. No fighting between state and URL on back-nav.
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || "all";
  const selectedCampus = searchParams.get("campus") || "all";
  const q = searchParams.get("q") || "";

  // Search input only needs local state for the controlled input value
  const [searchInput, setSearchInput] = useState(q);
  const [debouncedQ, setDebouncedQ] = useState(q);

  // Sync input when URL q changes (Clear button, back-nav with search)
  const prevQ = useRef(q);
  useEffect(() => {
    if (q !== prevQ.current) {
      prevQ.current = q;
      setSearchInput(q);
      setDebouncedQ(q);
    }
  }, [q]);

  // Debounce typing — update URL after 400ms, which triggers data reload via searchParams
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      params.delete("page"); // reset to page 1 on new search
      router.replace(`/?${params.toString()}`, { scroll: false });
    }, 400);
  }

  // Push a single param change (category, campus) — always resets page
  function pushParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  // Pagination — just update page param
  function pushPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  // Save scroll position and navigate to item — on return, scroll restore fires
  function goToItem(itemId: string) {
    sessionStorage.setItem("homeScroll", String(window.scrollY));
    router.push(`/item/${itemId}?${searchParams.toString()}`);
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Scroll restore — fires once after items finish loading on return from item page
  useEffect(() => {
    if (loading) return;
    const saved = sessionStorage.getItem("homeScroll");
    if (!saved) return;
    const t = setTimeout(() => {
      window.scrollTo({ top: Number(saved), behavior: "instant" });
      sessionStorage.removeItem("homeScroll");
    }, 80);
    return () => clearTimeout(t);
  }, [loading]);

  // Categories (cached 24h in localStorage)
  useEffect(() => {
    const KEY = "deklata_categories";
    const TTL = 24 * 60 * 60 * 1000;
    try {
      const cached = localStorage.getItem(KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < TTL) {
          setCategories(data);
          return;
        }
      }
    } catch {}
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        setCategories(data || []);
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({ data: data || [], ts: Date.now() }),
          );
        } catch {}
      });
  }, []);

  // Items — re-runs when URL params change (page, category, campus, q)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        let query = supabase
          .from("items")
          .select(
            `id, name, description, pickup_location, owner_id, campus, is_locked, category_id, created_at, categories ( id, name )`,
            { count: "exact" },
          )
          .eq("status", "available")
          .order("created_at", { ascending: false })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        if (debouncedQ.trim()) {
          query = query.or(
            `name.ilike.%${debouncedQ.trim()}%,description.ilike.%${debouncedQ.trim()}%,pickup_location.ilike.%${debouncedQ.trim()}%`,
          );
        }
        if (category !== "all") query = query.eq("category_id", category);
        if (selectedCampus !== "all") {
          const withSpaces = selectedCampus.replace(/-/g, " ");
          query = query.or(
            `campus.ilike.%${withSpaces}%,campus.ilike.%${selectedCampus}%`,
          );
        }

        const { data: itemData, count, error } = await query;
        if (error) {
          if (!cancelled) setLoading(false);
          return;
        }

        if (!itemData?.length) {
          if (!cancelled) {
            setItems([]);
            setTotalCount(0);
            setLoading(false);
          }
          return;
        }

        const ids = itemData.map((i: any) => i.id);
        const { data: images = [] } = await supabase
          .from("item_images")
          .select("item_id, image_url")
          .in("item_id", ids);

        const withImages = itemData.map((item: any) => ({
          ...item,
          item_images: (images ?? []).filter(
            (img: any) => img.item_id === item.id,
          ),
        }));

        if (!cancelled) {
          setItems(withImages);
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
    load();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQ, category, selectedCampus]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading) {
    return (
      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 240, animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 1140,
        margin: "0 auto",
        padding: "0 20px 40px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* STICKY FILTER BAR */}
      <div
        style={{
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
        }}
      >
        {/* SEARCH */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--ink-300)",
              fontSize: 16,
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            placeholder="Search items..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 42, paddingRight: 16 }}
          />
        </div>

        {/* CAMPUS + CONTROLS */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={selectedCampus}
            onChange={(e) => pushParam("campus", e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: 160 }}
          >
            <option value="all">All campuses</option>
            <option value="uds-tamale">UDS – Tamale</option>
            <option value="uds-nyankpala">UDS – Nyankpala</option>
            <option value="tamale-technical-university">
              Tamale Technical University
            </option>
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
              setSearchInput("");
              setDebouncedQ("");
              router.push("/", { scroll: false });
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div
        style={{ display: !showFilters ? "none" : "block", marginBottom: 4 }}
        id="filter-panel"
      >
        <div className="category-wrapper">
          <button
            className="category-toggle"
            onClick={() => setShowCategories((v) => !v)}
          >
            ☰ Categories
          </button>
          <div
            className={`category-content ${showCategories ? "open" : ""}`}
            style={{ display: "flex" }}
          >
            <button
              aria-pressed={category === "all"}
              className={`category-btn ${category === "all" ? "active" : ""}`}
              onClick={() => pushParam("category", "all")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                aria-pressed={category === cat.id}
                className={`category-btn ${category === cat.id ? "active" : ""}`}
                onClick={() => pushParam("category", cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <p
        style={{
          marginBottom: 20,
          fontSize: 13,
          color: "var(--ink-500)",
          fontFamily: "var(--font-body)",
        }}
      >
        <strong
          style={{ color: "var(--ink-900)", fontFamily: "var(--font-display)" }}
        >
          {totalCount}
        </strong>{" "}
        {totalCount === 1 ? "item" : "items"} available
        {selectedCampus !== "all" && " on this campus"}
      </p>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            color: "var(--ink-500)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--ink-900)",
              marginBottom: 8,
            }}
          >
            No items found
          </p>
          <p
            style={{ color: "var(--ink-500)", fontSize: 14, marginBottom: 20 }}
          >
            Try adjusting your filters or search terms
          </p>
          <Link
            href="/add-item"
            style={{
              display: "inline-block",
              background: "var(--green-800)",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 999,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            + Give something away
          </Link>
        </div>
      )}

      {/* ITEM GRID */}
      <div className="item-grid">
        {items.map((item) => {
          const isOwner = userId === item.owner_id;
          const isRequested = !!userId && item.is_locked;
          const hasImage = item.item_images?.length > 0;
          return (
            <div
              key={item.id}
              className="item-card"
              onClick={() => goToItem(item.id)}
              style={{
                opacity: !isOwner && isRequested ? 0.5 : 1,
                pointerEvents: !isOwner && isRequested ? "none" : "auto",
                position: "relative",
              }}
            >
              {/* IMAGE */}
              <div
                style={{
                  height: 160,
                  background: "var(--green-50)",
                  overflow: "hidden",
                  position: "relative",
                  display: "block",
                }}
              >
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
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 8,
                      color: "var(--ink-300)",
                    }}
                  >
                    <span style={{ fontSize: 32 }}>📷</span>
                    <span
                      style={{ fontSize: 11, fontFamily: "var(--font-body)" }}
                    >
                      No photo
                    </span>
                  </div>
                )}
                {!isOwner && isRequested && (
                  <span className="badge-requested">Requested</span>
                )}
                <span className="badge-free">FREE</span>
              </div>

              {/* CONTENT */}
              <Link
                href={`/item/${item.id}?${searchParams.toString()}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToItem(item.id);
                }}
                style={{
                  display: "block",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <div style={{ padding: "12px 14px 14px" }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 4,
                      lineHeight: 1.3,
                      color: "var(--ink-900)",
                      fontFamily: "var(--font-display)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </h3>

                  <p
                    style={{
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
                    }}
                  >
                    {item.description}
                  </p>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span className="meta-pill">
                        {item.categories?.name || "Uncategorized"}
                      </span>
                      {Date.now() - new Date(item.created_at).getTime() <
                        86400000 && (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            background: "#dcfce7",
                            color: "#16a34a",
                            fontFamily: "var(--font-display)",
                            letterSpacing: "0.3px",
                          }}
                        >
                          ✨ NEW
                        </span>
                      )}
                    </div>
                    {item.pickup_location && (
                      <span className="location-pill">
                        📍&nbsp;
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                            color: "#92400e",
                            fontSize: 11,
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                          }}
                        >
                          {item.pickup_location}
                        </span>
                      </span>
                    )}
                    {item.campus && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--ink-400)",
                          fontFamily: "var(--font-body)",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            marginTop: 40,
            flexWrap: "wrap",
          }}
        >
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => pushPage(page - 1)}
          >
            ← Previous
          </button>
          <span
            style={{
              fontSize: 13,
              color: "var(--ink-500)",
              fontFamily: "var(--font-body)",
            }}
          >
            Page <strong style={{ color: "var(--ink-900)" }}>{page}</strong> of{" "}
            <strong style={{ color: "var(--ink-900)" }}>{totalPages}</strong>
          </span>
          <button
            className="pagination-btn"
            disabled={page === totalPages}
            onClick={() => pushPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
