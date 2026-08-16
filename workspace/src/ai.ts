import { UNDERLYINGS, PRODUCT, chf, num, daysUntil, DATES, fmtDate, type Holding } from "./data";
import { holdingPrice, type Market } from "./market";

export interface Desk {
  holdings: Holding[];
  cash: number;
  market: Market;
  subscribed: boolean;
}

export interface Alert {
  tone: "ok" | "warn" | "info" | "bad";
  title: string;
  body: string;
  action?: { label: string; kind: "subscribe" | "chat"; prompt?: string };
}

export interface Analysis {
  total: number;
  invested: number;
  cashPct: number;
  riskScore: number;
  divScore: number;
  incomePct: number;
  incomeChf: number;
  plPct: number;
  sectors: { name: string; pct: number; color: string }[];
  alerts: Alert[];
}

const SECTOR_COLORS = ["#2f8f68", "#5fa8d3", "#e8a33d", "#1d5344", "#cf4f3c", "#9adcb4", "#5e7a70", "#c07c15"];

export function analyze(d: Desk): Analysis {
  const values = d.holdings.map((h) => h.qty * holdingPrice(d.market, h.isin));
  const invested = values.reduce((s, v) => s + v, 0);
  const cost = d.holdings.reduce((s, h) => s + h.qty * h.avgPrice, 0);
  const total = invested + d.cash;
  const cashPct = total ? (d.cash / total) * 100 : 0;
  const plPct = cost ? ((invested - cost) / cost) * 100 : 0;

  const riskScore = invested
    ? d.holdings.reduce((s, h, i) => s + h.risk * values[i], 0) / invested
    : 3;

  const incomeChf = d.holdings.reduce((s, h) => s + ((h.couponPct ?? 0) / 100) * h.qty * 1000, 0);
  const incomePct = invested ? (incomeChf / invested) * 100 : 0;

  // underlying exposure: tracker → basket weights; BRC → SMI bucket
  const exp: Record<string, number> = {};
  d.holdings.forEach((h, i) => {
    if (h.isin === PRODUCT.isin) {
      for (const u of UNDERLYINGS) exp[u.sector] = (exp[u.sector] ?? 0) + (u.weight / 100) * values[i];
    } else {
      exp["SMI® Index"] = (exp["SMI® Index"] ?? 0) + values[i];
    }
  });
  exp["Cash (CHF)"] = d.cash;

  const sectors = Object.entries(exp)
    .map(([name, v], i) => ({ name, pct: total ? (v / total) * 100 : 0, color: SECTOR_COLORS[i % SECTOR_COLORS.length] }))
    .sort((a, b) => b.pct - a.pct);

  const nonCash = sectors.filter((s) => s.name !== "Cash (CHF)");
  const fr = nonCash.map((s) => s.pct / 100);
  const hhi = fr.reduce((s, f) => s + f * f, 0) || 1;
  const effN = 1 / hhi;
  const divScore = Math.round(Math.min(100, (effN / 5) * 100));

  const alerts: Alert[] = [];
  if (cashPct > 40)
    alerts.push({
      tone: "warn",
      title: `Cash drag — ${chf(d.cash)} idle`,
      body: `${num(cashPct, 1)}% of the book sits uninvested at 0% participation. Deploying part of it into the open subscription (CH1571730808) would raise basket exposure without adding leverage.`,
      action: { label: "Open subscription", kind: "subscribe" },
    });
  if (!d.subscribed)
    alerts.push({
      tone: "info",
      title: "Participation gap",
      body: `The book has yield (BRC) but no pure growth engine. The Swiss Quality Dividend Tracker offers 100% upside participation across 8 quality names — subscription closes ${fmtDate(DATES.subClose)}.`,
      action: { label: "Review the tracker", kind: "subscribe" },
    });
  const fin = sectors.find((s) => s.name === "Financials");
  if (fin && fin.pct > 28)
    alerts.push({
      tone: "info",
      title: `Financials at ${num(fin.pct, 1)}% of invested exposure`,
      body: "UBS, Zurich and Swiss Re stack up through the basket on top of the SMI collateral. Comfortable for a quality tilt, but watch rate-cycle correlation.",
      action: { label: "Discuss with VEGA", kind: "chat", prompt: "How concentrated is my Financials exposure?" },
    });
  alerts.push({
    tone: "ok",
    title: "Barrier monitoring — all clear",
    body: `SMI® BRC barrier (65%) is 27.4% away from spot. Next observation window opens in ${daysUntil(DATES.observation)} days. No action required.`,
  });
  if (incomeChf > 0)
    alerts.push({
      tone: "ok",
      title: `Income engine: ${chf(incomeChf)} p.a.`,
      body: `The BRC pays 8.9% p.a. semi-annually — a ${num(incomePct, 1)}% running yield on invested capital, independent of the basket's path.`,
    });

  return { total, invested, cashPct, riskScore, divScore, incomePct, incomeChf, plPct, sectors, alerts };
}

