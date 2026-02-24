"use client";

import Link from "next/link";

const EFFECTIVE_DATE = "24 February 2026";

export default function TermsPage() {
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
          }}>LEGAL DOCUMENT</span>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, marginBottom: 8, fontFamily: "var(--font-display)", lineHeight: 1.1 }}>
            Terms of Use
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-400)", fontFamily: "var(--font-body)" }}>
            Effective Date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Governed by the Laws of the Republic of Ghana
          </p>
        </div>

        <div style={{
          background: "#fef3c7", border: "1px solid #fde68a",
          borderRadius: 14, padding: "16px 20px",
        }}>
          <p style={{ fontSize: 14, color: "#92400e", lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
            <strong>Important:</strong> Please read these Terms of Use carefully before accessing or using Deklata.
            By creating an account, logging in, or using any feature of the platform, you acknowledge that you have
            read, understood and agree to be legally bound by these Terms in their entirety. If you do not agree,
            you must discontinue use immediately.
          </p>
        </div>
      </div>

      {/* TABLE OF CONTENTS */}
      <div style={{
        background: "var(--green-50)", border: "1px solid var(--green-100)",
        borderRadius: 16, padding: "24px 28px", marginBottom: 40,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.8px", color: "var(--green-700)", fontFamily: "var(--font-display)", marginBottom: 14 }}>
          TABLE OF CONTENTS
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "4px 24px" }}>
          {[
            "1. About Deklata & Platform Nature",
            "2. Eligibility & Account Registration",
            "3. Nature of Service & Platform Role",
            "4. User Responsibilities & Conduct",
            "5. Prohibited Items & Activities",
            "6. Item Listings & Content Standards",
            "7. Contact Information & Privacy",
            "8. Exchanges, Pickups & Physical Safety",
            "9. Assumption of Risk",
            "10. Limitation of Liability",
            "11. Indemnification",
            "12. Intellectual Property",
            "13. Data Protection & Privacy",
            "14. Cybersecurity & Platform Availability",
            "15. Points System & Rewards",
            "16. Account Suspension & Termination",
            "17. Dispute Resolution & Governing Law",
            "18. Amendments to These Terms",
            "19. Severability & Entire Agreement",
            "20. Contact & Notices",
          ].map((item) => (
            <p key={item} style={{ fontSize: 13, color: "var(--green-800)", margin: "2px 0", lineHeight: 1.5 }}>{item}</p>
          ))}
        </div>
      </div>

      {/* SECTIONS */}

      <Section number="1" title="About Deklata & Platform Nature">
        <P>Deklata is a free, peer-to-peer student item exchange platform operating in Ghana. It enables registered students to give away items they no longer need and to request items offered by other students on participating campuses, currently including the University for Development Studies (UDS) Tamale Campus, UDS Nyankpala Campus and Tamale Technical University.</P>
        <P>Deklata operates exclusively as a <strong>technology intermediary</strong>. It provides the digital infrastructure through which students may connect — nothing more. Deklata does not at any time own, purchase, sell, store, inspect, appraise, insure, ship, deliver, handle, or take physical possession of any item listed or exchanged on the platform.</P>
        <P>Deklata expressly disclaims any role as agent, broker, principal, auctioneer, employer, franchisor, partner, joint venture participant, or co-owner with respect to any user, listing, item, or transaction conducted through or facilitated by the platform.</P>
        <P>All exchanges are voluntary, free of monetary consideration, and conducted entirely at the independent discretion of the users involved.</P>
      </Section>

      <Section number="2" title="Eligibility & Account Registration">
        <P>To access features requiring an account, you must:</P>
        <BulletList items={[
          "Be at least 18 years of age, or the age of legal majority in your jurisdiction, whichever is higher.",
          "Be a currently enrolled student or formally affiliated with a participating educational institution.",
          "Be legally capable of entering into binding contracts under Ghanaian law and the laws of your jurisdiction.",
          "Provide accurate, complete and truthful registration information including your full name, a valid and reachable phone number and a functional email address.",
          "Maintain and promptly update your account information to keep it accurate and current.",
          "Select the campus you are affiliated with accurately — misrepresentation of campus affiliation is a violation of these Terms.",
        ]} />
        <P>You may not create an account on behalf of another person or entity. You are solely responsible for all activity that occurs under your account. You agree to maintain the confidentiality of your login credentials and to notify Deklata immediately of any unauthorized use of your account.</P>
        <P>Deklata reserves the right to verify eligibility at any time and to refuse, suspend or terminate any account where eligibility requirements are not met or where false information has been provided. False representation may result in permanent account termination and may attract legal consequences under the <strong>Criminal Offences Act, 1960 (Act 29)</strong> of Ghana and other applicable laws.</P>
      </Section>

      <Section number="3" title="Nature of Service & Platform Role">
        <P>Deklata provides a platform for students to connect. The following principles define and limit the nature of that service:</P>
        <BulletList items={[
          "Deklata does not take ownership, custody or control of any listed item at any point.",
          "Deklata does not guarantee, verify, represent or warrant the quality, safety, fitness for purpose, legality, accuracy of description, condition, or authenticity of any item listed on the platform.",
          "Deklata does not verify the identity, age, enrolment status, or good standing of any user beyond what is voluntarily provided during registration.",
          "All exchanges occur directly between users. Deklata is not a party to any exchange, agreement, or arrangement between users.",
          "Users assume full, sole and exclusive responsibility for their interactions, decisions and transactions.",
          "Deklata does not mediate, arbitrate, or resolve disputes between users and has no obligation to do so.",
          "Deklata's role ends at facilitating the initial connection between a giver and a requester. Everything that follows is entirely the responsibility of the users involved.",
        ]} />
      </Section>

      <Section number="4" title="User Responsibilities & Conduct">
        <P>By using Deklata, you agree to the following responsibilities:</P>
        <BulletList items={[
          "List only items that are lawful, legitimately owned by you, safe, accurately described, and in the condition stated.",
          "Provide honest, complete and non-misleading descriptions of all items, including their true condition, any defects, damage or limitations.",
          "Use a valid, active and personally reachable phone number. Your phone number will be shared with the other party upon request approval to facilitate the exchange.",
          "Communicate with other users in a respectful, honest and non-abusive manner.",
          "Conduct all physical exchanges in safe, public, well-lit locations on campus.",
          "Exercise independent judgment and conduct your own due diligence before agreeing to any exchange.",
          "Promptly confirm exchanges through the platform after they occur to ensure accurate record-keeping and points allocation.",
          "Comply with all applicable laws of Ghana, including but not limited to the Criminal Offences Act 1960 (Act 29), the Electronic Transactions Act 2008 (Act 772), the Data Protection Act 2012 (Act 843), and all relevant consumer protection regulations.",
          "Not engage in any activity that could harm, disrupt, defraud, or endanger other users or the platform.",
        ]} />
      </Section>

      <Section number="5" title="Prohibited Items & Activities">
        <P>The following items are strictly prohibited from being listed on Deklata under any circumstances:</P>
        <BulletList items={[
          "Firearms, ammunition, weapons, explosives, or any item regulated under the Arms and Ammunition Act, 1962 (Act 118) of Ghana.",
          "Controlled substances, narcotics, illegal drugs or drug paraphernalia.",
          "Alcoholic beverages, tobacco or substances regulated under Ghanaian law.",
          "Stolen goods, counterfeit products, or any item obtained through unlawful means.",
          "Human body parts, organs, biological materials, or any item prohibited under Ghanaian health and ethical laws.",
          "Pornographic, obscene or sexually explicit materials.",
          "Items that infringe the intellectual property rights of any third party, including counterfeit branded goods.",
          "Hazardous, toxic, flammable, corrosive or radioactive materials.",
          "Live animals or animal products regulated under Ghanaian wildlife and veterinary laws.",
          "Items subject to export controls, sanctions, or trade restrictions.",
          "Any item whose listing, possession or transfer is prohibited under Ghanaian law or applicable international law.",
        ]} />
        <P>The following <strong>activities</strong> are strictly prohibited on Deklata:</P>
        <BulletList items={[
          "Misrepresenting items, their condition, ownership or any material fact.",
          "Harassment, threats, intimidation, stalking or abusive conduct toward any user.",
          "Impersonating any person, institution or official body.",
          "Using the platform for any commercial purpose, resale, profit-making or business operation without prior written authorisation from Deklata.",
          "Collecting, harvesting or scraping user data from the platform.",
          "Attempting to gain unauthorised access to any account, system or data.",
          "Introducing malware, viruses, or any harmful code to the platform.",
          "Circumventing, disabling or interfering with any security feature of the platform.",
          "Using the platform to solicit donations, investments, or financial contributions of any kind.",
          "Creating multiple accounts or false accounts for any purpose.",
          "Facilitating or enabling any of the above prohibited activities by a third party.",
        ]} />
        <P>Deklata reserves the right to immediately remove any listing and suspend or permanently terminate any account found in violation of these prohibitions, without notice and without liability to the user.</P>
      </Section>

      <Section number="6" title="Item Listings & Content Standards">
        <P>When you post an item on Deklata, you represent and warrant that:</P>
        <BulletList items={[
          "You are the lawful owner of the item or have the legal right to give it away.",
          "The item is accurately described and the condition stated is truthful.",
          "Any photos uploaded are genuine images of the actual item being listed.",
          "The item does not infringe the intellectual property, privacy, or other rights of any third party.",
          "Listing the item does not violate any law, regulation or court order applicable to you.",
        ]} />
        <P>You grant Deklata a non-exclusive, royalty-free, worldwide licence to display, reproduce and use any content you upload to the platform solely for the purpose of operating and improving the service. You retain ownership of your content but acknowledge that Deklata may remove any content at its discretion without notice.</P>
        <P>Deklata does not pre-screen listings but reserves the right to remove any listing that violates these Terms or that Deklata, in its sole discretion, considers inappropriate, misleading, unsafe or harmful.</P>
      </Section>

      <Section number="7" title="Contact Information & Privacy">
        <P>Contact details — specifically your name and phone number — are treated as follows:</P>
        <BulletList items={[
          "Your phone number is never displayed publicly on the platform.",
          "Your phone number is shared with the other party in an exchange only after a request has been formally approved by the item owner.",
          "You consent to this limited, controlled sharing of your contact details as a necessary and integral part of the service.",
          "You must not use another user's contact details obtained through Deklata for any purpose other than coordinating the approved exchange.",
          "Using contact details obtained through Deklata to harass, solicit, spam, or contact users for unrelated purposes is a violation of these Terms and may constitute an offence under the Electronic Transactions Act 2008 (Act 772) and the Data Protection Act 2012 (Act 843).",
        ]} />
      </Section>

      <Section number="8" title="Exchanges, Pickups & Physical Safety">
        <P>All physical exchanges between users occur entirely outside of Deklata's control, oversight or involvement. Deklata has no presence at, knowledge of, or responsibility for any physical meeting between users.</P>
        <P>You acknowledge and agree that:</P>
        <BulletList items={[
          "You are solely responsible for your own physical safety before, during and after any exchange.",
          "You should always meet in public, well-lit, populated locations on campus during daytime hours.",
          "You should never meet alone in private residences, secluded areas, or off-campus locations with strangers.",
          "You have the absolute right to refuse, cancel or walk away from any exchange at any time if you feel unsafe, regardless of whether a request has been approved.",
          "You should inspect any item carefully before accepting it. Once you confirm receipt on the platform, Deklata considers the exchange complete.",
          "You should inform a trusted friend or colleague of any planned meeting for an exchange.",
          "Deklata is not responsible for any personal injury, loss, theft, assault, fraud, or other harm arising from a physical meeting between users, regardless of whether that meeting was facilitated by the platform.",
        ]} />
        <P>Deklata strongly encourages all users to report any safety concern, suspicious behaviour or incident through the Contact & Support page or by any available communication channel.</P>
      </Section>

      <Section number="9" title="Assumption of Risk">
        <P>You expressly, knowingly and voluntarily acknowledge and agree that:</P>
        <BulletList items={[
          "Peer-to-peer exchanges with individuals you have not previously met carry inherent and unavoidable risks, including but not limited to risk of physical harm, theft, fraud, misrepresentation, and property damage.",
          "You voluntarily assume all risks associated with using the platform, meeting other users, and giving or receiving items through Deklata.",
          "Deklata has taken reasonable steps to facilitate safe interactions through its approval system, contact-sharing controls and community guidelines, but cannot eliminate risk entirely.",
          "No representation, warranty or guarantee made by Deklata in any communication, marketing material or on the platform shall be construed as eliminating or reducing your assumption of risk under this clause.",
          "You waive any claim against Deklata arising from risks you have assumed under this clause to the fullest extent permitted by Ghanaian law.",
        ]} />
      </Section>

      <Section number="10" title="Limitation of Liability">
        <P>To the fullest extent permitted by the laws of the Republic of Ghana and all other applicable jurisdictions, <strong>Deklata, its founders, directors, officers, employees, contractors, agents and affiliates shall not be liable</strong> for any of the following, whether arising in contract, tort, negligence, statute or otherwise:</P>
        <BulletList items={[
          "Any indirect, incidental, special, exemplary, punitive or consequential damages of any kind.",
          "Loss of property, money, data, revenue, profit, business opportunity, goodwill or reputation.",
          "Personal injury, bodily harm, or death arising from user interactions or exchanges.",
          "Theft, fraud, misrepresentation or dishonest conduct by any user.",
          "Disputes, disagreements or legal proceedings between users.",
          "The quality, safety, condition, legality or fitness for purpose of any listed item.",
          "Unauthorized access to, alteration of, or loss of your account or data.",
          "Technical failures, service interruptions, bugs, errors or platform downtime.",
          "Any action taken by Deklata in good faith to enforce these Terms, including account suspension or listing removal.",
          "Any damage resulting from your reliance on any content, listing or communication on the platform.",
          "Any force majeure event including natural disasters, civil unrest, government actions, pandemics, power failures or internet disruptions.",
        ]} />
        <P>Where Ghanaian law does not permit the complete exclusion of liability, Deklata's total aggregate liability to you for all claims arising from or related to your use of the platform shall not exceed the sum of <strong>Zero Ghana Cedis (GHS 0.00)</strong>, reflecting the fact that Deklata provides its service entirely free of charge.</P>
      </Section>

      <Section number="11" title="Indemnification">
        <P>You agree to <strong>fully indemnify, defend and hold harmless</strong> Deklata and its founders, directors, officers, employees, contractors and affiliates from and against any and all claims, demands, actions, proceedings, damages, losses, liabilities, costs and expenses (including reasonable legal fees) arising out of or relating to:</P>
        <BulletList items={[
          "Your use of or access to the platform.",
          "Your violation of any provision of these Terms.",
          "Your violation of any applicable law, regulation or third-party right.",
          "Any item you list, give, or receive through the platform.",
          "Any dispute between you and another user.",
          "Any content you post, upload or submit to the platform.",
          "Any misrepresentation made by you to Deklata or to another user.",
          "Any physical exchange, meeting or interaction you undertake with another user.",
        ]} />
        <P>This indemnification obligation shall survive the termination or expiration of these Terms and your cessation of use of the platform.</P>
      </Section>

      <Section number="12" title="Intellectual Property">
        <P>All platform content, design, branding, logos, trademarks, trade names, software code, user interface elements, graphics, text and proprietary features of Deklata are the <strong>exclusive intellectual property of Deklata</strong> and are protected under the <strong>Copyright Act, 2005 (Act 690)</strong> of Ghana and applicable international intellectual property laws.</P>
        <P>You are strictly prohibited from:</P>
        <BulletList items={[
          "Copying, reproducing, distributing, transmitting or publicly displaying any part of the platform without prior written consent.",
          "Reverse engineering, decompiling or disassembling any software component of the platform.",
          "Creating derivative works based on the platform or its content.",
          "Using Deklata's name, logo, branding or trademarks in any manner without express written authorisation.",
          "Framing or mirroring any part of the platform on any other website or application.",
        ]} />
        <P>Any unauthorised use of Deklata's intellectual property constitutes infringement and may give rise to civil and criminal liability under Ghanaian law.</P>
        <P>You retain ownership of content you upload to Deklata, subject to the limited licence granted in Section 6 of these Terms.</P>
      </Section>

      <Section number="13" title="Data Protection & Privacy">
        <P>Deklata collects and processes personal data in accordance with the <strong>Data Protection Act, 2012 (Act 843) of Ghana</strong> and, where applicable, comparable data protection legislation in other African jurisdictions.</P>
        <P>By using the platform, you consent to:</P>
        <BulletList items={[
          "The collection of your name, email address, phone number, campus affiliation and usage data as necessary to provide the service.",
          "The sharing of your name and phone number with the other party in an approved exchange, as described in Section 7.",
          "The processing of your data to operate, maintain, improve and secure the platform.",
          "The retention of your data for as long as necessary to fulfil the purposes for which it was collected, or as required by law.",
        ]} />
        <P>Deklata implements reasonable and appropriate technical and organisational security measures to protect your personal data against unauthorised access, disclosure, alteration or destruction. However, <strong>no digital system can guarantee absolute security</strong>. You use the platform and provide your data at your own risk in this regard.</P>
        <P>Deklata will not sell, rent or trade your personal data to third parties for commercial purposes. Data may be disclosed where required by law, court order, or lawful request by a government authority in Ghana or another applicable jurisdiction.</P>
        <P>You have the right under the Data Protection Act to access, correct and request deletion of your personal data held by Deklata. Requests may be submitted through the Contact & Support page.</P>
      </Section>

      <Section number="14" title="Cybersecurity & Platform Availability">
        <P>Deklata does not guarantee continuous, uninterrupted or error-free access to the platform. The platform may be temporarily unavailable or degraded due to:</P>
        <BulletList items={[
          "Scheduled or emergency maintenance.",
          "Technical failures, bugs or infrastructure issues.",
          "Security incidents, cyberattacks or vulnerability remediation.",
          "Third-party service provider outages, including hosting, database or authentication services.",
          "Force majeure events beyond Deklata's reasonable control.",
        ]} />
        <P>You agree not to:</P>
        <BulletList items={[
          "Attempt to gain unauthorized access to any part of the platform, its servers, databases or connected systems.",
          "Conduct security testing, penetration testing or vulnerability scanning without prior written authorisation from Deklata.",
          "Introduce any virus, worm, trojan, ransomware, spyware or other malicious code to the platform.",
          "Perform any action that imposes an unreasonable or disproportionate load on the platform's infrastructure.",
        ]} />
        <P>Such activities may constitute offences under the <strong>Electronic Transactions Act 2008 (Act 772)</strong> and the <strong>Criminal Offences Act 1960 (Act 29)</strong> of Ghana, and Deklata reserves the right to report such activities to the appropriate authorities.</P>
      </Section>

      <Section number="15" title="Points System & Rewards">
        <P>Deklata operates a voluntary points system to recognise and reward generous giving behaviour among users. The following terms govern the points system:</P>
        <BulletList items={[
          "Points are awarded to item owners upon the confirmed completion of a valid exchange, where both the owner and requester have confirmed the handover on the platform.",
          "Points have no monetary value and cannot be exchanged for cash, transferred between accounts, or redeemed outside of any programme expressly offered by Deklata.",
          "The points system, including tier thresholds, rewards and redemption options, is subject to change at any time at Deklata's sole discretion without notice or liability to users.",
          "Any future rewards programme is entirely at Deklata's discretion. Deklata makes no binding promise or representation regarding the availability, value or continuity of any rewards.",
          "Manipulation of the points system, including fraudulent confirmations of exchanges that did not occur, is a violation of these Terms and may result in account termination and reversal of points.",
          "Deklata reserves the right to audit, adjust, withhold or revoke points at any time if it reasonably suspects abuse or fraudulent activity.",
        ]} />
      </Section>

      <Section number="16" title="Account Suspension & Termination">
        <P>Deklata reserves the right, in its sole and absolute discretion, to suspend, restrict or permanently terminate your account and access to the platform at any time, with or without prior notice, for any reason including but not limited to:</P>
        <BulletList items={[
          "Violation of any provision of these Terms.",
          "Violation of applicable Ghanaian law or any other applicable law.",
          "Conduct that Deklata reasonably believes poses a risk to the safety, wellbeing or rights of other users.",
          "Fraudulent, deceptive or misleading behaviour.",
          "Providing false registration information.",
          "Inactivity over an extended period.",
          "Receipt of credible complaints from other users.",
        ]} />
        <P>Deklata is under no obligation to provide reasons for account suspension or termination. Upon termination, your right to access the platform ceases immediately. Any listings you have posted may be removed at Deklata's discretion.</P>
        <P>You may voluntarily close your account at any time by contacting Deklata through the Contact & Support page. Termination does not affect any obligations or liabilities that arose prior to the date of termination, including indemnification obligations under Section 11.</P>
      </Section>

      <Section number="17" title="Dispute Resolution & Governing Law">
        <P><strong>User-to-User Disputes:</strong> Deklata strongly encourages users to resolve disputes amongst themselves amicably, in good faith and without involving Deklata. Deklata is not a party to any dispute between users and has no obligation to mediate, arbitrate or otherwise intervene.</P>
        <P><strong>Disputes with Deklata:</strong> In the event of any dispute, claim or controversy arising out of or relating to these Terms or your use of the platform, the parties agree to first attempt resolution through good faith negotiation. If resolution cannot be reached within 30 days, either party may pursue the matter through the courts.</P>
        <P><strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the <strong>laws of the Republic of Ghana</strong>, without regard to its conflict of law principles.</P>
        <P><strong>Jurisdiction:</strong> You irrevocably submit to the exclusive jurisdiction of the courts of competent jurisdiction in the Republic of Ghana for the resolution of any legal dispute arising from or related to these Terms or the use of the platform.</P>
        <P><strong>African Regional Context:</strong> Where users are located in other African jurisdictions, Deklata acknowledges the applicability of regional frameworks including the <strong>ECOWAS Supplementary Act on Personal Data Protection (2010)</strong> and the <strong>African Union Convention on Cyber Security and Personal Data Protection (Malabo Convention)</strong> where ratified, and will endeavour to act in a manner consistent with those frameworks.</P>
      </Section>

      <Section number="18" title="Amendments to These Terms">
        <P>Deklata reserves the right to amend, update or replace these Terms at any time and at its sole discretion. When changes are made:</P>
        <BulletList items={[
          "The updated Terms will be posted on this page with a revised Effective Date.",
          "Where changes are material, Deklata will make reasonable efforts to notify users by email or through a prominent notice on the platform.",
          "Your continued use of the platform after the Effective Date of any revised Terms constitutes your acceptance of the updated Terms.",
          "If you do not agree with any amendment, you must stop using the platform immediately.",
        ]} />
        <P>It is your responsibility to review these Terms periodically to stay informed of any changes.</P>
      </Section>

      <Section number="19" title="Severability & Entire Agreement">
        <P><strong>Severability:</strong> If any provision of these Terms is found by a court of competent jurisdiction to be invalid, unlawful or unenforceable, that provision shall be modified to the minimum extent necessary to make it enforceable, or severed from these Terms if modification is not possible. The validity, legality and enforceability of the remaining provisions shall not be affected or impaired in any way.</P>
        <P><strong>Entire Agreement:</strong> These Terms, together with the Community Guidelines and any other policies published on the platform, constitute the entire agreement between you and Deklata with respect to your use of the platform and supersede all prior agreements, representations, understandings and communications, whether oral or written, relating to the same subject matter.</P>
        <P><strong>No Waiver:</strong> Deklata's failure to enforce any provision of these Terms at any time shall not be construed as a waiver of that provision or of the right to enforce it in the future.</P>
        <P><strong>No Third-Party Beneficiaries:</strong> These Terms do not create any third-party beneficiary rights. No person other than the parties to these Terms shall have any right to enforce any provision of these Terms.</P>
      </Section>

      <Section number="20" title="Contact & Notices">
        <P>If you have any questions, concerns or complaints regarding these Terms, or if you wish to submit a legal notice to Deklata, please contact us through the platform's Contact & Support page.</P>
        <P>All legal notices to Deklata must be submitted in writing through the official contact channels made available on the platform. Notices sent through unofficial channels may not be acknowledged.</P>
        <P>Deklata will respond to legitimate legal notices and data protection requests in accordance with applicable Ghanaian law and within the timeframes required by law.</P>
      </Section>

      {/* FOOTER NOTE */}
      <div style={{
        marginTop: 48, padding: "20px 24px",
        background: "var(--ink-100)", borderRadius: 14,
        textAlign: "center",
      }}>
        <p style={{ fontSize: 13, color: "var(--ink-500)", lineHeight: 1.7, margin: 0 }}>
          By using Deklata, you confirm that you have read, understood and agreed to these Terms of Use in full.
          These Terms were last updated on <strong>{EFFECTIVE_DATE}</strong> and are governed by the laws of the Republic of Ghana.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/guidelines" style={{ fontSize: 13, color: "var(--green-700)", fontWeight: 600, textDecoration: "none" }}>
            Community Guidelines →
          </Link>
          <Link href="/contact" style={{ fontSize: 13, color: "var(--green-700)", fontWeight: 600, textDecoration: "none" }}>
            Contact & Support →
          </Link>
        </div>
      </div>

    </main>
  );
}

/* ── SECTION COMPONENT ── */
function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 12 }}>
      <div style={{
        background: "var(--white)", border: "1px solid var(--ink-100)",
        borderRadius: 16, padding: "28px 32px",
        boxShadow: "var(--shadow-card)",
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
          <span style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30, borderRadius: "50%",
            background: "var(--green-800)", color: "#fff",
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12,
            flexShrink: 0, marginTop: 2,
          }}>{number}</span>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
            color: "var(--ink-900)", margin: 0, lineHeight: 1.3,
          }}>{title}</h2>
        </div>
        <div style={{ paddingLeft: 44 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ── PARAGRAPH ── */
function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.8, marginBottom: 12, margin: "0 0 12px" }}>
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
