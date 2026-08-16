/* ------------------------------------------------------------------ */
/*  Säntis Capital — data model & static reference data                */
/* ------------------------------------------------------------------ */

export interface UnderlyingDef {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  /** price at observation / issue (reference) */
  ref: number;
  /** current market price at load */
  price: number;
  /** basket weight in % */
  weight: number;
  divYield: number;
}

export interface Holding {
  id: string;
  isin: string;
  name: string;
  type: string;
  qty: number;
  avgPrice: number;
  currency: string;
  risk: number; // 1..7
  couponPct?: number;
  barrierInfo?: string;
  maturity: Date;
}

export interface Activity {
  id: string;
  date: Date;
  kind: "buy" | "coupon" | "info";
  label: string;
  amount: number;
  currency: string;
}

export interface ChatMsg {
  id: string;
  from: "user" | "ai" | "pm";
  text: string;
  time: Date;
}

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: "ok" | "warn" | "info";
}

/* ------------------------------- product ------------------------------- */

export const PRODUCT = {
  isin: "CH1571730808",
  valor: "157 173 080",
  symbol: "SNTQDC",
  name: "Tracker Certificate on Säntis Swiss Quality Dividend Basket",
  short: "Swiss Quality Dividend Tracker",
  type: "Tracker Certificate",
  category: "Participation · Long",
  issuer: "Säntis Capital (Guernsey) Ltd",
  guarantor: "Säntis Capital AG, Zürich",
  currency: "CHF",
  issuePrice: 1000,
  spreadPct: 0.8,
  rating: "S&P A · Moody's A2",
  riskLevel: 5,
  listing: "SIX Swiss Exchange",
  quanto: "Not applicable — all underlyings denominated in CHF",
  settlement: "Cash",
  prospectus: "English / German",
};

export const daysFromNow = (d: number) => {
  const t = new Date();
  t.setHours(12, 0, 0, 0);
  t.setDate(t.getDate() + d);
  return t;
};

export const DATES = {
  subOpen: daysFromNow(-9),
  subClose: daysFromNow(13),
  issue: daysFromNow(16),
  firstTrading: daysFromNow(18),
  maturity: daysFromNow(2.5 * 365),
  observation: daysFromNow(2.5 * 365 - 5),
};

export const UNDERLYINGS: UnderlyingDef[] = [
  { id: "nesn", name: "Nestlé SA", ticker: "NESN", sector: "Consumer Staples", ref: 88.1, price: 92.64, weight: 16, divYield: 3.2 },
  { id: "novn", name: "Novartis AG", ticker: "NOVN", sector: "Healthcare", ref: 109.4, price: 118.35, weight: 15, divYield: 3.1 },
  { id: "rog", name: "Roche Holding AG", ticker: "ROG", sector: "Healthcare", ref: 251.2, price: 263.9, weight: 14, divYield: 3.6 },
  { id: "ubsg", name: "UBS Group AG", ticker: "UBSG", sector: "Financials", ref: 31.05, price: 33.82, weight: 13, divYield: 2.1 },
  { id: "zurn", name: "Zurich Insurance Group", ticker: "ZURN", sector: "Financials", ref: 531.0, price: 561.4, weight: 12, divYield: 4.3 },
  { id: "abbn", name: "ABB Ltd", ticker: "ABBN", sector: "Industrials", ref: 54.3, price: 58.87, weight: 10, divYield: 1.8 },
  { id: "cfr", name: "Compagnie Financière Richemont", ticker: "CFR", sector: "Consumer Discretionary", ref: 142.6, price: 151.75, weight: 10, divYield: 2.0 },
  { id: "sren", name: "Swiss Re AG", ticker: "SREN", sector: "Financials", ref: 144.9, price: 152.3, weight: 10, divYield: 4.6 },
];

export const TERMS: Array<[string, string]> = [
  ["ISIN", PRODUCT.isin],
  ["Swiss Valor", PRODUCT.valor],
  ["SIX Symbol", PRODUCT.symbol],
  ["Product type", PRODUCT.type],
  ["Category", PRODUCT.category],
  ["Underlying", "Säntis Swiss Quality Dividend Basket (8 constituents, CHF)"],
  ["Issuer", PRODUCT.issuer],
  ["Guarantor", PRODUCT.guarantor],
  ["Currency", PRODUCT.currency],
  ["Issue price", "CHF 1'000.00 per Certificate (100%)"],
  ["Subscription period", `${fmtDate(DATES.subOpen)} – ${fmtDate(DATES.subClose)}, 12:00 CET`],
  ["Issue date", fmtDate(DATES.issue)],
  ["First trading day", fmtDate(DATES.firstTrading)],
  ["Final observation", fmtDate(DATES.observation)],
  ["Final maturity", fmtDate(DATES.maturity)],
  ["Participation", "100% — unlimited upside, full downside exposure"],
  ["Barrier / Cap", "None"],
  ["Coupon", "None — total return of the basket"],
  ["Quanto", PRODUCT.quanto],
  ["Issuer call / kick-out", "Not applicable"],
  ["Settlement", PRODUCT.settlement],
  ["Listing", `${PRODUCT.listing} — primary; secondary market via Säntis Capital`],
  ["Average secondary spread", `${PRODUCT.spreadPct.toFixed(2)}%`],
  ["Issue commission", "1.00% included in the issue price"],
  ["Ongoing costs (embedded)", "0.75% p.a."],
  ["Clearing", "SIX SIS AG"],
  ["Rating (guarantor)", PRODUCT.rating],
  ["Prospectus language", PRODUCT.prospectus],
  ["Governing law", "English law; jurisdiction of the courts of England"],
];

