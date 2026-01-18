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
          <strong>transparently</strong>, while rewarding generosity.
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
          <li>
            A valid phone number is required to enable safe coordination between
            students.
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
          <li>Add clear photos and an honest description.</li>
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
          <li>Click an item to view full details.</li>
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
          <li>The owner may approve or reject a request.</li>
          <li>
            <strong>After approval:</strong>
            <ul style={{ marginTop: 8 }}>
              <li>
                The <strong>owner’s name and contact</strong> becomes visible to the
                requester on <strong>My Requests</strong>.
              </li>
              <li>
                The <strong>requester’s name and contact</strong> becomes visible to the
                owner on the <strong>Owner Dashboard</strong>.
              </li>
              <li>The item is removed from the public homepage.</li>
            </ul>
          </li>
        </ul>
      </InfoCard>

      {/* STEP 4 */}
      <InfoCard title="4. Pickup, Confirmation & Fair Exchange">
        <ul>
          <li>
            Both students communicate directly and agree on a pickup time and
            location.
          </li>
          <li>The exchange happens offline between students.</li>
          <li>
            <strong>After the exchange:</strong>
            <ul style={{ marginTop: 8 }}>
              <li>
                The <strong>owner</strong> confirms the item was given.
              </li>
              <li>
                The <strong>requester</strong> confirms the item was received.
              </li>
            </ul>
          </li>
          <li>
            <strong>Both confirmations are required</strong> before the exchange
            is marked as complete.
          </li>
        </ul>
      </InfoCard>

      {/* STEP 5 */}
      <InfoCard title="5. Points, Rewards & Giving Back">
        <ul>
          <li>
            Once <strong>both parties confirm</strong>, the item is marked as
            completed.
          </li>
          <li>
            The <strong>giver (item owner)</strong> is automatically rewarded
            with <strong>Deklata Points</strong> which can be seen on their profile.
          </li>
          <li>
            Points are earned only for <strong>successful, confirmed exchanges</strong>.
          </li>
      
          <li>
            <strong>In the future, Deklata Points can be redeemed for:</strong>
            <ul style={{ marginTop: 8 }}>
              <li>🎁 Gift vouchers</li>
              <li>🏆 Campus rewards & prizes</li>
              <li>🎉 Special giveaways and partner offers</li>
              <li>⭐ Recognition for top givers</li>
            </ul>
          </li>
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
            Always provide a <strong>valid and reachable phone number</strong>.
          </li>
          <li>
            Contact details are shared <strong>only after approval</strong>.
          </li>
          <li>Meet in public places on campus where possible.</li>
          <li>Inspect items before accepting them.</li>
          <li>
            If anything feels unsafe or unclear, you are free to walk away.
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
