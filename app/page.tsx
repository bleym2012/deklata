"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "./lib/supabaseClient";

const PAGE_SIZE = 20;

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── URL is the single source of truth for all filter state ────────────────
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || "all";
  const selectedCampus = searchParams.get("campus") || "all";
  const q = searchParams.get("q") || "";

  // Local input state — only committed to URL on Search button / Enter
  const [searchInput, setSearchInput] = useState(q);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input when URL q changes (back-nav, Clear)
  const prevQ = useRef(q);
  useEffect(() => {
    if (q !== prevQ.current) {
      prevQ.current = q;
      setSearchInput(q);
    }
  }, [q]);

  // ── Autocomplete — lightweight name lookup, fires 250ms after typing ──────
  const fetchSuggestions = useCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const { data } = await supabase
      .from("items")
      .select("name")
      .eq("status", "available")
      .ilike("name", `%${value.trim()}%`)
      .limit(7);
    if (data) {
      const unique = [...new Set(data.map((d: any) => d.name as string))];
      setSuggestions(unique);
    }
  }, []);

  function handleInputChange(value: string) {
    setSearchInput(value);
    setActiveSuggestion(-1);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    suggestTimer.current = setTimeout(() => fetchSuggestions(value), 250);
  }

  // ── Commit search to URL — this is what fires the DB query ───────────────
  function commitSearch(value: string) {
    setShowSuggestions(false);
    setSuggestions([]);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  function handleSearchSubmit() {
    commitSearch(searchInput);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        const chosen = suggestions[activeSuggestion];
        setSearchInput(chosen);
        commitSearch(chosen);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function handleSuggestionClick(name: string) {
    setSearchInput(name);
    commitSearch(name);
  }

  function handleClear() {
    setSearchInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/?${params.toString()}`, { scroll: false });
    inputRef.current?.focus();
  }

  // Close suggestions on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ── Filter helpers ────────────────────────────────────────────────────────
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

  function pushPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  }

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
  const [bannerVisible, setBannerVisible] = useState(true);

  // Hide banner on scroll — show again only if back at very top
  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      if (y > 40) setBannerVisible(false);
      else if (y === 0) setBannerVisible(true);
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll restore on back-nav
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

  // Categories (cached 24h)
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

  // Items — re-runs only when URL params change (q committed via Search button)
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

        if (q.trim()) {
          query = query.or(
            `name.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,pickup_location.ilike.%${q.trim()}%`,
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
  }, [page, q, category, selectedCampus]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Skeleton ──────────────────────────────────────────────────────────────
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
      {/* ── HERO BANNER ── */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: bannerVisible ? 200 : 0,
          opacity: bannerVisible ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.3s ease",
          marginBottom: bannerVisible ? 0 : 0,
        }}
      >
        <div
          className="hero-banner"
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            border: "1px solid #bbf7d0",
            borderRadius: 16,
            padding: "18px 20px",
            margin: "16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Text */}
          <div style={{ minWidth: 0 }}>
            <p
              className="hero-banner-headline"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 18,
                color: "var(--green-900, #14532d)",
                margin: 0,
                lineHeight: 1.25,
                letterSpacing: "-0.3px",
              }}
            >
              Give what you don&apos;t need.{" "}
              <span style={{ color: "var(--green-700)" }}>
                Get what you do.
              </span>
            </p>
            <p
              className="hero-banner-sub"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--green-700)",
                margin: "5px 0 0",
                lineHeight: 1.4,
              }}
            >
              Free student item exchange across Tamale campuses. 100% free,
              always.
            </p>
          </div>

          {/* Emoji accent */}
          <span
            style={{
              fontSize: 36,
              flexShrink: 0,
              lineHeight: 1,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
            }}
            aria-hidden
          >
            🎓
          </span>
        </div>
      </div>

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
        {/* ── SEARCH BAR ── */}
        <div ref={searchRef} style={{ position: "relative", marginBottom: 12 }}>
          {/* Input + buttons row */}
          <div
            className="search-bar-input-row"
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              border: "1.5px solid var(--ink-200)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Search icon */}
            <span
              style={{
                paddingLeft: 14,
                fontSize: 16,
                color: "var(--ink-300)",
                flexShrink: 0,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              🔍
            </span>

            {/* Input */}
            <input
              ref={inputRef}
              placeholder="Search items..."
              value={searchInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchInput.trim() && suggestions.length > 0)
                  setShowSuggestions(true);
              }}
              className="search-bar-input"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15,
                fontFamily: "var(--font-body)",
                color: "var(--ink-900)",
                padding: "12px 8px",
                minWidth: 0,
              }}
            />

            {/* X clear button */}
            {searchInput && (
              <button
                onClick={handleClear}
                aria-label="Clear search"
                className="search-bar-clear"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 6px",
                  color: "var(--ink-400)",
                  fontSize: 16,
                  lineHeight: 1,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                }}
              >
                ✕
              </button>
            )}

            {/* Divider */}
            <div
              className="search-bar-divider"
              style={{
                width: 1,
                height: 24,
                background: "var(--ink-100)",
                flexShrink: 0,
                margin: "0 2px",
              }}
            />

            {/* Search button */}
            <button
              onClick={handleSearchSubmit}
              style={{
                background: "var(--green-800)",
                color: "#fff",
                border: "none",
                borderRadius: "0 10px 10px 0",
                padding: "0 18px",
                height: 46,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </div>

          {/* ── SUGGESTIONS DROPDOWN ── */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="search-suggestions"
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1.5px solid var(--ink-150, #e5e3df)",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              {suggestions.map((name, i) => (
                <div
                  key={name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(name);
                  }}
                  onMouseEnter={() => setActiveSuggestion(i)}
                  onMouseLeave={() => setActiveSuggestion(-1)}
                  className={`search-suggestion-row${activeSuggestion === i ? " active" : ""}`}
                  style={{
                    padding: "11px 16px",
                    fontSize: 14,
                    fontFamily: "var(--font-body)",
                    color: "var(--ink-900)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background:
                      activeSuggestion === i ? "var(--green-50)" : "#fff",
                    borderBottom:
                      i < suggestions.length - 1
                        ? "1px solid var(--ink-100)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      color: "var(--ink-300)",
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    🔍
                  </span>
                  <span>{highlightMatch(name, searchInput)}</span>
                </div>
              ))}
            </div>
          )}
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
              setSuggestions([]);
              setShowSuggestions(false);
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
        {q && (
          <span style={{ color: "var(--green-700)", fontWeight: 600 }}>
            {" "}
            for "{q}"
          </span>
        )}
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

// Bold the matched portion in suggestion text
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{ color: "var(--green-800)", fontWeight: 700 }}>
        {text.slice(idx, idx + query.trim().length)}
      </strong>
      {text.slice(idx + query.trim().length)}
    </>
  );
}