/* ----------------------------- advisor chat ----------------------------- */

export function advisorGreeting(d: Desk): string {
  const a = analyze(d);
  return (
    `Good day. I'm VEGA, your structured-products analyst. I've read your book: ${chf(a.total)} total, ` +
    `${num(a.cashPct, 1)}% cash, ${d.holdings.length} position${d.holdings.length === 1 ? "" : "s"}, risk level ${num(a.riskScore, 1)}/7. ` +
    (a.cashPct > 40
      ? `My first observation: a large cash sleeve is earning nothing — the open tracker subscription is the cleanest way to put part of it to work.`
      : `Your book is reasonably deployed. Ask me anything about risk, income, barriers or diversification.`)
  );
}

export function advisorReply(input: string, d: Desk): string {
  const q = input.toLowerCase();
  const a = analyze(d);
  const hasTracker = d.subscribed;

  if (/(risk|how risky|volat)/.test(q))
    return (
      `Your portfolio sits at ${num(a.riskScore, 1)}/7 — ${a.riskScore < 4 ? "moderate" : "balanced-to-growth"}. ` +
      `The SMI® BRC carries a 4/7 (short-put profile with a comfortable 27.4% barrier buffer) and ${
        hasTracker ? `the tracker a 5/7 (full equity beta, no protection)` : `the tracker you're watching a 5/7 (full equity beta, no protection)`
      }. ` +
      `With ${num(a.cashPct, 1)}% in cash your *effective* risk is diluted — adding CHF 20'000 of tracker would move the book to roughly ${num(
        Math.min(7, a.riskScore + 0.4),
        1
      )}/7. Still inside a typical "balanced" mandate.`
    );
  if (/(income|coupon|yield|dividend)/.test(q))
    return (
      `Current income: ${chf(a.incomeChf)} p.a. (${num(a.incomePct, 1)}% on invested capital), all from the BRC's 8.9% coupon. ` +
      `The dividend basket behind the tracker yields ~3.1% blended, but that return is *inside* the certificate price, not paid out. ` +
      `If payout income is the goal, keep the BRC as the engine; if total return, the tracker compounds the dividends automatically.`
    );
  if (/(barrier|knock|protection)/.test(q))
    return (
      `Only the SMI® BRC has a barrier: 65% of the initial SMI level, continuously observed. Spot is ~27.4% above it — historically a wide buffer. ` +
      `If it were ever touched, the coupon continues but you'd participate 1:1 in SMI losses below the strike at maturity. ` +
      `The tracker has no barrier by design — it simply mirrors the basket, which is why its risk label is one notch higher.`
    );
  if (/(diversif|concentrat|sector|exposure|allocat)/.test(q)) {
    const top = a.sectors.filter((s) => s.name !== "Cash (CHF)")[0];
    return (
      `Exposure map: ${a.sectors.map((s) => `${s.name} ${num(s.pct, 1)}%`).join(" · ")}. ` +
      `Diversification score ${a.divScore}/100. Largest single bet is ${top?.name} at ${num(top?.pct ?? 0, 1)}% — ` +
      `${(top?.pct ?? 0) > 30 ? "meaningful, worth a conscious decision" : "within comfort"}. ` +
      `Note the tracker would *increase* healthcare and financials weight through its basket; if that concerns you, size the subscription smaller.`
    );
  }
  if (/(cash|invest|deploy|buy|subscri|tracker)/.test(q))
    return (
      `You hold ${chf(d.cash)} in cash (${num(a.cashPct, 1)}%). A pragmatic split: subscribe CHF 15'000–25'000 into CH1571730808 at the ${chf(
        1000
      )} issue price, keep 6–12 months of liquidity aside, and let the rest work in the next issuance window. ` +
      `The subscription is binding at 100% — no secondary-market spread until listing, and the 1% issue commission is already embedded. ` +
      `Want me to flag this to Lena in the desk thread? She can pre-allocate volume.`
    );
  if (/(analys|overview|summary|my portfolio|perform|doing|return|p&l|pl\b|how am i)/.test(q))
    return (
      `Book performance: ${a.plPct >= 0 ? "+" : ""}${num(a.plPct, 2)}% on invested capital, plus ${chf(a.incomeChf)} p.a. in coupons. ` +
      `The basket behind the tracker trades at ${num(d.market.index, 2)} (${(
        ((d.market.index / d.market.indexOpen - 1) * 100)
      ) >= 0 ? "+" : ""}${num((d.market.index / d.market.indexOpen - 1) * 100, 2)}% intraday). ` +
      `Nothing in the book is near a stress level — the live monitor on the Portfolio tab shows this tick-by-tick.`
    );
  if (/(hello|hi\b|hey|good)/.test(q))
    return `Hello. Book state is loaded and current. Ask me about risk, income, barriers, diversification — or say "analyse my portfolio" for the full read.`;
  return (
    `I can put a number on that if we narrow it down. Try: "How risky is my book?", "Where is my income coming from?", "What happens at the barrier?", ` +
    `"How concentrated is my Financials exposure?" — or "Should I subscribe to the tracker?"`
  );
}

