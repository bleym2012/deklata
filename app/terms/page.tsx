"use client";

import Link from "next/link";

export default function TermsPage() {
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
          Terms of Use
        </h1>

        <p style={{ color: "#555", maxWidth: 700, marginTop: 8 }}>
          Please read these terms carefully before using Deklata.
        </p>
      </header>

      <Card>
        <p>
          Deklata is a student-to-student platform that allows users to post and
          request items they no longer need. By using Deklata, you agree to the
          following terms.
        </p>
      </Card>

      <Card title="1. Eligibility">
        <p>
          Deklata is intended for students. You are responsible for ensuring the
          information you provide is accurate and truthful.
        </p>
      </Card>

      <Card title="2. Platform Role">
        <p>
          Deklata does not own, inspect, deliver, or verify items posted on the
          platform. All exchanges happen directly between users.
        </p>
      </Card>

      <Card title="3. User Responsibility">
        <ul>
          <li>Provide accurate item descriptions.</li>
          <li>Use valid contact information.</li>
          <li>Communicate respectfully.</li>
          <li>Meet in safe, public locations.</li>
        </ul>
      </Card>

      <Card title="4. Prohibited Use">
        <ul>
          <li>Posting illegal or dangerous items.</li>
          <li>Harassment or abuse.</li>
          <li>Misrepresentation of items.</li>
          <li>Using the platform for commercial resale.</li>
        </ul>
      </Card>

      <Card title="5. Limitation of Liability">
        <p>
          Deklata is not responsible for disputes, losses, or damages arising
          from item exchanges between users.
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
        Continued use of Deklata means you accept these terms.
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