export const SCENARIOS = [
  { label: "Bear market", move: -25, note: "Basket falls 25% — the Certificate mirrors the loss 1:1." },
  { label: "Sideways", move: 0, note: "Basket flat at maturity — value ≈ issue price minus embedded costs." },
  { label: "Bull market", move: 25, note: "Basket gains 25% — investor participates fully, no cap applies." },
];

export const DOCUMENTS = [
  { name: "Prospectus — Base Programme 2026", kind: "PDF", size: "3.8 MB", date: daysFromNow(-9), tag: "Legal" },
  { name: "Final Terms CH1571730808", kind: "PDF", size: "0.6 MB", date: daysFromNow(-9), tag: "Legal" },
  { name: "Key Information Document (KID)", kind: "PDF", size: "0.3 MB", date: daysFromNow(-8), tag: "PRIIPs" },
  { name: "Termsheet — Swiss Quality Dividend Tracker", kind: "PDF", size: "0.4 MB", date: daysFromNow(-7), tag: "Marketing" },
  { name: "Basket composition & methodology", kind: "XLSX", size: "0.1 MB", date: daysFromNow(-7), tag: "Data" },
];

/* --------------------------- initial portfolio --------------------------- */

export const INITIAL_HOLDINGS: Holding[] = [
  {
    id: "h1",
    isin: "CH1339458271",
    name: "SMI® Barrier Reverse Convertible 8.9% p.a.",
    type: "Yield · Barrier Reverse Convertible",
    qty: 25,
    avgPrice: 1000,
    currency: "CHF",
    risk: 4,
    couponPct: 8.9,
    barrierInfo: "Barrier 65% · 27.4% away · semi-annual coupons",
    maturity: daysFromNow(425),
  },
];

export const FEATURED_HOLDING: Omit<Holding, "qty"> = {
  id: "h2",
  isin: PRODUCT.isin,
  name: PRODUCT.short,
  type: PRODUCT.category,
  avgPrice: 1000,
  currency: "CHF",
  risk: 5,
  barrierInfo: "No barrier — linear 100% participation",
  maturity: DATES.maturity,
};

export const INITIAL_CASH = 32_400;

export const INITIAL_ACTIVITY: Activity[] = [
  { id: "a1", date: daysFromNow(-160), kind: "buy", label: "Subscription — SMI® Barrier Reverse Convertible (25 × CHF 1'000)", amount: -25_000, currency: "CHF" },
  { id: "a2", date: daysFromNow(-98), kind: "coupon", label: "Coupon 1/2 — SMI® BRC 8.9% p.a.", amount: 1_112.5, currency: "CHF" },
  { id: "a3", date: daysFromNow(-41), kind: "info", label: "Barrier observation passed — SMI® BRC (no knock-in)", amount: 0, currency: "CHF" },
  { id: "a4", date: daysFromNow(-36), kind: "coupon", label: "Coupon 2/2 — SMI® BRC 8.9% p.a.", amount: 1_112.5, currency: "CHF" },
];

export const PM_PROFILE = {
  name: "Lena Brunner",
  role: "Head of Structured Products",
  firm: "Säntis Capital AG",
  initials: "LB",
};

export const ACCOUNTS = [
  { id: "depot", label: "Private Depot", iban: "CH93 0076 2011 6238 5295 7", custody: "Säntis Custody AG" },
  { id: "pension", label: "Pension Wrapper (3a)", iban: "CH45 0900 0000 8001 2233 9", custody: "Säntis Custody AG" },
];

/* ------------------------------ formatters ------------------------------ */

const chfFmt = new Intl.NumberFormat("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFmt = new Intl.NumberFormat("de-CH", { maximumFractionDigits: 0 });

export const chf = (n: number) => `CHF ${chfFmt.format(n)}`;
export const num = (n: number, dp = 2) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n);
export const int = (n: number) => intFmt.format(n);
export const pct = (n: number, dp = 2) => `${n > 0 ? "+" : ""}${num(n, dp)}%`;

export function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}
export function fmtTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(d);
}
export function daysUntil(d: Date) {
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
}

let seq = 1000;
export const uid = (p = "id") => `${p}-${++seq}-${Math.random().toString(36).slice(2, 6)}`;
