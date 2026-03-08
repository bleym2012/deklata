// app/components/ItemGridSkeleton.tsx
// Used as the Suspense fallback — matches the real grid's dimensions exactly.
// This prevents CLS (layout shift) when content loads.

export default function ItemGridSkeleton() {
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
