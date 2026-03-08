"use client";
// app/components/ItemGrid.tsx
//
// Pure display component — receives items as props, renders them.
// No Supabase calls, no useEffect, no loading state.
// This is what makes the grid paint instantly on server render.

import Image from "next/image";
import Link from "next/link";

interface Props {
  items: any[];
  userId: string | null;
  myRequestedItemIds: Set<string>;
  onGoToItem: (id: string) => void;
  currentSearchParams: string;
}

export default function ItemGrid({
  items,
  userId,
  myRequestedItemIds,
  onGoToItem,
  currentSearchParams,
}: Props) {
  if (items.length === 0) return null;

  return (
    <div className="item-grid">
      {items.map((item, index) => {
        const isOwner = userId === item.owner_id;
        const isRequested =
          !!userId && !isOwner && myRequestedItemIds.has(item.id);
        const hasImage = item.item_images?.length > 0;
        const imageUrl = hasImage ? item.item_images[0].image_url : null;

        return (
          <div
            key={item.id}
            className="item-card"
            onClick={() => onGoToItem(item.id)}
            style={{
              opacity: !isOwner && isRequested ? 0.5 : 1,
              pointerEvents: !isOwner && isRequested ? "none" : "auto",
              position: "relative",
            }}
          >
            {/* Image area — explicit height prevents CLS */}
            <div
              style={{
                height: 160,
                background: "var(--green-50)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  // priority on first 4 items (above fold on mobile) — fixes LCP
                  priority={index < 4}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
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
              href={`/item/${item.id}${currentSearchParams ? `?${currentSearchParams}` : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onGoToItem(item.id);
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
  );
}
