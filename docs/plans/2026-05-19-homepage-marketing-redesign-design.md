# Homepage Marketing Redesign — Design Doc

**Date:** 2026-05-19
**Status:** Approved (brainstorming phase complete)
**Owner:** Matt Serralta
**Next step:** Implementation plan via `superpowers:writing-plans`

---

## 1. Context

WikiPayIt is a payment-processing ISO/MSP. The current home page (`src/pages/HomePage.tsx`) renders 10 sections via a Firestore-driven section-ordering system. Sections are visually polished (Framer Motion, GSAP, a Three.js 3D credit-card hero) and cover industries, banking partners, POS hardware, gateways, high-risk processing, pricing models, ACH, testimonials, and a contact form.

The page underperforms as a marketing asset for four reasons:

1. **No clear positioning.** The headline ("Payment Solutions for Every Business") and supporting copy do not signal what WikiPayIt is better at than Stripe, Square, or other ISOs.
2. **Trust signals are buried.** "$2B+ processed / 98% satisfaction / 10K+ merchants" appears in section #9; bank-partner relationships are described but never named or shown as logos.
3. **CTA confusion.** Six different CTA labels across sections, all routing to `#contact`. The existing `MerchantApplicationPage` route is never linked from the home page.
4. **High-risk specialization — the strategic growth bet — is buried in section #6** under generic "Versatile Payment Solutions" copy, despite being the most defensible SEO and conversion angle.

## 2. Goals

In priority order:

1. **SEO authority** for high-intent high-risk merchant-account searches (e.g., *"cbd merchant account"*, *"firearms payment processing"*, *"high risk merchant account approval"*).
2. **Merchant applications** — drive qualified visitors into the existing `MerchantApplicationPage` flow.
3. **Sales leads** — capture lower-intent visitors via simplified contact forms and phone CTAs.
4. **Brand credibility** — establish WikiPayIt as a legitimate, established player for high-risk merchants who have been declined or shut down elsewhere.

Non-goals:

- A full visual rebrand. The existing blue→purple→cyan gradient system and Clash/Inter typography stay.
- Replacing the Firestore-driven section-ordering admin UI. Section components change; the orchestration layer in `HomePage.tsx` does not.

## 3. Positioning

**Strategic frame:** WikiPayIt is positioned as the **specialist that approves merchants others reject**, presented through an educational and trustworthy lens — not aggressive direct response.

The implicit promise to the visitor: *"High-risk processing is widely misunderstood. We explain it clearly, we place you with the right acquiring bank, and we have a track record we can show you."*

**Primary audience:** High-risk merchants in four verticals — CBD/kratom/nutra/vape, firearms/FFL/tactical, subscription/continuity/coaching/info-products, adult/dating/gaming/gambling.

**Secondary audience:** Standard retail/restaurant/professional-services merchants. Kept fully served via a calm secondary path, not demoted out of the funnel.

**Voice:** Educational, trustworthy, advisor-not-salesperson. Explains rather than asserts. Avoids hype words (revolutionize, transform, next-generation, military-grade, cutting-edge, best, fastest). Avoids urgency tactics, countdown timers, and "free audit" lead-magnet patterns.

## 4. Information architecture (revised section flow)

The 10 existing sections are repurposed, reordered, and supplemented with two new sections (trust strip, FAQ). The Firestore section IDs stay stable so the admin reordering UI continues to work.

| # | Section ID | Current purpose | New purpose |
|---|---|---|---|
| 1 | `hero` | 3D credit cards + generic typewriter copy | Educational headline targeting high-risk + real trust strip beneath. Three.js scene removed. |
| 2 | *(new)* `trustStrip` | — | Full-width band: real volume, years in business, PCI badge, bank-partner logo strip. |
| 3 | `industries` | Generic industry grid | "Industries we approve" — four high-risk verticals visually lead the grid; standard verticals form a calm second tier. Each high-risk card links to its dedicated landing page. |
| 4 | `highRisk` | Buried generic copy | Promoted: "About our high-risk practice" — real numbers, real bank relationships, real underwriting expertise. |
| 5 | `entrepreneur` (renamed `howItWorks`) | Startup-focused | "How approval actually works" — four-step educational explainer (Apply → Underwriting review → Bank matchmaking → Live in 24–48 hrs). Demystifies a process most high-risk merchants find opaque. |
| 6 | `pricing` | Was section #6 — too late | Promoted to mid-page. Reframed as educational: "Four ways merchants pay us — how to know which fits your business." Real ranges where defensible. |
| 7 | `gateway` | Authorize.Net / NMI / Fluidpay cards | Recast as "Gateway & integration partners" — paired visually with bank-partner logos as a unified credibility band. |
| 8 | `ach` | ACH features | Repurposed: "Beyond cards: ACH & alternative payments" — educational angle for subscription/continuity merchants especially. |
| 9 | `pos` | POS hardware showcase | Trimmed. POS is a feature, not positioning. One concise card unless POS is a material revenue driver. |
| 10 | `testimonials` | 3 stock-photo testimonials with suspicious round-number stats | Replaced with 1–3 **real, attributed case studies** with real headshots and specific outcomes. If only one real case study exists today, ship one and label "More case studies coming." |
| 11 | *(new)* `faq` | — | 8–12 educational questions with Schema.org `FAQPage` markup. Major SEO win for long-tail high-intent queries. |
| 12 | `contact` | High-friction 5-field form, generic CTA | Simplified: drop the 10-character message minimum, convert "Business type" from free-text to a select, primary CTA becomes **"Start your application"** linking to `MerchantApplicationPage`. Phone and scheduling links as secondary. |

