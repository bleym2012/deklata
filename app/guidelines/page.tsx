"use client";

import Link from "next/link";

const EFFECTIVE_DATE = "24 February 2026";

export default function GuidelinesPage() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px 100px", fontFamily: "var(--font-body)" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 48 }}>
        <Link href="/" style={{ fontSize: 14, color: "var(--green-700)", fontWeight: 600, textDecoration: "none" }}>
          ← Back to Home
        </Link>

        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <span style={{
            display: "inline-block", background: "var(--green-100)", color: "var(--green-800)",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", padding: "4px 12px",
            borderRadius: 999, marginBottom: 16, fontFamily: "var(--font-display)",
          }}>COMMUNITY STANDARDS</span>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, marginBottom: 8, fontFamily: "var(--font-display)", lineHeight: 1.1 }}>
            Community Guidelines
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-400)" }}>
            Effective Date: {EFFECTIVE_DATE}
          </p>
        </div>

        <p style={{ fontSize: 16, color: "var(--ink-600)", lineHeight: 1.75, maxWidth: 680, margin: 0 }}>
          Deklata is built on trust, generosity and mutual respect. These guidelines define
          the standards of conduct every member of our community is expected to uphold.
          They exist to protect you, protect other students, and keep Deklata a platform
          worth being part of.
        </p>
      </div>

      {/* COMMITMENT BANNER */}
      <div style={{
        background: "var(--green-800)", borderRadius: 16,
        padding: "22px 28px", marginBottom: 40,
        display: "flex", gap: 16, alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>🤝</span>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
          By creating an account or using Deklata, you agree to uphold these Community
          Guidelines at all times. Violations may result in listing removal, account
          suspension or permanent termination — at Deklata's sole discretion.
        </p>
      </div>

      {/* QUICK PRINCIPLES */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12, marginBottom: 48,
      }}>
        {[
          { icon: "✊", label: "Be Honest" },
          { icon: "🛡️", label: "Be Safe" },
          { icon: "🤝", label: "Be Respectful" },
          { icon: "⚖️", label: "Be Responsible" },
          { icon: "🌱", label: "Give Generously" },
        ].map(p => (
          <div key={p.label} style={{
            background: "var(--white)", border: "1px solid var(--ink-100)",
            borderRadius: 12, padding: "16px 18px", textAlign: "center",
            boxShadow: "var(--shadow-card)",
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
            <p style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 14, color: "var(--ink-800)", margin: 0 }}>{p.label}</p>
          </div>
        ))}
      </div>

      {/* SECTION LABEL */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "var(--ink-300)", fontFamily: "var(--font-display)", marginBottom: 20 }}>
        THE GUIDELINES
      </p>

      {/* GUIDELINE 1 */}
      <Section number="1" icon="🤝" title="Respect & Dignity">
        <P>Every student on Deklata deserves to be treated with basic human dignity and respect. This is non-negotiable.</P>
        <BulletList items={[
          "Communicate politely, professionally and honestly with all users at all times.",
          "Never use language that is abusive, threatening, discriminatory, hateful, or sexually explicit in any communication on or through the platform.",
          "Respect cultural, religious, gender, ethnic and institutional differences. Deklata serves a diverse student community.",
          "Do not pressure, coerce, guilt-trip or manipulate another user into accepting or completing an exchange.",
          "Do not make unsolicited personal comments about another user's appearance, background or circumstances.",
          "If a user ends communication or declines an exchange, respect their decision without question.",
        ]} />
        <Callout type="zero-tolerance">
          Deklata operates a strict zero-tolerance policy for harassment, hate speech and abuse. Any verified report of such conduct will result in immediate and permanent account termination.
        </Callout>
      </Section>

      {/* GUIDELINE 2 */}
      <Section number="2" icon="📦" title="Honest & Accurate Listings">
        <P>The integrity of Deklata depends entirely on users being truthful about what they are offering. Every listing is a commitment to the community.</P>
        <BulletList items={[
          "Only list items you legally own or have the lawful right to give away.",
          "Describe every item accurately and completely, including its true condition, age, any defects, damage, missing parts or limitations.",
          "Upload genuine, recent photographs of the actual item being listed — not stock images or photos from the internet.",
          "Select the correct category and condition rating to help requesters find what they are looking for.",
          "Do not exaggerate the value, quality or condition of any item.",
          "If an item develops a fault or its condition changes after listing, update the listing immediately or remove it.",
          "Remove your listing as soon as the exchange is complete — do not leave completed or unavailable items active.",
          "Do not list the same item multiple times to artificially inflate visibility.",
        ]} />
        <Callout type="warning">
          Misleading, false or fraudulent listings are a violation of these Guidelines and Ghana's consumer protection laws. They will be removed and may result in account termination.
        </Callout>
      </Section>

      {/* GUIDELINE 3 */}
      <Section number="3" icon="🚫" title="Prohibited Items">
        <P>The following items must never be listed on Deklata under any circumstances. Listing any of the below is a serious violation and will result in immediate removal and account termination:</P>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, margin: "12px 0" }}>
          {[
            { icon: "🔫", label: "Firearms, weapons & ammunition" },
            { icon: "💊", label: "Drugs, narcotics & controlled substances" },
            { icon: "🍺", label: "Alcohol & regulated substances" },
            { icon: "🔪", label: "Dangerous or hazardous materials" },
            { icon: "📋", label: "Stolen or counterfeit goods" },
            { icon: "🔞", label: "Pornographic or obscene content" },
            { icon: "🐾", label: "Live animals or regulated animal products" },
            { icon: "📝", label: "Academic fraud services or materials" },
            { icon: "💳", label: "Financial instruments or documents" },
            { icon: "⚗️", label: "Chemicals, explosives or toxic materials" },
            { icon: "🏷️", label: "Counterfeit branded goods" },
            { icon: "🚷", label: "Human body parts or biological materials" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", gap: 10, alignItems: "center",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "#7f1d1d", fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>
        <P>If you are unsure whether an item is permitted, do not list it. Contact us through the Support page first.</P>
      </Section>

      {/* GUIDELINE 4 */}
      <Section number="4" icon="🛡️" title="Safe Exchanges & Physical Meetings">
        <P>Deklata does not supervise, attend or have any presence at physical exchanges between users. Your personal safety is your responsibility. Follow these practices for every exchange:</P>
        <BulletList items={[
          "Always meet in a public, well-lit, populated location on campus — such as a library entrance, student centre, lecture building foyer or busy walkway.",
          "Never meet in private rooms, hostels, off-campus locations or any secluded area, especially with someone you do not know.",
          "Inform a trusted friend, roommate or colleague of your meeting details — who you are meeting, where and when — before you go.",
          "Meet during daylight hours whenever possible.",
          "Inspect the item carefully and thoroughly before accepting it. Check that it matches the listing description, photos and stated condition.",
          "You have the absolute right to refuse any exchange at any time, even after a request is approved, if you feel unsafe or if the item does not match the listing. Walk away without explanation if necessary.",
          "Do not share unnecessary personal information — such as your home address, room number or financial details — with any user.",
          "If you are approached to conduct an exchange off-platform or in an unusual way, treat it as a red flag.",
          "For high-value items such as electronics, consider bringing a friend along.",
        ]} />
        <Callout type="info">
          Deklata provides a WhatsApp button in approved requests to make communication easy. Use official channels to communicate — avoid sharing alternative contacts until you are comfortable.
        </Callout>
      </Section>

      {/* GUIDELINE 5 */}
      <Section number="5" icon="⚡" title="Prohibited Conduct">
        <P>Beyond prohibited items, the following behaviours are strictly forbidden on Deklata:</P>
        <BulletList items={[
          "Impersonating any person, student, official, institution or organisation.",
          "Creating multiple accounts or fake accounts for any purpose.",
          "Using the platform for commercial resale, profit-making or business operations without written authorisation from Deklata.",
          "Soliciting money, donations, loans or financial contributions from any user.",
          "Spamming, bulk-messaging or sending unsolicited communications to other users.",
          "Attempting to circumvent the platform's approval and contact-sharing system by requesting contact details outside of it.",
          "Using contact details obtained through Deklata for any purpose other than completing the approved exchange.",
          "Posting false reviews, false reports or fake confirmations of exchanges that did not occur.",
          "Attempting to manipulate the points system through fraudulent confirmations.",
          "Photographing, recording or sharing another user's information or likeness without their consent.",
          "Any activity that disrupts, damages or interferes with the platform's operation.",
        ]} />
      </Section>

      {/* GUIDELINE 6 */}
      <Section number="6" icon="🔔" title="Reporting Concerns & Suspicious Behaviour">
        <P>You play an active role in keeping Deklata safe. If something does not feel right, act immediately:</P>
        <div style={{ display: "grid", gap: 10, margin: "12px 0" }}>
          {[
            { step: "1", text: "Stop all communication with the user immediately." },
            { step: "2", text: "Do not proceed with the exchange under any circumstances." },
            { step: "3", text: "Use the Report link on the item listing to flag it to Deklata." },
            { step: "4", text: "Submit a full report through the Contact & Support page." },
            { step: "5", text: "If you feel physically threatened or unsafe, contact campus security or Ghana Police Service (GPS) immediately — dial 191." },
          ].map(s => (
            <div key={s.step} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              background: "var(--white)", border: "1px solid var(--ink-100)",
              borderRadius: 12, padding: "14px 16px", boxShadow: "var(--shadow-card)",
            }}>
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: "50%",
                background: "var(--green-800)", color: "#fff",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, flexShrink: 0,
              }}>{s.step}</span>
              <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.65, margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>
        <P>All reports are treated with confidentiality and reviewed seriously. Deklata will take appropriate action, which may include account suspension, listing removal and, where warranted, referral to campus authorities or law enforcement.</P>
        <Callout type="emergency">
          In any emergency, call Ghana Police Service: <strong>191</strong> or your campus security. Do not wait for Deklata to respond.
        </Callout>
      </Section>

      {/* GUIDELINE 7 */}
      <Section number="7" icon="✅" title="Completing Exchanges Responsibly">
        <P>A completed exchange requires action from both parties on the platform. This is how Deklata maintains accurate records and awards points fairly.</P>
        <BulletList items={[
          "After handing over an item, the owner must click 'Mark item as given' in their Dashboard promptly.",
          "After receiving an item, the requester must click 'I received this item' in My Requests promptly.",
          "Both confirmations are required for the exchange to be marked complete and for points to be awarded.",
          "Do not confirm an exchange that did not take place. False confirmations are fraud and a violation of these Guidelines.",
          "If you confirmed an exchange in error, contact Deklata immediately through the Support page.",
          "Do not delay confirming a completed exchange — it unfairly delays the owner's points and keeps the listing active for others.",
        ]} />
      </Section>

      {/* GUIDELINE 8 */}
      <Section number="8" icon="🔒" title="Privacy & Data Responsibility">
        <P>Respect the privacy of every user you interact with on Deklata.</P>
        <BulletList items={[
          "Contact details — names and phone numbers — shared through the platform are for exchange coordination only. Using them for any other purpose is a violation of these Guidelines and Ghanaian data protection law.",
          "Do not share another user's personal information with any third party without their explicit consent.",
          "Do not screenshot, record or distribute private conversations with other users.",
          "Do not attempt to identify, track or locate another user beyond what is necessary to complete an approved exchange.",
          "Treat the personal information of other users with the same care and discretion you would expect them to apply to yours.",
        ]} />
      </Section>

      {/* GUIDELINE 9 */}
      <Section number="9" icon="⚖️" title="Enforcement & Consequences">
        <P>Deklata takes guideline violations seriously. Depending on the nature and severity of the violation, consequences may include:</P>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, margin: "12px 0 16px" }}>
          {[
            { icon: "🗑️", action: "Listing removal", desc: "Offending item removed without notice." },
            { icon: "⏸️", action: "Temporary suspension", desc: "Account access restricted for a set period." },
            { icon: "🚫", action: "Permanent termination", desc: "Account permanently closed with no reinstatement." },
            { icon: "📢", action: "Authority referral", desc: "Report to campus security or law enforcement." },
          ].map(c => (
            <div key={c.action} style={{
              background: "var(--white)", border: "1px solid var(--ink-100)",
              borderRadius: 12, padding: "16px 18px", boxShadow: "var(--shadow-card)",
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
              <p style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 14, color: "var(--ink-900)", marginBottom: 4 }}>{c.action}</p>
              <p style={{ fontSize: 12, color: "var(--ink-500)", margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <P>Enforcement decisions are made at Deklata's sole discretion. Deklata is not obligated to provide notice, warning or justification before taking enforcement action. Users who believe enforcement action was taken in error may submit an appeal through the Contact & Support page — appeals are reviewed but do not guarantee reinstatement.</P>
        <P>Repeated minor violations will be treated with the same seriousness as a single major violation.</P>
      </Section>

      {/* GUIDELINE 10 */}
      <Section number="10" icon="🌱" title="The Spirit of Deklata">
        <P>These guidelines exist not to restrict you but to protect the community you are part of. Deklata works because students choose to be generous, honest and considerate — not because rules force them to be.</P>
        <P>When you give an item to a fellow student, you are making a real difference in someone's campus experience. When you request something with genuine need and respect, you are honouring the spirit of what the person who gave it intended.</P>
        <P>We ask every member of our community to ask themselves one simple question before every action on the platform: <strong>Is this fair to the other person?</strong> If the answer is yes, you are doing it right.</P>
        <Callout type="positive">
          Deklata is powered by student generosity. Every item given is a contribution to a stronger, more connected campus community. Thank you for being part of it. 🎓
        </Callout>
      </Section>

      {/* FOOTER */}
      <div style={{
        marginTop: 48, padding: "20px 24px",
        background: "var(--ink-100)", borderRadius: 14, textAlign: "center",
      }}>
        <p style={{ fontSize: 13, color: "var(--ink-500)", lineHeight: 1.7, margin: 0 }}>
          These Community Guidelines were last updated on <strong>{EFFECTIVE_DATE}</strong>.
          They are incorporated by reference into Deklata's Terms of Use and are equally binding.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/terms" style={{ fontSize: 13, color: "var(--green-700)", fontWeight: 600, textDecoration: "none" }}>
            Terms of Use →
          </Link>
          <Link href="/how-it-works" style={{ fontSize: 13, color: "var(--green-700)", fontWeight: 600, textDecoration: "none" }}>
            How It Works →
          </Link>
          <Link href="/contact" style={{ fontSize: 13, color: "var(--green-700)", fontWeight: 600, textDecoration: "none" }}>
            Contact & Support →
          </Link>
        </div>
      </div>

    </main>
  );
}

/* ── SECTION ── */
function Section({ number, icon, title, children }: {
  number: string; icon: string; title: string; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 12 }}>
      <div style={{
        background: "var(--white)", border: "1px solid var(--ink-100)",
        borderRadius: 16, padding: "28px 32px", boxShadow: "var(--shadow-card)",
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
          <span style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, borderRadius: 12,
            background: "var(--green-50)", border: "1px solid var(--green-100)",
            fontSize: 20, flexShrink: 0,
          }}>{icon}</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-300)", fontFamily: "var(--font-display)", letterSpacing: "0.5px", margin: 0 }}>
              GUIDELINE {number}
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--ink-900)", margin: 0 }}>
              {title}
            </h2>
          </div>
        </div>
        <div style={{ paddingLeft: 54 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ── PARAGRAPH ── */
function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.8, margin: "0 0 12px" }}>
      {children}
    </p>
  );
}

