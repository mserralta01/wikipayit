import { useId } from "react"
import { BRAND, NAV, PRIVACY_URL, SIGN_IN_URL, TALK_URL, TERMS_URL, signupHref } from "./content"

/** The WikiPayIt mark: violet rounded square, white curved W, cyan dot. */
export function LogoMark({ className = "wpl-mark" }: { className?: string }) {
  const id = useId()
  return (
    <svg className={className} viewBox="0 0 512 512" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill={`url(#${id}g)`} />
      <rect width="512" height="512" rx="120" fill={`url(#${id}s)`} />
      <path
        d="M118 176 C140 300 160 352 190 352 C222 352 230 236 256 236 C282 236 290 352 322 352 C352 352 372 300 394 176"
        fill="none"
        stroke="#fff"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="256" cy="150" r="30" fill="#22D3EE" />
    </svg>
  )
}

export function SiteLogo() {
  return (
    <a href="#top" className="site-logo" aria-label={`${BRAND.name} home`}>
      <LogoMark />
      <span className="site-logo__word">
        Wiki<b>PayIt</b>
      </span>
    </a>
  )
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <SiteLogo />
        <nav aria-label="Main" className="site-nav">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="site-header__actions">
          <a href={SIGN_IN_URL} className="site-signin">
            Sign in
          </a>
          <a href={signupHref("header")} className="btn btn--primary btn--sm">
            Get started free
          </a>
          <details className="site-menu">
            <summary aria-label="Menu">
              <span />
              <span />
            </summary>
            <div
              className="site-menu__panel"
              onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}
            >
              {NAV.map((n) => (
                <a key={n.href} href={n.href}>
                  {n.label}
                </a>
              ))}
              <a href={SIGN_IN_URL}>Sign in</a>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}

const FOOTER: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#ai", label: `Ask ${BRAND.ai}` },
      { href: "#pricing", label: "Pricing" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: SIGN_IN_URL, label: "Sign in" },
      { href: signupHref("footer"), label: "Get started free" },
      { href: TALK_URL, label: "Talk to us" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: `mailto:${BRAND.supportEmail}`, label: BRAND.supportEmail },
      { href: TERMS_URL, label: "Terms" },
      { href: PRIVACY_URL, label: "Privacy" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="sc-wrap site-footer__grid">
        <div className="site-footer__brand">
          <SiteLogo />
          <p>Invoices, payments and real books for every business you own, with an AI bookkeeper that asks first.</p>
        </div>
        {FOOTER.map((col) => (
          <div key={col.title}>
            <h2 className="site-footer__title">{col.title}</h2>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="sc-wrap site-footer__fine">
        <p>Demos on this page use sample data. Every business, person and amount in them is fictional.</p>
        <p>
          © {new Date().getFullYear()} {BRAND.name}
        </p>
      </div>
    </footer>
  )
}
