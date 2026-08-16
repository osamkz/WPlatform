import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PRODUCT, DATES, TERMS, SCENARIOS, DOCUMENTS, UNDERLYINGS,
  chf, num, pct, fmtDate, daysUntil, int, type Toast,
} from "../data";
import type { Market } from "../market";
import { Reveal, Badge, Flash, Sparkline, AreaChart, Gauge } from "./ui";
import { IDoc, IDownload, IClock, IArrow, ICheck, IShield, IChat, ILock } from "./icons";

type Tab = "overview" | "details" | "underlyings" | "documents";

interface Props {
  market: Market;
  subscribed: boolean;
  heldQty: number;
  onSubscribe: () => void;
  onAskManager: () => void;
  notify: (t: Omit<Toast, "id">) => void;
}

export default function ProductView({ market, subscribed, heldQty, onSubscribe, onAskManager, notify }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const dayChg = (market.index / market.indexOpen - 1) * 100;
  const refChg = market.index - 100;
  const bid = market.certValue * 0.996;
  const ask = market.certValue * 1.004;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "details", label: "Details" },
    { id: "underlyings", label: "Underlyings" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div>
      {/* ============================ MASTHEAD ============================ */}
      <section className="relative bg-pine2 text-paper overflow-hidden">
        <div className="absolute inset-0 grid-dark" />
        <div className="absolute inset-0 vignette-dark" />
        <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent to-transparent pointer-events-none overflow-hidden">
          <div className="scanline absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-mint/6 via-mint/2 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-10 pb-8">
          <div className="grid lg:grid-cols-[1fr_370px] gap-10">
            {/* left — identity */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge tone="warn" className="!border-amber/50 !text-amber !bg-amber/10">{PRODUCT.type}</Badge>
                <Badge tone="ok" className="!border-mint/40 !text-mint !bg-mint/10">{PRODUCT.category}</Badge>
                <Badge tone="dim" className="!border-mint/20 !text-mint/70 !bg-mint/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint live-dot" /> Live · {PRODUCT.listing}
                </Badge>
              </div>

              <h1 className="font-display font-700 mt-5 text-[clamp(1.7rem,3.6vw,3.1rem)] leading-[1.04] tracking-tight max-w-3xl font-bold">
                Tracker Certificate on the<br className="hidden md:block" />
                <span className="text-mint"> Swiss Quality Dividend Basket</span>
              </h1>

              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[13px]">
                {[
                  ["ISIN", PRODUCT.isin],
                  ["Valor", PRODUCT.valor],
                  ["Symbol", PRODUCT.symbol],
                  ["Issuer", "Säntis Capital (Guernsey) Ltd"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-2">
                    <span className="uppercase tracking-[0.12em] text-[10.5px] text-mint/55 font-semibold">{k}</span>
                    <span className="num text-paper/90">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border-t border-mint/15">
                {[
                  { k: "Subscription closes", v: `${daysUntil(DATES.subClose)}d`, sub: fmtDate(DATES.subClose) },
                  { k: "Final maturity", v: fmtDate(DATES.maturity).replace(" 20", " '").replace(" 2", " '"), sub: "≈ 2.5 years" },
                  { k: "Participation", v: "100%", sub: "up & down, no cap" },
                  { k: "Barrier / coupon", v: "None", sub: "pure total return" },
                  { k: "Issue price", v: chf(1000), sub: "100% of nominal" },
                  { k: "Rating", v: "A / A2", sub: "S&P · Moody's" },
                ].map((c, i) => (
                  <div key={c.k} className={`py-4 pr-4 ${i > 0 ? "md:border-l md:border-mint/12 md:pl-5" : ""} ${i >= 3 ? "border-t md:border-t-0 border-mint/12" : ""} ${i % 2 === 1 ? "border-l border-mint/12 pl-5 md:pl-5" : ""}`}>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-mint/55 font-semibold">{c.k}</div>
                    <div className="num text-lg text-paper mt-1">{c.v}</div>
                    <div className="text-[11px] text-paper/50 mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* right — live price panel */}
            <div className="relative">
              <div className="border border-mint/20 bg-pine/60 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-mint/60 font-semibold">Indicative value</span>
                  <span className="num text-[11px] text-paper/50">ref 100.00</span>
                </div>
                <div className="mt-2 flex items-end gap-3">
                  <Flash value={market.certValue} className="font-display">
                    <span className="num text-[44px] leading-none font-semibold text-paper">{num(market.certValue, 2)}</span>
                  </Flash>
                  <span className="text-paper/50 text-sm mb-1.5">CHF</span>
                </div>
                <div className={`mt-1.5 flex items-center gap-3 num text-sm ${dayChg >= 0 ? "text-mint" : "text-rust"}`}>
                  <span>{pct(dayChg)} today</span>
                  <span className="text-paper/40">·</span>
                  <span className={refChg >= 0 ? "text-mint" : "text-rust"}>{pct(refChg)} since ref.</span>
                </div>
                <div className="mt-4 -mx-1">
                  <Sparkline data={[...market.intraday, market.index]} w={318} h={56} stroke={dayChg >= 0 ? "var(--color-mint)" : "var(--color-rust)"} fill />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-px bg-mint/12 border border-mint/12">
                  <div className="bg-pine2 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-mint/55">Bid</div>
                    <div className="num text-paper text-[15px] mt-0.5">{num(bid, 2)}</div>
                  </div>
                  <div className="bg-pine2 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-mint/55">Ask</div>
                    <div className="num text-paper text-[15px] mt-0.5">{num(ask, 2)}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-paper/50">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-mint live-dot" />SIX market open</span>
                  <span className="num">spread ≈ {PRODUCT.spreadPct.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ BODY ============================ */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 grid lg:grid-cols-12 gap-8 items-start">
        {/* ------------ left column ------------ */}
        <div className="lg:col-span-8 min-w-0">
          <div className="flex gap-6 border-b border-line overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative pb-3 text-[14px] font-semibold whitespace-nowrap transition-colors ${
                  tab === t.id ? "text-ink" : "text-dim hover:text-ink"
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.span layoutId="ptab" className="absolute inset-x-0 -bottom-px h-[2.5px] bg-amber" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
              className="pt-8"
            >
              {tab === "overview" && <OverviewTab market={market} />}
              {tab === "details" && <DetailsTab />}
              {tab === "underlyings" && <UnderlyingsTab market={market} />}
              {tab === "documents" && <DocumentsTab notify={notify} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ------------ right rail ------------ */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          {/* subscribe card */}
          <Reveal delay={0.05}>
            <div className="relative bg-pine2 text-paper overflow-hidden">
              <div className="absolute inset-0 grid-dark opacity-70" />
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold tracking-tight">Primary subscription</span>
                  <Badge tone="ok" className="!border-mint/40 !text-mint !bg-mint/10">Open</Badge>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="num text-[30px] font-semibold">{chf(1000)}</span>
                  <span className="text-paper/55 text-xs">per certificate</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[12.5px] text-amber">
                  <IClock size={14} />
                  <span className="num">Closes in {daysUntil(DATES.subClose)} days</span>
                  <span className="text-paper/45">· {fmtDate(DATES.subClose)}, 12:00 CET</span>
                </div>

                {subscribed ? (
                  <div className="mt-5">
                    <div className="border border-mint/30 bg-mint/8 p-3.5 flex items-center gap-3">
                      <span className="w-8 h-8 grid place-items-center bg-mint/15 text-mint"><ICheck size={16} /></span>
                      <div>
                        <div className="text-[13px] font-semibold">You hold {int(heldQty)} certificate{heldQty === 1 ? "" : "s"}</div>
                        <div className="num text-[12px] text-paper/60">{chf(heldQty * 1000)} invested · settled</div>
                      </div>
                    </div>
                    <button
                      onClick={onSubscribe}
                      className="mt-3 w-full py-3 text-[13.5px] font-semibold border border-mint/40 text-mint hover:bg-mint/10 transition-colors"
                    >
                      Add certificates
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onSubscribe}
                    className="mt-5 w-full py-3.5 bg-amber text-pine2 font-display font-semibold text-[15px] tracking-tight hover:bg-amber/85 active:translate-y-px transition-all flex items-center justify-center gap-2"
                  >
                    Subscribe now <IArrow size={15} />
                  </button>
                )}

                <div className="mt-4 space-y-1.5 text-[11.5px] text-paper/50">
                  <div className="flex justify-between"><span>Minimum investment</span><span className="num text-paper/75">{chf(1000)}</span></div>
                  <div className="flex justify-between"><span>Issue commission (embedded)</span><span className="num text-paper/75">1.00%</span></div>
                  <div className="flex justify-between"><span>Settlement</span><span className="text-paper/75">Cash · {fmtDate(DATES.issue)}</span></div>
                </div>
                <div className="mt-4 pt-3 border-t border-mint/12 flex items-center gap-1.5 text-[10.5px] text-paper/40">
                  <ILock size={12} /> Binding order · executed at 100% of nominal
                </div>
              </div>
            </div>
          </Reveal>

          {/* key facts */}
          <Reveal delay={0.1}>
            <div className="bg-card border border-line p-5">
              <div className="font-display font-semibold tracking-tight text-[15px]">Key facts</div>
              <dl className="mt-3 space-y-2.5">
                {[
                  ["Underlying", "8-name CHF quality basket"],
                  ["Participation", "100% · no cap · no barrier"],
                  ["Dividend yield (basket)", "≈ 3.1% p.a. (reinvested)"],
                  ["Currency", "CHF — no FX risk"],
                  ["Listing", "SIX Swiss Exchange"],
                  ["Denomination", "1 certificate = CHF 1'000"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 text-[12.5px]">
                    <dt className="text-dim">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          {/* issuer */}
          <Reveal delay={0.14}>
            <div className="bg-card border border-line p-5">
              <div className="flex items-center gap-2 font-display font-semibold tracking-tight text-[15px]">
                <IShield size={16} className="text-moss" /> Issuer & guarantor
              </div>
              <div className="mt-3 space-y-2.5 text-[12.5px]">
                <div className="flex justify-between gap-3"><span className="text-dim">Issuer</span><span className="text-right font-medium">{PRODUCT.issuer}</span></div>
                <div className="flex justify-between gap-3"><span className="text-dim">Guarantor</span><span className="text-right font-medium">{PRODUCT.guarantor}</span></div>
                <div className="flex justify-between gap-3"><span className="text-dim">Rating</span><span className="num">{PRODUCT.rating}</span></div>
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-dim">
                Certificates carry the credit risk of the guarantor. Investor protection applies up to CHF 100'000 under the Swiss deposit scheme only for cash balances, not securities.
              </p>
            </div>
          </Reveal>

          {/* ask the PM */}
          <Reveal delay={0.18}>
            <button
              onClick={onAskManager}
              className="w-full bg-moss text-paper p-5 text-left hover:bg-fern transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-11 h-11 grid place-items-center bg-paper/12 font-display font-semibold text-[15px] border border-paper/20">LB</span>
                <span className="flex-1">
                  <span className="block font-display font-semibold tracking-tight">Lena Brunner</span>
                  <span className="block text-[12px] text-paper/65">Head of Structured Products</span>
                </span>
                <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-amber group-hover:translate-x-0.5 transition-transform">
                  <IChat size={15} /> Ask her
                </span>
              </div>
            </button>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ================================ OVERVIEW ================================ */

function OverviewTab({ market }: { market: Market }) {
  const d90 = (market.index / market.daily[0] - 1) * 100;
  return (
    <div className="space-y-10">
      <Reveal>
        <p className="text-[15.5px] leading-relaxed text-ink2 max-w-2xl">
          This Certificate tracks the <strong>Säntis Swiss Quality Dividend Basket</strong> — eight large-cap Swiss companies selected
          for durable dividends, strong balance sheets and global earnings power. Investors receive the basket's
          <strong> total return 1:1</strong>: unlimited upside, full downside, dividends reinvested, no caps, barriers or autocalls.
          A single ISIN replaces eight single-stock positions.
        </p>
      </Reveal>

      {/* how it works — ledger */}
      <Reveal>
        <div>
          <SectionTitle n="01" title="How it works" />
          <div className="mt-4 border-t border-line">
            {[
              ["Subscribe at 100%", `Pay CHF 1'000 per certificate during the subscription window. No secondary spread, no entry fee on top — the 1% issue commission is embedded.`],
              ["The basket does the work", `Eight constituents, fixed weights, rebalanced annually. Dividends (~3.1% p.a.) are reinvested into the basket level, compounding inside the price.`],
              ["Maturity, 1:1", `At final observation you receive the basket's total performance in cash — or sell any time on SIX with ~0.80% spread.`],
            ].map(([t, b], i) => (
              <div key={t} className="grid md:grid-cols-[150px_1fr] gap-2 md:gap-6 py-4 border-b border-line group hover:bg-fog/70 transition-colors px-2 -mx-2">
                <div className="flex items-center gap-3">
                  <span className="num text-amber2 text-[13px] font-semibold">0{i + 1}</span>
                  <span className="font-display font-semibold text-[15px] tracking-tight">{t}</span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-dim">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* payoff */}
      <Reveal>
        <div>
          <SectionTitle n="02" title="Payoff at maturity" />
          <PayoffChart />
        </div>
      </Reveal>

      {/* performance */}
      <Reveal>
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionTitle n="03" title="Basket performance · 90 days" />
            <div className="flex gap-5 text-right">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-dim font-semibold">Intraday</div>
                <div className={`num text-[15px] font-medium ${market.index >= market.indexOpen ? "text-fern" : "text-rust"}`}>
                  {pct((market.index / market.indexOpen - 1) * 100)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-dim font-semibold">90 days</div>
                <div className="num text-[15px] font-medium text-fern">{pct(d90)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-dim font-semibold">Level</div>
                <Flash value={market.index}>
                  <span className="num text-[15px] font-medium">{num(market.index, 2)}</span>
                </Flash>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-card border border-line p-4 text-ink">
            <AreaChart data={market.daily} stroke="var(--color-fern)" labelMin={num(Math.min(...market.daily), 1)} labelMax={num(Math.max(...market.daily), 1)} />
          </div>
          <p className="mt-2 text-[11.5px] text-dim">Indicative basket level, reference = 100.00 at launch. Dashed line marks the reference level.</p>
        </div>
      </Reveal>

      {/* scenarios */}
      <Reveal>
        <div>
          <SectionTitle n="04" title="Illustrative scenarios at maturity" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[13px] min-w-[560px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-[0.12em] text-dim border-b border-line">
                  <th className="py-2.5 pr-4 font-semibold">Scenario</th>
                  <th className="py-2.5 pr-4 font-semibold">Basket</th>
                  <th className="py-2.5 pr-4 font-semibold text-right">Certificate value</th>
                  <th className="py-2.5 font-semibold">Comment</th>
                </tr>
              </thead>
              <tbody>
                {SCENARIOS.map((s) => {
                  const val = 1000 * (1 + s.move / 100) * 0.9925;
                  return (
                    <tr key={s.label} className="border-b border-line/70 hover:bg-fog/60 transition-colors">
                      <td className="py-3 pr-4 font-display font-semibold">{s.label}</td>
                      <td className={`num py-3 pr-4 ${s.move < 0 ? "text-rust" : s.move > 0 ? "text-fern" : "text-dim"}`}>{pct(s.move, 0)}</td>
                      <td className="num py-3 pr-4 text-right font-medium">{chf(val)}</td>
                      <td className="py-3 text-dim">{s.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11.5px] text-dim">Gross of embedded costs (0.75% p.a.) and secondary-market spreads. Not a guarantee of future performance.</p>
        </div>
      </Reveal>

      {/* risk & costs */}
      <Reveal>
        <div>
          <SectionTitle n="05" title="Risk & costs" />
          <div className="mt-4 grid md:grid-cols-2 gap-5">
            <div className="bg-card border border-line p-5">
              <Gauge value={PRODUCT.riskLevel} label="Risk indicator · SRI 1–7" />
              <p className="mt-3 text-[12px] leading-relaxed text-dim text-center">
                Class 5 of 7 — medium-high. Value moves 1:1 with the basket; capital is fully at risk.
              </p>
            </div>
            <div className="bg-card border border-line p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-dim font-semibold">Costs over the life of the product</div>
              <div className="mt-3 space-y-3">
                {[
                  ["Issue commission", "1.00%", "once, embedded in the issue price", 14],
                  ["Ongoing basket costs", "0.75% p.a.", "deducted from the basket level", 10],
                  ["Secondary spread (avg.)", "0.80%", "only if sold before maturity", 11],
                ].map(([k, v, d, w]) => (
                  <div key={k as string}>
                    <div className="flex justify-between text-[13px]">
                      <span>{k}</span>
                      <span className="num font-medium">{v}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-fog overflow-hidden">
                      <div className="h-full bg-amber transition-all duration-700" style={{ width: `${w}%` }} />
                    </div>
                    <div className="text-[11px] text-dim mt-1">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="num text-[12px] font-semibold text-amber2">{n}</span>
      <h2 className="font-display font-semibold text-[19px] tracking-tight">{title}</h2>
    </div>
  );
}

/* ================================ PAYOFF ================================ */

function PayoffChart() {
  const W = 640, H = 300, L = 56, R = 16, T = 18, B = 40;
  const xs = (v: number) => L + ((v + 50) / 100) * (W - L - R);
  const ys = (v: number) => T + (1 - (v - 700) / 600) * (H - T - B);
  const direct: [number, number][] = [[-50, 500], [50, 1500]];
  const tracker: [number, number][] = [[-50, 500 * 0.9925], [50, 1500 * 0.9925]];
  const toPath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${xs(x).toFixed(1)} ${ys(y).toFixed(1)}`).join(" ");
  return (
    <div className="mt-4 bg-card border border-line p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {[750, 1000, 1250].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={ys(v)} y2={ys(v)} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 5" />
            <text x={L - 8} y={ys(v) + 3.5} textAnchor="end" fontSize="10" className="num" fill="var(--color-dim)">{int(v)}</text>
          </g>
        ))}
        {[-50, -25, 0, 25, 50].map((v) => (
          <text key={v} x={xs(v)} y={H - 18} textAnchor="middle" fontSize="10" className="num" fill="var(--color-dim)">{v > 0 ? `+${v}%` : `${v}%`}</text>
        ))}
        <line x1={xs(0)} x2={xs(0)} y1={T} y2={H - B} stroke="currentColor" strokeOpacity="0.22" />
        <line x1={L} x2={W - R} y1={ys(1000)} y2={ys(1000)} stroke="var(--color-amber)" strokeOpacity="0.55" strokeDasharray="6 5" />
        <path d={toPath(direct)} stroke="var(--color-dim)" strokeWidth="1.6" strokeDasharray="5 5" fill="none" />
        <path d={toPath(tracker)} stroke="var(--color-fern)" strokeWidth="2.6" fill="none" className="draw-line" style={{ ["--dash" as string]: 900 }} />
        <circle cx={xs(0)} cy={ys(1000 * 0.9925)} r="4" fill="var(--color-fern)" />
        <text x={xs(34)} y={ys(1350)} fontSize="11" fill="var(--color-fern)" fontWeight="600">Certificate — 100% participation, no cap</text>
        <text x={xs(30)} y={ys(1470)} fontSize="11" fill="var(--color-dim)">Direct basket investment (gross)</text>
        <text x={xs(0) + 6} y={ys(1000) - 6} fontSize="10" className="num" fill="var(--color-amber2)">issue price CHF 1'000</text>
      </svg>
      <p className="text-[11.5px] text-dim">Linear payoff: the Certificate mirrors the basket gross of the embedded 0.75% p.a. costs (slight parallel offset vs. direct investment).</p>
    </div>
  );
}

/* ================================ DETAILS ================================ */

function DetailsTab() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="num text-[12px] font-semibold text-amber2">A–Z</span>
        <h2 className="font-display font-semibold text-[19px] tracking-tight">Full term sheet</h2>
      </div>
      <dl className="mt-5 grid md:grid-cols-2 gap-x-10">
        {TERMS.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[132px_1fr] gap-3 py-[9px] border-b border-line/80 text-[13px] items-baseline hover:bg-fog/70 transition-colors px-1">
            <dt className="text-dim">{k}</dt>
            <dd className="font-medium text-ink2">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[11.5px] text-dim max-w-xl">
        This summary is marketing information only. The legally binding terms are contained in the Prospectus and the Final Terms, available under Documents.
      </p>
    </div>
  );
}

/* ============================== UNDERLYINGS ============================== */

function UnderlyingsTab({ market }: { market: Market }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="num text-[12px] font-semibold text-amber2">08</span>
          <h2 className="font-display font-semibold text-[19px] tracking-tight">Basket constituents</h2>
        </div>
        <span className="text-[12px] text-dim">Fixed weights · annual rebalance · dividends reinvested</span>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-[13px] min-w-[680px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.12em] text-dim border-b border-line">
              <th className="py-2.5 pr-3 font-semibold">Company</th>
              <th className="py-2.5 pr-3 font-semibold">Sector</th>
              <th className="py-2.5 pr-3 font-semibold text-right">Weight</th>
              <th className="py-2.5 pr-3 font-semibold text-right">Last (CHF)</th>
              <th className="py-2.5 pr-3 font-semibold text-right">Day</th>
              <th className="py-2.5 pr-3 font-semibold text-right">Since ref.</th>
              <th className="py-2.5 font-semibold text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {UNDERLYINGS.map((u) => {
              const p = market.quotes[u.id];
              const day = (p / market.dayOpen[u.id] - 1) * 100;
              const vsRef = (p / u.ref - 1) * 100;
              return (
                <tr key={u.id} className="border-b border-line/70 hover:bg-fog/70 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="font-display font-semibold text-[13.5px]">{u.name}</div>
                    <div className="num text-[11px] text-dim">{u.ticker} · div. yield {num(u.divYield, 1)}%</div>
                  </td>
                  <td className="py-3 pr-3 text-dim">{u.sector}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="w-14 h-1.5 bg-fog overflow-hidden"><span className="block h-full bg-moss" style={{ width: `${u.weight * 5}%` }} /></span>
                      <span className="num w-8 text-right">{u.weight}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <Flash value={p}><span className="num font-medium">{num(p, 2)}</span></Flash>
                  </td>
                  <td className={`py-3 pr-3 text-right num ${day >= 0 ? "text-fern" : "text-rust"}`}>{pct(day)}</td>
                  <td className={`py-3 pr-3 text-right num ${vsRef >= 0 ? "text-fern" : "text-rust"}`}>{pct(vsRef)}</td>
                  <td className="py-3 pl-2 flex justify-end">
                    <Sparkline data={market.sparks[u.id]} w={72} h={24} stroke={day >= 0 ? "var(--color-fern)" : "var(--color-rust)"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="text-[12.5px]">
              <td className="py-3 font-display font-semibold" colSpan={2}>Basket total</td>
              <td className="num py-3 text-right">100%</td>
              <td className="num py-3 text-right text-dim" colSpan={2}>Blended yield ≈ 3.1%</td>
              <td className="py-3 text-right" colSpan={2}>
                <Badge tone="ok">CHF-denominated</Badge>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* =============================== DOCUMENTS =============================== */

function DocumentsTab({ notify }: { notify: Props["notify"] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const download = (name: string) => {
    setBusy(name);
    notify({ tone: "info", title: "Preparing secure download", body: name });
    setTimeout(() => {
      setBusy(null);
      notify({ tone: "ok", title: "Download started", body: `${name} — delivered to your secure inbox.` });
    }, 1100);
  };
  return (
    <div>
      <div className="flex items-center gap-3">
        <IDoc size={18} className="text-amber2" />
        <h2 className="font-display font-semibold text-[19px] tracking-tight">Documentation</h2>
      </div>
      <div className="mt-5 divide-y divide-line border-y border-line">
        {DOCUMENTS.map((d) => (
          <div key={d.name} className="flex items-center gap-4 py-4 group hover:bg-fog/70 transition-colors px-1">
            <span className={`w-10 h-10 grid place-items-center border text-[10px] num font-semibold ${d.kind === "PDF" ? "border-rust/40 text-rust bg-rust/8" : "border-fern/40 text-fern bg-fern/8"}`}>
              {d.kind}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13.5px] truncate">{d.name}</div>
              <div className="num text-[11px] text-dim">{d.size} · {fmtDate(d.date)}</div>
            </div>
            <Badge tone={d.tag === "Legal" ? "dim" : d.tag === "PRIIPs" ? "info" : "ok"}>{d.tag}</Badge>
            <button
              onClick={() => download(d.name)}
              disabled={busy === d.name}
              className="flex items-center gap-2 border border-line px-3.5 py-2 text-[12.5px] font-semibold hover:border-moss hover:text-moss transition-colors disabled:opacity-50"
            >
              <IDownload size={14} className={busy === d.name ? "animate-bounce" : ""} />
              {busy === d.name ? "Preparing…" : "Download"}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11.5px] text-dim max-w-xl">
        The Key Information Document (KID) must be acknowledged before subscription. Documents are provided in English and German.
      </p>
    </div>
  );
}
