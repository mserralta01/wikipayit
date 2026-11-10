/**
 * Copy and sample data for the public landing page. Every business, person and
 * amount in the demos is fictional, and the demos say so on their face.
 * Money is integer cents.
 */

export const BRAND = {
  name: "WikiPayIt",
  ai: "WikiPayIt AI",
  siteUrl: "https://www.wikipayit.com",
  appUrl: "https://app.wikipayit.com",
  supportEmail: "support@wikipayit.com",
} as const

export const SIGN_IN_URL = `${BRAND.appUrl}/signin`
/** The app's sign-in page opens on its Sign up tab with mode=signup. */
export const SIGN_UP_URL = `${BRAND.appUrl}/signin?mode=signup`
export const TERMS_URL = `${BRAND.appUrl}/terms`
export const PRIVACY_URL = `${BRAND.appUrl}/privacy`
export const TALK_URL = `mailto:${BRAND.supportEmail}?subject=${encodeURIComponent("Talk to WikiPayIt")}`

export function signupHref(placement: string): string {
  return `${SIGN_UP_URL}&ref=${encodeURIComponent(`wikipayit-home-${placement}`)}`
}

export function fmt(cents: number, opts: { cents?: boolean } = {}): string {
  const showCents = opts.cents ?? cents % 100 !== 0
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })
}

