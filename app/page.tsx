// ─────────────────────────────────────────────────────────────────────────────
// app/page.tsx  —  SERVER COMPONENT
//
// WHAT CHANGED & WHY:
//   BEFORE: "use client" + useEffect → page was blank until JS downloaded,
//           parsed, hydrated, then fired 2 Supabase queries. LCP was 5.9s.
//   AFTER:  Server fetches items at request time, streams HTML to the browser.
//           Items are visible before any JS runs. LCP target: <2s.
//
//   The interactive bits (search bar, filters, suggestions) are split into
//   <HomeFilters> and <HomeClient> — small client components that hydrate
//   quickly without blocking the item grid from rendering.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import { createServerSupabaseClient } from "./lib/supabaseServer";
import HomeClient from "./components/HomeClient";
import ItemGrid from "./components/ItemGrid";
import ItemGridSkeleton from "./components/ItemGridSkeleton";

// Tell Next.js: re-render this page at most once every 60 seconds (ISR).
// This means the first visitor gets fresh data; everyone else gets the cached
// HTML instantly from Vercel's edge — no Supabase round-trip at all.
// Ghana users will feel the difference immediately.
export const revalidate = 60;

const PAGE_SIZE = 20;

interface SearchParams {
  page?: string;
  category?: string;
  campus?: string;
  q?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category || "all";
  const selectedCampus = params.campus || "all";
  const q = params.q || "";

  const supabase = createServerSupabaseClient();

  // ── Fetch categories (cheap, cached by ISR) ────────────────────────────────
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  // ── Fetch items on the server ──────────────────────────────────────────────
  let query = supabase
    .from("items")
    .select(
      `id, name, description, pickup_location, owner_id, campus, is_locked,
       category_id, created_at, categories ( id, name )`,
      { count: "exact" },
    )
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q.trim()) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "english",
    });
  }
  if (category !== "all") query = query.eq("category_id", category);
  if (selectedCampus !== "all") {
    const withSpaces = selectedCampus.replace(/-/g, " ");
    query = query.or(
      `campus.ilike.%${withSpaces}%,campus.ilike.%${selectedCampus}%`,
    );
  }

  const { data: itemData, count } = await query;
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Fetch images for this page of items in ONE query ─────────────────────
  const ids = (itemData || []).map((i: any) => i.id);
  const { data: images } = ids.length
    ? await supabase
        .from("item_images")
        .select("item_id, image_url")
        .in("item_id", ids)
    : { data: [] };

  const items = (itemData || []).map((item: any) => ({
    ...item,
    item_images: (images ?? []).filter((img: any) => img.item_id === item.id),
  }));

  return (
    // HomeClient owns the hero banner, search bar, filters, and pagination.
    // It receives pre-fetched items + categories as props so it can render
    // immediately — no loading spinner on first paint.
    <HomeClient
      initialItems={items}
      totalCount={totalCount}
      totalPages={totalPages}
      categories={categories || []}
      currentPage={page}
      currentCategory={category}
      currentCampus={selectedCampus}
      currentQ={q}
    />
  );
}