## 5. Hero specification

**Layout:** Single-column, centered, ~80 vh on desktop, ~70 vh on mobile. No 3D scene.

**Visual:** Static photographic or illustrated background — recommended: a calm, professional photograph of a team member or a clean, brand-aligned SVG illustration. Must be `<150 KB` and lazy-load anything below the fold. WebP/AVIF with width-appropriate `srcset`.

**Headline (H1):** Targeting *"high risk merchant account"* and adjacent SEO terms while staying truthful.

> High-risk merchant accounts, done right.

**Subhead:**

> If you sell CBD, firearms, subscriptions, or anything else big processors call "risky," you need a partner who understands your business. We place merchants with the right acquiring banks — and we'll explain exactly how.

**Primary CTA:** "Start your application" → `/apply` (the existing `MerchantApplicationPage`).
**Secondary CTA:** "Talk to a specialist" → opens a calendar booking or jumps to `#contact`.

**Inline trust strip beneath CTAs (replaces the current 3-card "Industry Specialists / Fast Settlement / Versatile Solutions" grid):**

```
[$X billion processed]  |  [N years placing merchants]  |  [PCI DSS Level 1]  |  [N+ acquiring banks]
```

Stats must be real. Replace the current $2B+/98%/10K+ placeholders before launch.

## 6. New trust strip section

A full-width band, lightweight, immediately under the hero. Contains:

- **Bank-partner logo row** (acquiring banks) — establishes that WikiPayIt actually has the relationships it claims.
- **Gateway/integration logo row** (Authorize.Net, NMI, Fluidpay) — already visually familiar from current `GatewaySection`.
- **A single attributed customer quote** with a real name and a real business name. One quote, not three.
- **Compliance badges**: PCI DSS Level 1 (if accurate), BBB rating (if accurate), Visa/MasterCard registered ISO (if accurate).

If any of the above is not currently true, omit it from launch rather than fabricate.

## 7. "How approval actually works" section (replaces Entrepreneur)

A 4-step horizontal explainer:

1. **You apply** — 5-minute online application. We ask about your business model, processing history, and chargeback profile.
2. **We review and match** — Our underwriting team reviews your business and matches you with the acquiring bank most likely to approve at the best terms. You don't need to guess who to apply to.
3. **The bank decides** — Most decisions come back in 24–48 hours. We negotiate on your behalf if there's friction.
4. **You go live** — Once approved, we set up your gateway, terminal, or POS, and you're processing. Most merchants are taking payments within a week.

Each step has 2–3 sentences explaining *how* it works, not just *what* happens. This is the educational anchor of the page and the most quotable content for SEO.

## 8. FAQ section (new)

8–12 questions targeting long-tail SEO and pre-empting sales objections. Implemented with Schema.org `FAQPage` JSON-LD markup. Initial seed:

1. What is a high-risk merchant account?
2. Why was I declined by Stripe / Square / PayPal?
3. How long does approval take?
4. What does a high-risk merchant account cost?
5. What's the difference between an ISO and a payment processor?
6. Do you support chargeback dispute management?
7. What documents do I need to apply?
8. Can you process for [CBD / firearms / adult / subscription]?
9. What happens if my MCC code is restricted?
10. Do you offer ACH or alternative payment methods?
11. What's a reserve, and will I need one?
12. Can I keep my existing gateway?

Each answer is 2–4 sentences, plain-English, no hype.

## 9. New landing pages (separate workstream)

Four dedicated SEO landing pages targeting vertical-specific high-intent queries. These are React Router routes, separate from the home page, sharing the same component primitives.

| Route | Target keyword cluster |
|---|---|
| `/high-risk-merchant-accounts/cbd-kratom-nutra` | "cbd merchant account", "kratom payment processing", "nutra merchant services" |
| `/high-risk-merchant-accounts/firearms-ffl` | "ffl merchant account", "firearms credit card processing", "gun shop payment processor" |
| `/high-risk-merchant-accounts/subscription-continuity` | "subscription merchant account", "continuity billing processor", "recurring payment high risk" |
| `/high-risk-merchant-accounts/adult-dating-gaming` | "adult merchant account", "dating site payment processor", "gaming merchant services" |

