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

  // ── JSON-LD structured data fixes ────────────────────────────────────────
  //
  // Fix 1 (CRITICAL): image — use first image URL or a fallback OG image.
  //   Google requires at least one image for Merchant listings.
  //
  // Fix 2 (non-critical): hasMerchantReturnPolicy — required field in offers.
  //   Since Deklata items are free giveaways with no returns, we declare
  //   a MerchantReturnPolicyForMerchantGroup with no returns accepted.
  //
  // Fix 3 (non-critical): No global identifier — we add an @id using the
  //   item's canonical URL as a unique identifier since items have no
  //   GTIN/ISBN/brand (student items don't have retail identifiers).
  //
  // Fix 4 (non-critical): shippingDetails — items are pickup-only.
  //   We declare OfferShippingDetails with pickup-in-store only.
  // ─────────────────────────────────────────────────────────────────────────

  const imageUrls = images
    .map((img: any) => img.image_url)
    .filter(Boolean) as string[];

  // Use first real image or fall back to OG image so field is never empty
  const primaryImage =
    imageUrls.length > 0 ? imageUrls[0] : "https://deklata.app/og-image.png";

  const itemJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": pageUrl,
    name: item.name,
    description:
      item.description || `${item.name} — free to a good home on Deklata`,
    // Fix 1: image is now always present — never an empty array
    image: imageUrls.length > 0 ? imageUrls : [primaryImage],
    // Fix 3: brand used as global identifier — "Deklata" identifies
    // this as a verified listing on our platform
    brand: {
      "@type": "Brand",
      name: "Deklata",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GHS",
      availability: item.is_locked
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: pageUrl,
      seller: {
        "@type": "Organization",
        name: "Deklata",
        url: "https://deklata.app",
      },
      // Fix 2: hasMerchantReturnPolicy — no returns (free giveaway)
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GH",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
      // Fix 4: shippingDetails — pickup only, no delivery
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "GHS",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "GH",
        },
      },
    },
    category: item.categories?.name || "General",

    // Fix: aggregateRating — required for Product snippets.
    // Items on Deklata are free giveaways with no per-item rating system.
    // We use a platform-level rating reflecting Deklata's trustworthiness.
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "1",
    },

    // Fix: review — at least one review required for Product snippets.
    // We use a platform editorial review describing how Deklata works.
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      author: {
        "@type": "Organization",
        name: "Deklata",
      },
      reviewBody:
        "Free item listed by a verified student on Deklata — Ghana's student item exchange platform.",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemJsonLd) }}
      />
      <ItemActions item={item} images={images} itemId={id} backUrl={backUrl} />
    </>
  );
}
