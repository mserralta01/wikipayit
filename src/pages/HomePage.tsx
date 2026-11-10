import "../landing/scrollcraft.css"
import "../landing/landing.css"
import { SiteFooter, SiteHeader } from "../landing/Chrome"
import { BRAND, FAQ } from "../landing/content"
import {
  AiDemo,
  Close,
  CompareChapters,
  EveryBusiness,
  FaqSection,
  FeatureRail,
  Hero,
  PricingSection,
  Shoebox,
  Tension,
  TrustSection,
} from "../landing/sections"
import { useScrollcraft } from "../landing/useScrollcraft"

const LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BRAND.siteUrl}/#organization`,
    name: BRAND.name,
    url: `${BRAND.siteUrl}/`,
    logo: `${BRAND.siteUrl}/favicon.svg`,
    email: BRAND.supportEmail,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BRAND.siteUrl}/#website`,
    name: BRAND.name,
    url: `${BRAND.siteUrl}/`,
    publisher: { "@id": `${BRAND.siteUrl}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${BRAND.siteUrl}/#app`,
    name: BRAND.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Accounting and payments software",
    operatingSystem: "Web browser",
    url: BRAND.appUrl,
    description:
      "Accounting and payments for small businesses: invoicing, card and bank payments, bank sync, double-entry books and an AI bookkeeper that asks before it changes anything.",
    publisher: { "@id": `${BRAND.siteUrl}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  },
]

/*
 * The public landing page. Section order follows the shoebox-led story:
 *   hero · tension · shoebox (peak) · rail · AI · every business · compare ·
 *   pricing · trust · faq · close
 */
export default function HomePage() {
  useScrollcraft("top")
  return (
    <div className="wpl">
      <SiteHeader />
      <main id="top" className="home">
        <div data-sc-progress aria-hidden />
        <Hero />
        <Tension />
        <Shoebox />
        <FeatureRail />
        <AiDemo />
        <EveryBusiness />
        <CompareChapters />
        <PricingSection />
        <TrustSection />
        <FaqSection />
        <Close />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LD).replace(/</g, "\\u003c") }}
      />
    </div>
  )
}
