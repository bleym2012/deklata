"use client";

import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      {/* HEADER */}
      <header style={{ marginBottom: 40 }}>
        <Link
          href="/"
          style={{
            color: "#2563eb",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Back to Home
        </Link>

        <h1
          style={{
            marginTop: 12,
            fontSize: 32,
            fontWeight: 800,
          }}
        >
          Community Guidelines & Safety
        </h1>

        <p style={{ color: "#555", maxWidth: 700, marginTop: 8 }}>
          Deklata is built on trust. These guidelines help keep the community
          safe, respectful, and useful for everyone.
        </p>
      </header>

      <Card>
        <p>
          Following these guidelines ensures a positive experience for all
          students using Deklata.
        </p>
      </Card>

      <Card title="1. Respect Each Other">
        <ul>
          <li>Be polite and respectful in communication.</li>
          <li>No harassment, threats, or discrimination.</li>
        </ul>
      </Card>

      <Card title="2. Safe Item Exchanges">
        <ul>
          <li>Meet in public or well-known campus locations.</li>
          <li>Bring a friend if needed.</li>
          <li>Inspect items before accepting them.</li>
        </ul>
      </Card>

      <Card title="3. Honest Listings">
        <ul>
          <li>Post only items you own.</li>
          <li>Describe items truthfully.</li>
          <li>Remove items once collected.</li>
        </ul>
      </Card>

      <Card title="4. Reporting Issues">
        <p>
          If you encounter suspicious behavior or unsafe situations, disengage
          immediately and report the issue.
        </p>
      </Card>

      <footer
        style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: "1px solid #e5e7eb",
          fontSize: 14,
          color: "#777",
        }}
      >
        Following these guidelines helps keep Deklata safe for everyone.
      </footer>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 22,
        marginBottom: 18,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        fontSize: 15,
        lineHeight: 1.7,
        color: "#444",
      }}
    >
      {title && (
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
