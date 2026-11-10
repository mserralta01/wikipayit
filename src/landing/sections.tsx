import type { CSSProperties } from "react"
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  CornerUpLeft,
  FileText,
  Landmark,
  Paperclip,
  Receipt,
  Sparkles,
} from "lucide-react"
import closePhoto from "./media/close.webp"
import everyPhoto from "./media/every-business.webp"
import heroPhoto from "./media/hero.webp"
import ceramics from "./media/ceramics.webp"
import consultant from "./media/consultant.webp"
import florist from "./media/florist.webp"
import foodtruck from "./media/foodtruck.webp"
import landscape from "./media/landscape.webp"
import team from "./media/team.webp"
import { LogoMark } from "./Chrome"
import {
  BRAND,
  BUSINESSES,
  COMPARE,
  DEMO_BUSINESS,
  FAQ,
  FEED,
  RAIL,
  SHOEBOX,
  START_PLAN,
  TALK_PLAN,
  TALK_URL,
  TRUST,
  feedSummary,
  fmt,
  shoeboxTotals,
  signupHref,
  type RailFeature,
} from "./content"

type Vars = CSSProperties & Record<`--${string}`, string | number | undefined>

/* ------------------------------------------------------------------ hero -- */

/*
 * Layered hero: the photograph lags the page while the copy and the product
 * window ride at 1x. The window sits beside the copy (under it on narrow screens).
 */
export function Hero() {
  return (
    <section data-sc-act="flow" className="hero" aria-labelledby="hero-title">
      <div className="hero__media" data-sc-parallax="-1.6">
        <img
          src={heroPhoto}
          alt="Hands pulling receipts out of an overflowing shoebox on a kitchen table"
          className="hero__photo fill"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="hero__wash" aria-hidden />
      <div className="sc-wrap hero__inner hero__grid">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            From shoebox to balanced books.
          </h1>
          <p className="hero__sub">
            Receipts, invoices and bank lines land on the right line by themselves, and your customers pay you in the
            same place. Your profit and loss stays true.
          </p>
          <div className="hero__ctas">
            <a className="btn btn--primary btn--lg" href={signupHref("hero")}>
              Get started free
            </a>
            <a className="btn btn--quiet btn--lg" href={TALK_URL}>
              Talk to us
            </a>
          </div>
          <p className="hero__fine">No card needed · Payments built in · Every business you own</p>
        </div>
        <div className="hero__app-col">
          <HeroApp />
        </div>
      </div>
    </section>
  )
}

