"use client";

import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      {/* 🔙 BACK */}
      <Link
        href="/"
        style={{
          fontSize: 14,
          color: "#2563eb",
          textDecoration: "none",
        }}
      >
        ← Back to Home
      </Link>

      {/* HERO */}
      <section style={{ marginTop: 20, marginBottom: 50 }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 12,
            letterSpacing: "-0.5px",
          }}
        >
          How Deklata Works
        </h1>
        <p style={{ fontSize: 17, color: "#555", maxWidth: 760 }}>
          Deklata helps students give out items they no longer need to other
          students — <strong>safely</strong>, <strong>fairly</strong>, and{" "}
          <strong>transparently</strong>.
        </p>
      </section>

      {/* BEFORE YOU START */}
      <InfoCard title="Before You Start">
        <ul>
          <li>
            You can <strong>freely browse all items</strong> on Deklata without
            creating an account.
          </li>
          <li>
            To <strong>post an item</strong> or <strong>request an item</strong>,
            you must <strong>create an account or log in</strong>.
          </li>
        </ul>
      </InfoCard>

      {/* STEP 1 */}
      <InfoCard title="1. Listing an Item (Owners)">
        <ul>
          <li>
            <strong>Create an account or log in</strong> to post an item you no
            longer need.
          </li>
          <li>Add clear photos and a simple, honest description.</li>
          <li>Select the correct category and pickup location.</li>
          <li>
            Once posted, your item becomes visible to other students on the
            homepage.
          </li>
        </ul>
      </InfoCard>

      {/* STEP 2 */}
      <InfoCard title="2. Requesting an Item (Requesters)">
        <ul>
          <li>Browse available items on the homepage.</li>
          <li>Click on an item to view full details and images.</li>
          <li>You must be <strong>logged in</strong> to request an item.</li>
          <li>
            Click <strong>Request Item</strong> if the item is available.
          </li>
          <li>
            Once requested, the item is marked{" "}
            <strong>“Item already requested”</strong> and cannot be requested
            again.
          </li>
        </ul>
      </InfoCard>

      {/* STEP 3 */}
      <InfoCard title="3. Approval & Contact Sharing">
        <ul>
          <li>The item owner reviews incoming requests.</li>
          <li>The owner can approve or reject a request.</li>
          <li>
            <strong>After approval:</strong>
            <ul style={{ marginTop: 8 }}>
              <li>
                The <strong>owner’s contact</strong> becomes visible to the
                requester on the <strong>My Requests</strong> page.
              </li>
              <li>
                The <strong>requester’s contact</strong> becomes visible to the
                owner on the <strong>Owner Dashboard</strong>.
              </li>
              <li>The item is removed from the public homepage.</li>
            </ul>
          </li>
          <li>
            This allows both students to communicate directly and arrange pickup.
          </li>
        </ul>
      </InfoCard>

      {/* STEP 4 */}
      <InfoCard title="4. Pickup & Exchange">
        <ul>
          <li>
            The requester contacts the owner via details shown on{" "}
            <strong>My Requests</strong>.
          </li>
          <li>
            The owner contacts the requester via the{" "}
            <strong>Owner Dashboard</strong>.
          </li>
          <li>Agree on a convenient pickup time and location.</li>
          <li>The exchange happens offline between students.</li>
        </ul>
      </InfoCard>

      {/* SAFETY */}
      <section
        style={{
          marginTop: 40,
          padding: 24,
          borderRadius: 18,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ⚠️ Safety & Contact Tips
        </h2>

        <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
          <li>
            Always add a <strong>valid and reachable phone number</strong> when
            creating your account.
          </li>
          <li>
            Your contact is only shared <strong>after approval</strong> and only
            with the other party involved.
          </li>
          <li>Meet in public places on campus whenever possible.</li>
          <li>Do not share sensitive personal information.</li>
          <li>Inspect items before accepting them.</li>
          <li>
            If communication feels unclear or unsafe, you are free to walk away.
          </li>
        </ul>
      </section>

      {/* DISCLAIMER */}
      <p
        style={{
          marginTop: 40,
          fontSize: 14,
          color: "#666",
        }}
      >
        Deklata does not handle payments or deliveries. All exchanges happen
        directly between students.
      </p>
    </main>
  );
}

/* ---------- REUSABLE CARD ---------- */

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginBottom: 28,
        padding: 24,
        borderRadius: 18,
        background: "#fff",
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        {title}
      </h2>
      <div style={{ lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}