/* ── BULLET LIST ── */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "8px 0 12px", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: "var(--green-600)", fontWeight: 700, flexShrink: 0, marginTop: 2, fontSize: 13 }}>→</span>
          <span style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.75 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── CALLOUT ── */
function Callout({ type, children }: { type: "zero-tolerance" | "warning" | "info" | "emergency" | "positive"; children: React.ReactNode }) {
  const styles = {
    "zero-tolerance": { bg: "#fef2f2", border: "#fecaca", color: "#7f1d1d", icon: "🚫" },
    "warning":        { bg: "#fef3c7", border: "#fde68a", color: "#78350f", icon: "⚠️" },
    "info":           { bg: "var(--green-50)", border: "var(--green-100)", color: "var(--green-800)", icon: "💡" },
    "emergency":      { bg: "#fff1f2", border: "#fecdd3", color: "#881337", icon: "🚨" },
    "positive":       { bg: "var(--green-50)", border: "var(--green-100)", color: "var(--green-800)", icon: "✅" },
  }[type];

  return (
    <div style={{
      background: styles.bg, border: `1px solid ${styles.border}`,
      borderRadius: 12, padding: "14px 16px", marginTop: 12,
      display: "flex", gap: 10, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{styles.icon}</span>
      <p style={{ fontSize: 13, color: styles.color, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{children}</p>
    </div>
  );
}