function HeroApp() {
  return (
    <div className="hero-app" role="img" aria-label="Demo with sample data: a WikiPayIt dashboard with money in, paid invoices and an AI suggestion">
      <div className="app-win">
        <div className="app-win__bar">
          <span className="app-win__title">
            <LogoMark /> {DEMO_BUSINESS} · Today
          </span>
          <span className="demo-badge">Demo · sample data</span>
        </div>
        <div className="app-win__body">
          <dl className="app-stats">
            <div className="app-stat app-stat--accent">
              <dt>Money in this week</dt>
              <dd className="tabular">{fmt(864000)}</dd>
            </div>
            <div className="app-stat">
              <dt>Invoices due</dt>
              <dd className="tabular">{fmt(294000)}</dd>
            </div>
            <div className="app-stat">
              <dt>Safe to spend</dt>
              <dd className="tabular">{fmt(1421055, { cents: false })}</dd>
            </div>
          </dl>
          <ul className="app-list">
            <li>
              <span className="app-list__icon">
                <FileText aria-hidden />
              </span>
              <span className="app-list__name">
                <span>Invoice 1043 · Lumen Studio</span>
                <em>Paid by card</em>
              </span>
              <span className="app-list__amt is-in tabular">+{fmt(240000, { cents: true })}</span>
            </li>
            <li>
              <span className="app-list__icon">
                <Landmark aria-hidden />
              </span>
              <span className="app-list__name">
                <span>Card payout</span>
                <em>46 payments matched</em>
              </span>
              <span className="app-list__amt is-in tabular">+{fmt(586000, { cents: true })}</span>
            </li>
            <li>
              <span className="app-list__icon">
                <Receipt aria-hidden />
              </span>
              <span className="app-list__name">
                <span>Kingsfield Flour Co.</span>
                <em>Ingredients · receipt matched</em>
              </span>
              <span className="app-list__amt tabular">−{fmt(41260, { cents: true })}</span>
            </li>
          </ul>
          <div className="app-ai">
            <Sparkles aria-hidden />
            <p>
              <strong>{BRAND.ai}:</strong> 8 transactions sorted, 2 receipts matched.
            </p>
            <span className="app-ai__btn">Review</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- tension -- */

/* Quiet ground, type only: the authored silence before the peak. */
export function Tension() {
  return (
    <section data-sc-act="flow" className="tension" aria-labelledby="tension-title">
      <div className="sc-wrap tension__inner">
        <h2 id="tension-title" className="tension__line" data-sc-cue="0.12">
          Your invoices live in one app. Your payments in another.
        </h2>
        <p className="tension__line" data-sc-cue="0.2">
          Your books live in a third, and someone copies numbers between them every month.
        </p>
        <p className="tension__line tension__line--soft" data-sc-cue="0.28">
          Receipts pile up. Payouts never quite match the deposits.
        </p>
        <p className="tension__line tension__line--turn" data-sc-cue="0.36" data-sc-kinetic="lines">
          So we put it all in one place.
        </p>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- shoebox -- */

/*
 * Shoebox to balanced books. Ten pieces of paper start scattered across the
 * board and fly into their line of a profit and loss as the act scrolls. Each
 * piece reads its own window from --sc-p. Final state (no engine) is the
 * balanced statement.
 */
const income = SHOEBOX.map((d, i) => ({ ...d, i })).filter((d) => d.kind !== "receipt")
const expenses = SHOEBOX.map((d, i) => ({ ...d, i })).filter((d) => d.kind === "receipt")

export function Shoebox() {
  const t = shoeboxTotals()
  const slots = new Map<number, number>()
  income.forEach((d, row) => slots.set(d.i, row))
  expenses.forEach((d, row) => slots.set(d.i, income.length + 1 + row))

  return (
    <section
      id="shoebox"
      data-sc-act="pin"
      data-sc-span="3.2"
      data-sc-drift="#FFF8EC"
      className="box-act is-peak"
      aria-labelledby="box-title"
    >
      <div data-sc-stage className="box-stage">
        <div className="sc-wrap box-grid">
          <div className="box-copy">
            <h2 id="box-title" className="box-line" data-sc-cue="0 0.34 0 0.25">
              A shoebox of paper.
            </h2>
            <p className="box-line" data-sc-cue="0.3 0.66">
              WikiPayIt reads every receipt and invoice and files it on the right line.
            </p>
            <p className="box-line" data-sc-cue="0.62 1 0.12 0.02">
              Your profit and loss, true to the cent.
            </p>
          </div>

          <div className="box-board" role="img" aria-label="Demo with sample data: receipts and invoices fly into a balanced profit and loss">
            <span className="demo-badge box-board__badge">Demo · sample data</span>
            <div className="box-ledger" aria-hidden>
              <p className="box-ledger__h">October · Profit and loss</p>
              <p className="box-ledger__group" style={{ "--row": 0 } as Vars}>
                Income
              </p>
              <p className="box-ledger__group" style={{ "--row": income.length + 1 } as Vars}>
                Expenses
              </p>
              <div className="box-ledger__totals">
                <p>
                  <span>Income</span>
                  <span className="tabular">{fmt(t.income, { cents: true })}</span>
                </p>
                <p>
                  <span>Expenses</span>
                  <span className="tabular">{fmt(t.expenses, { cents: true })}</span>
                </p>
                <p className="box-ledger__net">
                  <span>Net profit</span>
                  <span className="tabular">{fmt(t.net, { cents: true })}</span>
                </p>
                <p className="box-ledger__stamp">
                  <Check aria-hidden /> Balanced
                </p>
              </div>
            </div>
            {SHOEBOX.map((d, i) => (
              <div
                key={d.label}
                className={`box-doc box-doc--${d.kind}`}
                style={
                  {
                    "--x0": d.from[0],
                    "--y0": d.from[1],
                    "--r0": `${d.from[2]}deg`,
                    "--row": slots.get(i),
                    "--i": i,
                  } as Vars
                }
                aria-hidden
              >
                <span className="box-doc__paper">
                  <span className="box-doc__kind">
                    {d.kind === "receipt" ? "Receipt" : d.kind === "sales" ? "Payout" : "Invoice"}
                  </span>
                  <span className="box-doc__label">{d.label}</span>
                  <span className="box-doc__amt tabular">{fmt(d.amount, { cents: true })}</span>
                </span>
                <span className="box-doc__line">
                  <span>
                    {d.label} <em>{d.detail}</em>
                  </span>
                  <span className="tabular">{fmt(d.amount, { cents: true })}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ rail -- */

const RAIL_PHOTOS: Record<RailFeature["photo"], { src: string; alt: string }> = {
  ceramics: { src: ceramics, alt: "A ceramicist trimming a bowl on the wheel" },
  foodtruck: { src: foodtruck, alt: "A food truck owner handing an order through the window" },
  consultant: { src: consultant, alt: "A consultant writing in a notebook at his desk" },
  team: { src: team, alt: "A barbershop owner and his bookkeeper at a table" },
  landscape: { src: landscape, alt: "A landscape designer planting an olive tree" },
  florist: { src: florist, alt: "A florist arranging ranunculus in her shop" },
}

function RailMini({ id }: { id: string }) {
  switch (id) {
    case "invoices":
      return (
        <div className="mini" aria-hidden>
          <p className="mini__h">
            <span>Invoice 1042</span>
            <span className="mini__pill">Sent</span>
          </p>
          <p className="mini__row">
            <span>Glazed bowls × 12</span>
            <strong className="tabular">{fmt(96000)}</strong>
          </p>
          <p className="mini__row">
            <span>Serving platter</span>
            <strong className="tabular">{fmt(32000)}</strong>
          </p>
          <p className="mini__row">
            <span>Total</span>
            <strong className="tabular">{fmt(128000, { cents: true })}</strong>
          </p>
        </div>
      )
    case "paid":
      return (
        <div className="mini" aria-hidden>
          <p className="mini__h">
            <span>Pay Harbor Cafe</span>
          </p>
          <p className="mini__big tabular">{fmt(4850, { cents: true })}</p>
          <div className="mini__pay">
            <span>Pay by card</span>
            <span>Apple Pay</span>
            <span>Bank</span>
          </div>
        </div>
      )
    case "bank":
      return (
        <div className="mini" aria-hidden>
          <p className="mini__h">
            <span>Checking ••2210</span>
            <span>Synced 6h</span>
          </p>
          <p className="mini__row">
            <span>Client retainer</span>
            <strong className="is-in tabular">+{fmt(250000)}</strong>
          </p>
          <p className="mini__row">
            <span>Office rent</span>
            <strong className="tabular">−{fmt(140000)}</strong>
          </p>
          <p className="mini__row">
            <span>Software</span>
            <strong className="tabular">−{fmt(4900)}</strong>
          </p>
        </div>
      )
    case "team":
      return (
        <div className="mini" aria-hidden>
          <p className="mini__h">
            <span>Team</span>
          </p>
          <p className="mini__row">
            <span>Marcus</span>
            <strong>Owner</strong>
          </p>
          <p className="mini__row">
            <span>Dana, bookkeeper</span>
            <strong>Accountant</strong>
          </p>
          <p className="mini__row">
            <span>Bill · Clipper supply</span>
            <strong className="tabular">{fmt(31250, { cents: true })}</strong>
          </p>
        </div>
      )
    case "books":
      return (
        <div className="mini" aria-hidden>
          <p className="mini__h">
            <span>Profit and loss · Q3</span>
          </p>
          <p className="mini__row">
            <span>Income</span>
            <strong className="tabular">{fmt(4812000)}</strong>
          </p>
          <p className="mini__row">
            <span>Cost of goods</span>
            <strong className="tabular">−{fmt(1630000)}</strong>
          </p>
          <p className="mini__row">
            <span>Net profit</span>
            <strong className="is-in tabular">{fmt(1945500)}</strong>
          </p>
        </div>
      )
    default:
      return (
        <div className="mini" aria-hidden>
          <p className="mini__h">
            <span>Safe to spend today</span>
          </p>
          <p className="mini__big tabular">{fmt(1421055, { cents: false })}</p>
          <div className="mini__bars">
            {[38, 52, 46, 64, 58, 72, 80, 70, 88].map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      )
  }
}

/*
 * The breadth beat: vertical scroll, lateral travel. The heading rides in as
 * the first item and a closing note as the last.
 */
export function FeatureRail() {
  return (
    <section id="features" data-sc-act="pan" data-sc-span="4" data-sc-drift="#F7F5FE" className="rail-act" aria-labelledby="rail-title">
      <div data-sc-stage className="rail-stage">
        <div className="rail" data-sc-pan="0.04">
          <div className="rail__intro">
            <h2 id="rail-title" className="rail__title">
              Everything you&apos;d pay extra for. Included.
            </h2>
            <p className="rail__lede">Invoices, payments and books in one app, for every business you own.</p>
          </div>
          {RAIL.map((f, i) => {
            const photo = RAIL_PHOTOS[f.photo]
            return (
              <article key={f.id} className="rail-card" style={{ "--i": i } as Vars}>
                <div className="rail-card__media">
                  <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="rail-card__photo fill" />
                  <RailMini id={f.id} />
                </div>
                <h3 className="rail-card__label">{f.label}</h3>
                <p className="rail-card__fact">{f.fact}</p>
              </article>
            )
          })}
          <div className="rail__outro">
            <p className="rail__outro-big">All of it, one login.</p>
            <a className="btn btn--primary btn--lg" href={signupHref("rail")}>
              Get started free
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- AI act -- */

/*
 * A pinned stage whose surface is real markup with sample data. Every state
 * change is CSS reading the act's scroll progress (--sc-p). Without the engine
 * --sc-p is unset and the surface shows its final state.
 */
const PROMPT = "Sort last week and match my receipts"

export function AiDemo() {
  const s = feedSummary()
  return (
    <section
      id="ai"
      data-sc-act="pin"
      data-sc-span="2.4"
      data-sc-drift="#EFE9FE"
      className="ai-act"
      aria-labelledby="ai-title"
    >
      <div data-sc-stage className="ai-stage">
        <div className="sc-wrap ai-grid">
          <div className="ai-copy">
            <p className="sc-label">{BRAND.ai}</p>
            <div className="ai-copy__lines">
              <h2 id="ai-title" className="ai-line" data-sc-cue="0 0.26 0 0.25">
                Monday morning. {s.count} transactions waiting.
              </h2>
              <p className="ai-line" data-sc-cue="0.22 0.46">
                Ask {BRAND.ai}. It prepares every change, then waits for you.
              </p>
              <p className="ai-line" data-sc-cue="0.42 0.66">
                Confirm, and the week is filed.
              </p>
              <p className="ai-line ai-line--last" data-sc-cue="0.62 1 0.12 0.02">
                Changed your mind? One tap puts every row back.
              </p>
            </div>
          </div>

          <div className="ai-surface" role="img" aria-label={`Demo with sample data: ${BRAND.ai} files a week of bank transactions, then undoes it`}>
            <div className="ai-window">
              <div className="ai-window__bar">
                <span className="ai-window__title">{DEMO_BUSINESS} · Transactions</span>
                <span className="demo-badge">Demo · sample data</span>
              </div>
              <div className="ai-window__body">
                <ul className="ai-feed">
                  {FEED.map((r, i) => (
                    <li key={r.name} className="ai-row" style={{ "--i": i } as Vars}>
                      <span className="ai-row__date">{r.date}</span>
                      <span className="ai-row__name">
                        {r.name}
                        {r.note ? <em>{r.note}</em> : null}
                      </span>
                      <span className={`ai-row__amt tabular ${r.amount > 0 ? "is-in" : ""}`}>
                        {r.amount > 0 ? "+" : "−"}
                        {fmt(Math.abs(r.amount), { cents: true })}
                      </span>
                      <span className="ai-row__cat">
                        <span className="st st--wait">Needs a category</span>
                        <span className="st st--sugg">{r.category}</span>
                        <span className="st st--done">
                          <Check aria-hidden />
                          {r.category}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="ai-chat">
                  <div className="ai-chat__head">
                    <Sparkles aria-hidden /> {BRAND.ai}
                  </div>
                  <div className="ai-chat__thread">
                    <p className="ai-bubble ai-bubble--me">
                      <span className="ai-type">{PROMPT}</span>
                    </p>
                    <div className="ai-reply">
                      <p className="ai-bubble">
                        I sorted {s.count} transactions and matched {s.receipts} receipts. Nothing changes until you
                        confirm.
                      </p>
                      <div className="ai-card">
                        <p className="ai-card__title">File {s.count} transactions</p>
                        <dl className="ai-card__sum">
                          <div>
                            <dt>Money out</dt>
                            <dd className="tabular">{fmt(s.moneyOut, { cents: true })}</dd>
                          </div>
                          <div>
                            <dt>Money in</dt>
                            <dd className="tabular">{fmt(s.moneyIn, { cents: true })}</dd>
                          </div>
                          <div>
                            <dt>Transfers paired</dt>
                            <dd className="tabular">{s.transfers}</dd>
                          </div>
                        </dl>
                        <div className="ai-card__actions">
                          <span className="ai-btn ai-btn--confirm">
                            <span className="ai-btn__a">Confirm</span>
                            <span className="ai-btn__b">
                              <Check aria-hidden /> Filed
                            </span>
                          </span>
                          <span className="ai-btn ai-btn--undo">
                            <CornerUpLeft aria-hidden /> Undo
                          </span>
                        </div>
                        <p className="ai-card__undone">Undone. Every row is back exactly as it was.</p>
                      </div>
                    </div>
                  </div>
                  <div className="ai-chat__input">
                    <Paperclip aria-hidden />
                    <span>Ask about your books…</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- every business -- */

/*
 * Relief. A login for every business becomes one: the WikiPayIt side is
 * revealed over the stack of separate accounts it replaces.
 */
export function EveryBusiness() {
  const companies = BUSINESSES.filter((b) => b.name !== "Personal")
  return (
    <section data-sc-act="flow" className="every" aria-labelledby="every-title">
      <div className="sc-wrap every__grid">
        <figure className="every__photo">
          <img
            src={everyPhoto}
            alt="A cafe owner in her doorway holding the keys to her businesses"
            loading="lazy"
            decoding="async"
            className="fill"
          />
          <ul className="every__switcher" aria-hidden data-sc-parallax="0.7">
            {BUSINESSES.map((b, i) => (
              <li key={b.name} className={i === 0 ? "is-on" : undefined}>
                <i>{b.name.charAt(0)}</i>
                {b.name}
                <em>{b.kind}</em>
              </li>
            ))}
          </ul>
        </figure>
        <div className="every__copy">
          <h2 id="every-title" className="every__title">
            Every business you own. Plus Personal. One login.
          </h2>
          <p className="every__body">
            Add every business you run. Switch between them in one tap, see your personal net worth with your share of
            each, and ask {BRAND.ai} about all of them at once.
          </p>

          <div className="swap" aria-label="Separate accounts for each business compared with one WikiPayIt login (sample data)">
            <div className="swap__before">
              <p className="swap__h">The usual way</p>
              {companies.map((b) => (
                <p key={b.name} className="swap__row">
                  <span>{b.name}</span>
                  <span>Its own login</span>
                </p>
              ))}
              <p className="swap__row swap__row--total">
                <span>Three businesses</span>
                <span>Three of everything</span>
              </p>
            </div>
            <div className="swap__after" data-sc-reveal="left" data-sc-reveal-at="0.3 0.55">
              <p className="swap__h">{BRAND.name} · one login</p>
              {BUSINESSES.map((b) => (
                <p key={b.name} className="swap__row">
                  <span>
                    {b.name} <em>{b.kind}</em>
                  </span>
                  <b>
                    <Check aria-hidden /> Here
                  </b>
                </p>
              ))}
              <p className="swap__row swap__row--total">
                <span>Everything</span>
                <span>One login</span>
              </p>
            </div>
          </div>

          <p className="every__iou">
            <ArrowLeftRight aria-hidden />
            <span>
              When the bakery pays the catering company&apos;s supplier, {BRAND.name} books both sides and keeps a
              who-owes-whom report, so nothing gets lost between your businesses.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- compare -- */

/*
 * Proof, in chapters. The stage pins and the three comparisons travel in from
 * the right, one chapter at a time; the tab strip's marker follows the act.
 */
export function CompareChapters() {
  return (
    <section id="compare" data-sc-act="pan" data-sc-span="3.4" data-sc-drift="#F1EEFB" className="cmp-act" aria-labelledby="cmp-title">
      <div data-sc-stage className="cmp-stage">
        <div className="cmp-tabs" aria-hidden>
          {COMPARE.map((c) => (
            <span key={c.id}>{c.tab}</span>
          ))}
          <i className="cmp-tabs__marker" />
        </div>
        <div className="cmp-rail" data-sc-pan="0.02">
          <div className="cmp-rail__intro">
            <h2 id="cmp-title" className="cmp-rail__title">
              One app instead of four.
            </h2>
            <p className="cmp-rail__lede">
              Count the tools you use to get paid and keep your books today. Here is what replaces them.
            </p>
          </div>
          {COMPARE.map((c) => (
            <article key={c.id} className="cmp-card" aria-labelledby={`cmp-${c.id}`}>
              <header className="cmp-card__head">
                <p className="cmp-card__vs">{c.tab}</p>
                <h3 id={`cmp-${c.id}`} className="cmp-card__title">
                  {c.headline}
                </h3>
              </header>
              <table className="cmp cmp--compact">
                <caption className="sr-only">
                  {BRAND.name} compared with separate tools: {c.tab}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Task</span>
                    </th>
                    <th scope="col" className="cmp__us">
                      {BRAND.name}
                    </th>
                    <th scope="col">Separate tools</th>
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td className="cmp__us">
                        <Check aria-hidden className="cmp__win" />
                        {r.us}
                      </td>
                      <td className="cmp__no">{r.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- pricing etc. -- */

export function PricingSection() {
  return (
    <section id="pricing" className="sc-section pricing" aria-labelledby="pricing-title">
      <div className="sc-wrap">
        <div className="section-head" data-sc-in>
          <h2 id="pricing-title" className="section-title">
            Two ways to start. No traps.
          </h2>
          <p className="section-lede">Set up on your own in minutes, or have us walk you through it.</p>
        </div>
        <div className="plans">
          <article className="plan" aria-labelledby="plan-start">
            <h3 id="plan-start" className="plan__name">
              Start on your own
            </h3>
            <p className="plan__price plan__price--words">
              <span>Get started</span>
              <span>no card needed</span>
            </p>
            <p className="plan__pitch">Invoices, payments and real books for every business you own.</p>
            <ul className="plan__list">
              {START_PLAN.map((f) => (
                <li key={f}>
                  <Check aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <a className="btn btn--primary btn--lg plan__cta" href={signupHref("pricing-start")}>
              Get started free
            </a>
          </article>
          <article className="plan plan--super" aria-labelledby="plan-talk">
            <h3 id="plan-talk" className="plan__name">
              Talk to us
            </h3>
            <p className="plan__price plan__price--words">
              <span>Built for you</span>
            </p>
            <p className="plan__pitch">Rates and setup shaped around how your business takes money.</p>
            <ul className="plan__list">
              {TALK_PLAN.map((f) => (
                <li key={f}>
                  <Check aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <a className="btn btn--dark btn--lg plan__cta" href={TALK_URL}>
              Talk to us
            </a>
            <p className="plan__after">We answer at {BRAND.supportEmail}.</p>
          </article>
          <p className="plans__fine">
            *Bank sync runs through a secure third-party bank data service, which you subscribe to directly, and one
            subscription covers every business you own. Payment fees apply only when you collect money, and we tell you
            your rates before your first payment.
          </p>
        </div>
      </div>
    </section>
  )
}

export function TrustSection() {
  return (
    <section className="sc-section trust" aria-labelledby="trust-title">
      <div className="sc-wrap trust__grid">
        <div className="trust__head">
          <h2 id="trust-title" className="section-title">
            Your books. Your call.
          </h2>
          <p className="section-lede">
            An AI bookkeeper is only useful if you can trust it. So {BRAND.name} is built to be checked.
          </p>
        </div>
        <ul className="trust__list" data-sc-stagger="70">
          {TRUST.map((t) => (
            <li key={t.lead} data-sc-in>
              <strong>{t.lead}</strong>
              <span>{t.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function FaqSection() {
  return (
    <section id="faq" className="sc-section faq" aria-labelledby="faq-title">
      <div className="sc-wrap faq__grid">
        <h2 id="faq-title" className="section-title">
          Straight answers.
        </h2>
        <div className="faq__list">
          {FAQ.map((f) => (
            <details key={f.q} className="faq__item">
              <summary>
                <h3>{f.q}</h3>
                <ChevronDown aria-hidden />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* The close resolves and holds: one line, one action. */
export function Close() {
  return (
    <section data-sc-act="pin" data-sc-span="1.6" data-sc-drift="#FFF6E6" className="close-act" aria-labelledby="close-title">
      <div data-sc-stage className="close-stage">
        <figure className="close__photo" data-sc-reveal="iris" data-sc-reveal-at="0 0.45">
          <img
            src={closePhoto}
            alt="A bike shop owner wiping his hands at the end of the day"
            loading="lazy"
            decoding="async"
            className="fill"
          />
        </figure>
        <div className="sc-wrap close__inner">
          <div className="close__copy" data-sc-cue="0 1 0 0">
            <p className="close__qb">
              Invoices sent, payments in, receipts filed.
            </p>
            <h2 id="close-title" className="close__title">
              Books balanced.
            </h2>
            <a className="btn btn--primary btn--xl" href={signupHref("close")} data-sc-magnet="0.26">
              Get started free
            </a>
            <p className="close__fine">
              No card needed. Every business you own.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