Plus two supporting educational pages:

- `/how-approval-works` — long-form expansion of the home page section; primary SEO anchor for "how to get approved for a high risk merchant account"
- `/faq` — full FAQ page with all questions, indexed separately

Each landing page follows a consistent template: vertical-specific hero → vertical-specific underwriting concerns → vertical-specific case study (if available) → standard trust strip → standard FAQ subset → standard application CTA.

## 10. Technical changes

| Change | Rationale |
|---|---|
| Remove `three`, `@react-three/fiber`, `@react-three/drei` from the hero | Three.js bundle + `.obj`/`.mtl` model assets cost 300–600 KB of JS and hurt LCP on mobile. LCP is both a Google ranking factor and a documented conversion drag. Educational voice doesn't need 3D flash. |
| Replace stock Unsplash testimonial headshots | Stock photos in testimonials reduce trust when buyers recognize them. Use real headshots only, or omit. |
| Add Schema.org JSON-LD: `Organization`, `FAQPage`, `BreadcrumbList`, `Review` | Direct SEO win; enables rich results. |
| Add real `<meta>` descriptions and `<title>` per page (currently driven by `index.html` defaults) | Each landing page needs its own; React Helmet or equivalent. |
| Add `robots.txt` and `sitemap.xml` entries for the new landing pages | Standard SEO hygiene. |
| Convert `ContactForm.tsx` Business Type from free-text to `<select>` with the four high-risk verticals + "Standard retail/restaurant/services" + "Other" | Reduces friction and feeds segmentation. |
| Lighthouse audit pre- and post-redesign | Establishes baseline and validates the 3D-removal hypothesis. |
| Image pipeline: WebP/AVIF + `srcset` for hero, testimonial headshots, partner logos | Standard performance hygiene; matters more once 3D is gone and image is the new LCP element. |

## 11. Trust/proof inventory (must be filled before launch)

Before any page goes live, populate the following with real data. Where real data does not exist, omit the claim rather than estimate.

- [ ] Real annual processing volume
- [ ] Real years in business
- [ ] Real number of acquiring bank partners (and their names where contractually allowed)
- [ ] Real number of merchants served
- [ ] PCI compliance level (Level 1? Level 4? Don't claim Level 1 unless audited)
- [ ] BBB rating (if rated)
- [ ] At least 1 attributable case study per high-risk vertical (ideal: 4; minimum: 1 total at launch)
- [ ] At least 3 real client logos with usage permission
- [ ] Real headshots for any testimonial attributed to a real person

## 12. Out of scope (deliberately)

- Visual rebrand beyond removing the 3D hero
- Replacing the Firestore-driven section-ordering admin UI
- Building a chat widget backend (the current `ChatWidget` is a UI stub; either remove it or build it — not addressed here)
- Blog / content marketing system (the educational angle benefits from one, but it's a separate project)
- Paid-ad landing pages (these would use direct-response voice, which is explicitly out of scope for this redesign)
- Internationalization

## 13. Risks

| Risk | Mitigation |
|---|---|
| Standard-merchant referral traffic bounces because the page now leads with high-risk | Prominent "Standard business? Start here →" path in nav and on the homepage. Maintain a `/standard-merchant-services` route. |
| Real proof data isn't ready by launch | Phase the rollout: ship structural redesign with placeholder-honest copy ("merchants since 2013" with the real year), backfill real volume/logos/case studies as they become available. Never publish fabricated stats. |
| Removing 3D hero is visually missed | Replace with a deliberate, brand-aligned static visual. Measure LCP delta to validate the trade. |
| SEO landing pages create thin-content duplication | Each vertical page must have genuinely vertical-specific content (underwriting concerns, MCC codes, chargeback norms, case study). Do not template-and-swap-keywords. |
| Pricing transparency invites competitive comparison | Acceptable. Educational voice depends on it. Buyers who comparison-shop are already doing so; making it harder doesn't help. |

## 14. Success metrics

| Metric | Baseline | 90-day target |
|---|---|---|
| Organic traffic to `/high-risk-merchant-accounts/*` | 0 (pages don't exist) | Measurable indexing + first impressions for target keywords |
| Home page bounce rate | TBD (capture pre-launch) | Reduction by establishing clearer positioning |
| Homepage → `MerchantApplicationPage` click-through | TBD (capture pre-launch) | Measurable increase via direct CTA wiring |
| Mobile Lighthouse Performance score | TBD (capture pre-launch) | Material improvement after 3D removal |
| Contact form submission rate | TBD (capture pre-launch) | Increase from simplified form |

Capture all baseline metrics before any change ships.

## 15. Next step

This design doc is the strategic blueprint. The implementation plan — concrete file changes, phases, sequencing, and verification steps — is produced by invoking the `superpowers:writing-plans` skill against this doc.
