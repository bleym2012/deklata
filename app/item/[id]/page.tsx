// app/item/[id]/page.tsx
//
// SERVER COMPONENT — no "use client", no JS shipped for this file.
// Fetches item + images on the server at Vercel edge (close to user).
// Full HTML is sent to browser on first byte — LCP image starts loading
// before any JS is downloaded. Previously the page was blank until
// the entire JS bundle parsed and 3 Supabase queries completed.
//
// Only the interactive parts (carousel, request button, delete, auth)
// are in ItemActions.tsx — a small focused client component.

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabaseServer";
import ItemActions from "./ItemActions";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata server-side — title/description in <head> before JS loads
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data: item } = await supabase
    .from("items")
    .select("name, description, pickup_location")
    .eq("id", id)
    .single();

  if (!item) return { title: "Item not found | Deklata" };

  return {
    title: `${item.name} – Free on Deklata`,
    description: `${item.name} available for free pickup${
      item.pickup_location ? ` at ${item.pickup_location}` : ""
    }. ${item.description?.slice(0, 120) || ""}`,
  };
}

export default async function ItemDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  // Build backUrl on the server — no useSearchParams needed in client
  const paramEntries = Object.entries(resolvedSearchParams)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`);
  const backUrl = paramEntries.length > 0 ? `/?${paramEntries.join("&")}` : "/";

  // Fetch item + images in parallel on the server.
  // This runs at Vercel's edge — much closer to the user than the browser
  // calling Supabase directly from Ghana.
  const supabase = createServerSupabaseClient();
  const [{ data: item }, { data: imageData }] = await Promise.all([
    supabase
      .from("items")
      .select(`*, categories ( id, name )`)
      .eq("id", id)
      .single(),
    supabase.from("item_images").select("*").eq("item_id", id),
  ]);

  // Item not found — show Next.js 404 page
  if (!item) notFound();

  const images = imageData || [];
  const pageUrl = `https://deklata.app/item/${id}`;

  // JSON-LD structured data — in <head> on first byte, helps SEO
  const itemJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.description,
    image: images.map((img: any) => img.image_url),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GHS",
      availability: item.is_locked
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: pageUrl,
      seller: { "@type": "Organization", name: "Deklata" },
    },
    category: item.categories?.name || "General",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemJsonLd) }}
      />

      {/*
        ItemActions is the ONLY client component on this page.
        It receives all data as props — no client-side Supabase fetches
        needed for the initial render. Auth + request status loads
        after the page is already visible.
      */}
      <ItemActions item={item} images={images} itemId={id} backUrl={backUrl} />
    </>
  );
}