/* ------------------------------- PM replies ------------------------------- */

export function pmReply(input: string, subscribed: boolean): string {
  const q = input.toLowerCase();
  if (/(fee|cost|commission|price)/.test(q))
    return "Good question. The issue price of 100% already includes the 1.00% issue commission — there are no entry fees on top. Embedded ongoing costs are 0.75% p.a. inside the basket mechanics, and our average secondary-market spread is 0.80% once it lists. The KID in the Documents tab breaks all of this down.";
  if (/(barrier|protect|risk)/.test(q))
    return "This tracker has no barrier and no cap — it mirrors the basket 1:1, so you should size it as pure equity exposure. If you want defined risk, our next BRC issuance window opens next month and I can reserve allocation for you.";
  if (/(sell|secondary|liquid|exit)/.test(q))
    return "Liquidity is daily: we quote bid/ask from first trading day, SIX lists the certificate, and settlement is T+2. Typical spread is around 0.80%. Before listing, subscriptions can be cancelled free of charge up to the subscription deadline.";
  if (/(matur|long|when)/.test(q))
    return `Final maturity is ${fmtDate(DATES.maturity)}. Because it's a tracker there is no autocall — you simply hold the basket's total return. Most clients use it as a 2–3 year equity sleeve.`;
  if (/(reserv|allocat|subscri|how.*buy|order|invest)/.test(q))
    return subscribed
      ? "Your order is in — confirmed and settled against your depot. You'll see the position live in the Portfolio tab, and coupon/dividend events will appear in your activity ledger as they occur."
      : "It takes one minute: open the Subscribe panel on the right, choose the number of certificates (CHF 1'000 each), confirm the KID acknowledgement, and the order is binding at 100%. I'm credited on your file, so call out if you want volume pre-allocated.";
  if (/(hello|hi\b|hey|thanks|thank)/.test(q))
    return "Always happy to help. I'm at the desk 08:00–18:00 CET — anything on the term sheet you'd like me to walk through?";
  return "Noted — let me check that with the structuring desk and come back to you with the exact figure. Meanwhile, the full terms are in the Details tab and the KID under Documents. Anything on pricing, liquidity or the basket I can answer right away?";
}