export const NAV = [
  { href: "#features", label: "Features" },
  { href: "#ai", label: "WikiPayIt AI" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const

export const DEMO_BUSINESS = "Juniper Bakery"

export type FeedRow = { date: string; name: string; amount: number; category: string; note?: string }

export const FEED: FeedRow[] = [
  { date: "Oct 13", name: "Kingsfield Flour Co.", amount: -41260, category: "Ingredients" },
  { date: "Oct 13", name: "City Power & Light", amount: -23814, category: "Utilities" },
  { date: "Oct 14", name: "Card payout", amount: 284000, category: "Payout", note: "12 payments matched" },
  { date: "Oct 14", name: "Paper & Box Supply", amount: -6499, category: "Packaging", note: "Receipt matched" },
  { date: "Oct 15", name: "To Savings ••4471", amount: -150000, category: "Transfer", note: "Paired" },
  { date: "Oct 15", name: "Ellis Properties", amount: -320000, category: "Rent" },
  { date: "Oct 16", name: "Northside Fuel", amount: -5842, category: "Vehicle", note: "Receipt matched" },
  { date: "Oct 16", name: "Corner Hardware", amount: -2316, category: "Repairs" },
]

export function feedSummary(rows: FeedRow[] = FEED) {
  const transfers = rows.filter((r) => r.category === "Transfer")
  const counted = rows.filter((r) => r.category !== "Transfer")
  return {
    count: rows.length,
    moneyIn: counted.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0),
    moneyOut: counted.filter((r) => r.amount < 0).reduce((s, r) => s - r.amount, 0),
    transfers: transfers.length,
    receipts: rows.filter((r) => r.note === "Receipt matched").length,
  }
}

export type ShoeboxDoc = {
  kind: "invoice" | "receipt" | "sales"
  label: string
  detail: string
  amount: number
  /** Scattered start, percent of the board, and tilt in degrees. */
  from: [number, number, number]
}

export const SHOEBOX: ShoeboxDoc[] = [
  { kind: "invoice", label: "Invoice 1042", detail: "Harbor Cafe", amount: 128000, from: [4, 8, -9] },
  { kind: "receipt", label: "Kingsfield Flour", detail: "Ingredients", amount: 41260, from: [30, 4, 6] },
  { kind: "sales", label: "Card sales", detail: "46 payments", amount: 586000, from: [56, 12, -4] },
  { kind: "receipt", label: "Ellis Properties", detail: "Rent", amount: 320000, from: [12, 40, 11] },
  { kind: "invoice", label: "Invoice 1043", detail: "Lumen Studio", amount: 240000, from: [40, 34, -12] },
  { kind: "receipt", label: "City Power", detail: "Utilities", amount: 23814, from: [66, 42, 8] },
  { kind: "receipt", label: "Paper & Box", detail: "Packaging", amount: 6499, from: [6, 70, -5] },
  { kind: "invoice", label: "Invoice 1044", detail: "Oak & Ivy", amount: 294000, from: [34, 66, 9] },
  { kind: "receipt", label: "Northside Fuel", detail: "Vehicle", amount: 5842, from: [60, 72, -10] },
  { kind: "receipt", label: "Corner Hardware", detail: "Repairs", amount: 2316, from: [76, 22, 5] },
]

export function shoeboxTotals(docs: ShoeboxDoc[] = SHOEBOX) {
  const income = docs.filter((d) => d.kind !== "receipt").reduce((s, d) => s + d.amount, 0)
  const expenses = docs.filter((d) => d.kind === "receipt").reduce((s, d) => s + d.amount, 0)
  return { income, expenses, net: income - expenses }
}

export const BUSINESSES = [
  { name: "Juniper Bakery", kind: "LLC" },
  { name: "Juniper Catering", kind: "LLC" },
  { name: "Cottage Rental", kind: "Sole prop" },
  { name: "Personal", kind: "Household" },
]

export type RailFeature = {
  id: string
  label: string
  fact: string
  photo: "ceramics" | "foodtruck" | "consultant" | "team" | "landscape" | "florist"
}

export const RAIL: RailFeature[] = [
  {
    id: "invoices",
    label: "Invoices",
    fact: "Six designer templates in five languages. Preview, PDF and email always match.",
    photo: "ceramics",
  },
  {
    id: "paid",
    label: "Get paid",
    fact: "Card, Apple Pay, Google Pay or bank transfer, on every invoice and payment link.",
    photo: "foodtruck",
  },
  {
    id: "bank",
    label: "Bank sync",
    fact: "Every account, up to 24 months of history, synced every 6 hours.",
    photo: "consultant",
  },
  {
    id: "team",
    label: "Bills & team",
    fact: "Bills, vendors and roles for your team and your accountant.",
    photo: "team",
  },
  {
    id: "books",
    label: "Real books",
    fact: "Double-entry, 21 reports, budgets and cost of goods. Every P&L line opens to the transactions behind it.",
    photo: "landscape",
  },
  {
    id: "forecast",
    label: "Cash forecast",
    fact: "Safe to spend today, and 90 days ahead based on when each customer really pays.",
    photo: "florist",
  },
]

export type CompareChapter = {
  id: string
  tab: string
  headline: string
  rows: { label: string; us: string; them: string }[]
}

/** WikiPayIt against the stack of separate tools most small businesses run. No prices, no names. */
export const COMPARE: CompareChapter[] = [
  {
    id: "paid",
    tab: "Getting paid",
    headline: "Your invoice and your payment, finally in the same place.",
    rows: [
      { label: "Send an invoice", us: "Six templates, five languages", them: "An invoicing app" },
      { label: "Take a card or bank payment", us: "Built into every invoice", them: "A separate processor account" },
      { label: "Payment links and forms", us: "Included", them: "Another tool, another login" },
      { label: "Autopay for repeat customers", us: "Included", them: "Often a paid add-on" },
      { label: "Payout matched to the invoices it paid", us: "Automatic", them: "By hand, every week" },
    ],
  },
  {
    id: "books",
    tab: "Books",
    headline: "Real books that keep themselves up to date.",
    rows: [
      { label: "Bank feeds", us: "Every account, synced every 6 hours", them: "Exported and re-imported" },
      { label: "Double-entry ledger", us: "Yes, with 21 reports", them: "A spreadsheet, or a separate subscription" },
      { label: "Cash and accrual", us: "Switch with one click", them: "Usually one or the other" },
      { label: "Bank statements reconciled", us: "To the cent, then locked", them: "At year end, if ever" },
      { label: "Every business you own", us: "One login", them: "One subscription each" },
    ],
  },
  {
    id: "ai",
    tab: "AI bookkeeper",
    headline: "An AI that does the filing, and asks before it changes anything.",
    rows: [
      { label: "Sorts transactions", us: "Learns from how you file", them: "Rules you write yourself" },
      { label: "Reads receipts", us: "Matched to the bank line", them: "Typed in by hand" },
      { label: "Asks before changing your books", us: "Every change is a proposal", them: "Not applicable" },
      { label: "Undo any change", us: "Yes, row by row", them: "Not applicable" },
      { label: "Ask questions about your money", us: "In plain English, in chat", them: "Build a report and squint" },
    ],
  },
]

export const START_PLAN = [
  "Invoices, estimates and customers",
  "Card, Apple Pay, Google Pay and bank payments",
  "Bank sync for every account*",
  "Double-entry books, 21 reports, budgets",
  "Bills, vendors, team and accountant roles",
  "WikiPayIt AI to sort, match and close your month",
]

export const TALK_PLAN = [
  "Higher card volume or larger tickets",
  "Several businesses or locations",
  "Moving from another accounting app",
  "A walkthrough for you and your accountant",
  "Payment rates set for your business",
  "A real person who answers your email",
]

export const TRUST = [
  { lead: "It asks first.", body: "WikiPayIt AI prepares every change as a proposal. Nothing touches your books until you confirm." },
  { lead: "Undo, always.", body: "Every applied change can be undone, row by row, back to exactly how it was." },
  { lead: "Closed means closed.", body: "Once you close a month, changes post as adjustments. History is never rewritten." },
  { lead: "Every change on the record.", body: "A permanent activity log shows who changed what, people and AI alike." },
  {
    lead: "Your data stays yours.",
    body: "Bank access is encrypted with AES-256, and you decide which teammates and which accountant can see your books.",
  },
]

export const FAQ = [
  {
    q: "What is WikiPayIt?",
    a: "WikiPayIt is accounting and payments software for small businesses and for people who run more than one business. It includes invoicing, card and bank payments, bank sync, double-entry books with 21 reports, and WikiPayIt AI, a bookkeeper that proposes changes you confirm and can undo.",
  },
  {
    q: "What does it cost?",
    a: "You can create your account and set up your books without a card. Payment fees apply only when you collect money, and your rates depend on your business. Talk to us and we'll tell you yours before you take a single payment.",
  },
  {
    q: "How do I start taking payments?",
    a: "Create your account, then complete a short application inside WikiPayIt so we can verify your business. Once you're approved, every invoice can be paid by card, Apple Pay, Google Pay or bank transfer, and payouts land in your bank account already matched to the invoices they paid.",
  },
  {
    q: "Does the AI change my books on its own?",
    a: "Not unless you let it. Every change is a proposal you confirm, and every applied change can be undone. Autopilot stays off until an admin turns it on, and even then it only files high-confidence items under a limit you set.",
  },
  {
    q: "Can WikiPayIt replace my accounting software?",
    a: "For most small businesses, yes. Invoices, estimates, payments, bills, bank feeds, reconciliation, profit and loss, balance sheet, cash flow and sales tax reports are all included. You can start with opening balances and up to 24 months of bank history. WikiPayIt doesn't run payroll or track time yet.",
  },
  {
    q: "How do bank connections work?",
    a: "WikiPayIt connects to your banks through a secure bank data service, which you subscribe to directly. One connection can feed every business you own. WikiPayIt pulls up to 24 months of history and keeps syncing every 6 hours. Bank access is stored encrypted with AES-256.",
  },
  {
    q: "Can I run more than one business?",
    a: "Yes, plus your Personal finances, under one login. When one business pays a bill for another, WikiPayIt books both sides and keeps a who-owes-whom report.",
  },
  {
    q: "Can my accountant work in WikiPayIt?",
    a: "Yes. Invite your accountant with their own role. They can review, reconcile and sign off closed periods, and at year end WikiPayIt packages your reports into one download for them.",
  },
]
