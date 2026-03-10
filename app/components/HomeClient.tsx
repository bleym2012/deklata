"use client";
// ─────────────────────────────────────────────────────────────────────────────
// app/components/HomeClient.tsx
//
// This is the ONLY client component on the homepage.
// It handles: search bar, filters, pagination, hero banner scroll behaviour,
// and requesting state for the logged-in user.
//
// The item grid HTML is passed in as pre-rendered server data (props) so it
// paints immediately on first load — no waiting for JS.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import ItemGrid from "./ItemGrid";

interface Props {
  initialItems: any[];
  totalCount: number;
  totalPages: number;
  categories: { id: string; name: string }[];
  currentPage: number;
  currentCategory: string;
  currentCampus: string;
  currentQ: string;
}

export default function HomeClient({
  initialItems,
  totalCount,
  totalPages,
  categories,
  currentPage,
  currentCategory,
  currentCampus,
  currentQ,
}: Props) {
  const router = useRouter();

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(currentQ);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  // ── Auth — non-blocking, fires after page is already visible ───────────────
  const [userId, setUserId] = useState<string | null>(null);
  const [myRequestedItemIds, setMyRequestedItemIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    // getSession() reads from localStorage — no network call, instant
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        supabase
          .from("requests")
          .select("item_id")
          .eq("requester_id", uid)
          .eq("status", "pending")
          .then(({ data: reqs }) => {
            if (reqs)
              setMyRequestedItemIds(new Set(reqs.map((r: any) => r.item_id)));
          });
      }
    });
  }, []);

  // Sync search input when URL changes (back nav)
  useEffect(() => {
    setSearchInput(currentQ);
  }, [currentQ]);

  // Banner hide on scroll
  useEffect(() => {
    function onScroll() {
      setBannerVisible(window.scrollY < 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll restore on back-nav
  useEffect(() => {
    const saved = sessionStorage.getItem("homeScroll");
    if (!saved) return;
    const t = setTimeout(() => {
      window.scrollTo({ top: Number(saved), behavior: "instant" });
      sessionStorage.removeItem("homeScroll");
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // ── Autocomplete ───────────────────────────────────────────────────────────
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setSuggestions([...new Set(data.map((d: any) => d.name as string))]);
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
    suggestTimer.current = setTimeout(() => fetchSuggestions(value), 350);
  }

  // ── URL helpers ────────────────────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    const current: Record<string, string> = {
      q: currentQ,
      page: currentPage > 1 ? String(currentPage) : "",
      category: currentCategory !== "all" ? currentCategory : "",
      campus: currentCampus !== "all" ? currentCampus : "",
    };
    const merged = { ...current, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const str = params.toString();
    return str ? `/?${str}` : "/";
  }

  function commitSearch(value: string) {
    setShowSuggestions(false);
    setSuggestions([]);
    router.push(buildUrl({ q: value.trim() || null, page: null }), {
      scroll: false,
    });
  }

  function pushParam(key: string, value: string) {
    router.push(
      buildUrl({ [key]: value === "all" ? null : value, page: null }),
      { scroll: false },
    );
  }

  function pushPage(newPage: number) {
    router.push(buildUrl({ page: newPage > 1 ? String(newPage) : null }), {
      scroll: false,
    });
  }

  function handleClear() {
    setSearchInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    router.push("/", { scroll: false });
  }

  function goToItem(itemId: string) {
    sessionStorage.setItem("homeScroll", String(window.scrollY));
    const params = new URLSearchParams();
    if (currentQ) params.set("q", currentQ);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (currentCategory !== "all") params.set("category", currentCategory);
    if (currentCampus !== "all") params.set("campus", currentCampus);
    const str = params.toString();
    router.push(`/item/${itemId}${str ? `?${str}` : ""}`);
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
        commitSearch(searchInput);
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
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
      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: bannerVisible ? 200 : 0,
          opacity: bannerVisible ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.3s ease",
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

      {/* ── STICKY FILTER BAR ───────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 64,
          zIndex: 50,
          background: "var(--filter-bar-bg)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          paddingTop: 16,
          paddingBottom: 12,
          borderBottom: "1px solid var(--ink-100)",
          marginBottom: 20,
        }}
      >
        {/* Search bar */}
        <div ref={searchRef} style={{ position: "relative", marginBottom: 12 }}>
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
            <span
              style={{
                paddingLeft: 14,
                fontSize: 16,
                color: "var(--ink-300)",
                flexShrink: 0,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
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
            <button
              onClick={() => {
                commitSearch(searchInput);
                inputRef.current?.blur();
              }}
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

          {/* Suggestions dropdown */}
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
                    setSearchInput(name);
                    commitSearch(name);
                  }}
                  onMouseEnter={() => setActiveSuggestion(i)}
                  onMouseLeave={() => setActiveSuggestion(-1)}
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

        {/* Campus + controls */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={currentCampus}
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
          <button onClick={handleClear} className="btn-secondary">
            Clear
          </button>
        </div>
      </div>

      {/* Categories */}
      <div
        style={{ display: !showFilters ? "none" : "block", marginBottom: 4 }}
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
              aria-pressed={currentCategory === "all"}
              className={`category-btn ${currentCategory === "all" ? "active" : ""}`}
              onClick={() => pushParam("category", "all")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                aria-pressed={currentCategory === cat.id}
                className={`category-btn ${currentCategory === cat.id ? "active" : ""}`}
                onClick={() => pushParam("category", cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p
        style={{
          marginBottom: 20,
          fontSize: 13,
          color: "var(--ink-500)",
          fontFamily: "var(--font-body)",
        }}
      >
        <strong
          style={{
            color: "var(--ink-900)",
            fontFamily: "var(--font-display)",
          }}
        >
          {totalCount}
        </strong>{" "}
        {totalCount === 1 ? "item" : "items"} available
        {currentCampus !== "all" && " on this campus"}
        {currentQ && (
          <span style={{ color: "var(--green-700)", fontWeight: 600 }}>
            {" "}
            for &ldquo;{currentQ}&rdquo;
          </span>
        )}
      </p>

      {/* Empty state */}
      {initialItems.length === 0 && (
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

      {/* Item grid */}
      <ItemGrid
        items={initialItems}
        userId={userId}
        myRequestedItemIds={myRequestedItemIds}
        onGoToItem={goToItem}
        currentSearchParams={`${currentQ ? `q=${currentQ}&` : ""}${currentPage > 1 ? `page=${currentPage}&` : ""}${currentCategory !== "all" ? `category=${currentCategory}&` : ""}${currentCampus !== "all" ? `campus=${currentCampus}` : ""}`}
      />

      {/* Pagination */}
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
            disabled={currentPage === 1}
            onClick={() => pushPage(currentPage - 1)}
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
            Page{" "}
            <strong style={{ color: "var(--ink-900)" }}>{currentPage}</strong>{" "}
            of <strong style={{ color: "var(--ink-900)" }}>{totalPages}</strong>
          </span>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => pushPage(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}

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
