"use client";

import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "48px 20px 100px",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* HERO */}
      <div style={{ marginBottom: 56, maxWidth: 640 }}>
        <span
          style={{
            display: "inline-block",
            background: "var(--green-100)",
            color: "var(--green-800)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.8px",
            padding: "5px 14px",
            borderRadius: 999,
            marginBottom: 16,
            fontFamily: "var(--font-display)",
          }}
        >
          FREE · SAFE · STUDENT-ONLY
        </span>
        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 42px)",
            fontWeight: 800,
            marginBottom: 16,
            lineHeight: 1.1,
            fontFamily: "var(--font-display)",
          }}
        >
          How Deklata Works
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "var(--ink-500)",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Deklata connects tertiary students across Tamale campuses to give and
          receive items they no longer need — completely free, no payments, no
          middlemen.
        </p>
      </div>

      {/* QUICK SUMMARY CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 64,
        }}
      >
        {[
          {
            icon: "📦",
            title: "Give",
            desc: "Post items you no longer need so another student can use them.",
          },
          {
            icon: "🙋",
            title: "Request",
            desc: "Find something you need and request it from the owner.",
          },
          {
            icon: "🤝",
            title: "Exchange",
            desc: "Meet on campus, hand it over, confirm — done.",
          },
          {
            icon: "⭐",
            title: "Earn Points",
            desc: "Givers earn Deklata Points redeemable for future rewards.",
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: "var(--white)",
              border: "1px solid var(--ink-100)",
              borderRadius: 16,
              padding: "24px 20px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
            <p
              style={{
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                fontSize: 16,
                color: "var(--ink-900)",
                marginBottom: 6,
              }}
            >
              {card.title}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--ink-500)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* SECTION LABEL */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "1px",
          color: "var(--ink-300)",
          fontFamily: "var(--font-display)",
          marginBottom: 28,
        }}
      >
        STEP BY STEP
      </p>

      {/* STEPS */}
      <div style={{ marginBottom: 64 }}>
        <Step
          number="0"
          color="var(--ink-200, #e5e7eb)"
          textColor="var(--ink-600, #4b5563)"
          title="Getting Started"
          icon="🎓"
        >
          <Row>
            Anyone can <strong>browse all items</strong> without an account — no
            signup needed to look around.
          </Row>
          <Row>
            To <strong>post an item</strong> or <strong>request one</strong>,
            create a free account or sign in with Google.
          </Row>
          <Row>
            During signup you set your <strong>campus</strong> and{" "}
            <strong>phone number</strong>. Your phone is never shown publicly —
            only shared with the other student after an exchange is approved.
          </Row>
        </Step>

        <Step
          number="1"
          color="var(--green-800)"
          textColor="#fff"
          title="Giving an Item"
          icon="📦"
        >
          <Row>
            Click <strong>+ Add Item</strong> in the top menu.
          </Row>
          <Row>
            Fill in the item name, description, <strong>condition</strong>,
            category and pickup location.
          </Row>
          <Row>
            Upload up to <strong>3 photos</strong> — items with photos get far
            more requests.
          </Row>
          <Row>
            Click <strong>Post item for free</strong>. Your listing goes live
            instantly on the homepage.
          </Row>
          <Row>
            Manage or delete your listings anytime from{" "}
            <strong>Dashboard → My Items</strong>.
          </Row>
        </Step>

        <Step
          number="2"
          color="var(--gold)"
          textColor="#fff"
          title="Requesting an Item"
          icon="🙋"
        >
          <Row>
            Browse the homepage — filter by campus, category or search by name.
          </Row>
          <Row>
            Click any item to see its full details, photos and condition.
          </Row>
          <Row>
            Click <strong>Request this item</strong>. The owner is notified by
            email instantly.
          </Row>
          <Row>
            Your request appears in <strong>My Requests</strong> with a{" "}
            <em>Pending</em> status while you wait.
          </Row>
          <Row>
            Changed your mind? <strong>Cancel anytime</strong> from My Requests
            before the owner approves.
          </Row>
        </Step>

        <Step
          number="3"
          color="var(--green-700)"
          textColor="#fff"
          title="Owner Reviews & Approves"
          icon="✅"
        >
          <Row>
            The owner sees all incoming requests in their{" "}
            <strong>Dashboard</strong>.
          </Row>
          <Row>
            They can <strong>Approve</strong> or <strong>Decline</strong> each
            request.
          </Row>
          <Row>
            Only <strong>one request can be approved</strong> per item — the
            item is then locked and removed from public listings.
          </Row>
          <Highlight>
            When approved,{" "}
            <strong>
              both students see each other's name and phone number
            </strong>{" "}
            — the owner in their Dashboard, the requester in My Requests.
            Contact details are protected until this moment.
          </Highlight>
        </Step>

        <Step
          number="4"
          color="var(--green-600)"
          textColor="#fff"
          title="Arrange Pickup & Exchange"
          icon="🤝"
        >
          <Row>
            The requester sees a <strong>WhatsApp button</strong> in My Requests
            to message the owner directly.
          </Row>
          <Row>
            Agree on a time and location — preferably a{" "}
            <strong>public spot on campus</strong>.
          </Row>
          <Row>Meet, inspect the item carefully and complete the handover.</Row>
        </Step>

        <Step
          number="5"
          color="var(--green-900)"
          textColor="#fff"
          title="Confirm the Exchange"
          icon="🎉"
        >
          <Row>
            After the handover, <strong>both students confirm</strong>:
          </Row>
          <Row>
            → <strong>Owner</strong> clicks <em>"Mark item as given"</em> in
            their Dashboard.
          </Row>
          <Row>
            → <strong>Requester</strong> clicks <em>"I received this item"</em>{" "}
            in My Requests.
          </Row>
          <Highlight>
            Once both confirm, the exchange is complete and the{" "}
            <strong>owner earns Deklata Points</strong> — visible on their
            profile with a tier badge.
          </Highlight>
        </Step>
      </div>

      {/* POINTS SYSTEM */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--ink-100)",
          borderRadius: 20,
          padding: "32px",
          marginBottom: 32,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1px",
            color: "var(--ink-300)",
            fontFamily: "var(--font-display)",
            marginBottom: 16,
          }}
        >
          POINTS & TIERS
        </p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            marginBottom: 8,
          }}
        >
          ⭐ Deklata Points
        </h2>
        <p
          style={{
            color: "var(--ink-500)",
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          Every completed exchange earns the giver points. The more you give,
          the higher your tier.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {[
            {
              tier: "New Giver 🌱",
              range: "0 – 49 pts",
              bg: "#f0fdf4",
              color: "#166534",
            },
            {
              tier: "Bronze Giver 🥉",
              range: "50 – 249 pts",
              bg: "#fff7ed",
              color: "#92400e",
            },
            {
              tier: "Silver Giver 🥈",
              range: "250 – 499 pts",
              bg: "#f8fafc",
              color: "#334155",
            },
            {
              tier: "Gold Giver 🥇",
              range: "500+ pts",
              bg: "#fefce8",
              color: "#854d0e",
            },
          ].map((t) => (
            <div
              key={t.tier}
              style={{
                background: t.bg,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: t.color,
                  fontFamily: "var(--font-display)",
                  marginBottom: 4,
                }}
              >
                {t.tier}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: t.color,
                  opacity: 0.8,
                  margin: 0,
                }}
              >
                {t.range}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--ink-400)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          In the future, Deklata Points may be redeemed for gift vouchers,
          campus prizes, special giveaways and recognition for top givers. 🎁
        </p>
      </div>

      {/* SAFETY */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--green-50), var(--gold-light))",
          border: "1px solid var(--green-100)",
          borderRadius: 20,
          padding: "32px",
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            marginBottom: 20,
            color: "var(--ink-900)",
          }}
        >
          🛡️ Safety Tips
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            "Always meet in a public place on campus — not private rooms or off-campus locations.",
            "Inspect the item carefully before accepting. You are under no obligation to take it.",
            "Your phone number is only shared after a request is approved — never publicly visible.",
            "If anything feels off, decline and use the Report link on the listing to flag it.",
            "Deklata does not handle payments or deliveries. All exchanges happen directly between students.",
          ].map((tip, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
            >
              <span
                style={{
                  color: "var(--green-700)",
                  fontWeight: 800,
                  marginTop: 2,
                  flexShrink: 0,
                }}
              >
                →
              </span>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--ink-700)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 56 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1px",
            color: "var(--ink-300)",
            fontFamily: "var(--font-display)",
            marginBottom: 24,
          }}
        >
          COMMON QUESTIONS
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            {
              q: "Is Deklata really free?",
              a: "Yes. 100% free. No fees, no payments, no hidden charges. Items are given away, not sold.",
            },
            {
              q: "What happens if an owner never responds?",
              a: "You can cancel your pending request anytime from My Requests and request a different item.",
            },
            {
              q: "Can I give and receive at the same time?",
              a: "Absolutely. You can post items to give away while also requesting items from others.",
            },
            {
              q: "What if the item is not as described?",
              a: "Inspect it before accepting. If it is misrepresented, decline the exchange and report the listing.",
            },
            {
              q: "Who can use Deklata?",
              a: "Students from UDS – Tamale, UDS – Nyankpala and Tamale Technical University.",
            },
            {
              q: "What if I change my mind after requesting?",
              a: "Cancel from My Requests before the owner approves. Once approved, message the owner directly to let them know.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                background: "var(--white)",
                border: "1px solid var(--ink-100)",
                borderRadius: 14,
                padding: "20px 22px",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  color: "var(--ink-900)",
                  marginBottom: 6,
                }}
              >
                {faq.q}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--ink-500)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          background: "var(--green-800)",
          borderRadius: 20,
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          Ready to get started?
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 15,
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          Browse free items from students on your campus or give something away
          today.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              background: "var(--gold)",
              color: "#fff",
              padding: "13px 28px",
              borderRadius: 999,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Browse items
          </Link>
          <Link
            href="/add-item"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              padding: "13px 28px",
              borderRadius: 999,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              border: "1.5px solid rgba(255,255,255,0.3)",
            }}
          >
            Give an item
          </Link>
        </div>
      </div>
    </main>
  );
}

function Step({
  number,
  color,
  textColor,
  title,
  icon,
  children,
}: {
  number: string;
  color: string;
  textColor: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "52px 1fr",
        gap: 0,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: color,
            color: textColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {number}
        </div>
        <div
          style={{
            width: 2,
            flex: 1,
            background: "var(--ink-100)",
            minHeight: 20,
            marginTop: 4,
          }}
        />
      </div>
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--ink-100)",
          borderRadius: 16,
          padding: "20px 22px",
          marginBottom: 8,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 20 }}>{icon}</span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 17,
              color: "var(--ink-900)",
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
        <div style={{ display: "grid", gap: 8 }}>{children}</div>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span
        style={{
          color: "var(--green-600)",
          fontWeight: 700,
          marginTop: 2,
          flexShrink: 0,
          fontSize: 13,
        }}
      >
        ✓
      </span>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-700)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--green-50)",
        border: "1px solid var(--green-100)",
        borderRadius: 10,
        padding: "12px 14px",
        marginTop: 4,
      }}
    >
      <p
        style={{
          fontSize: 13,
          color: "var(--green-800)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}
