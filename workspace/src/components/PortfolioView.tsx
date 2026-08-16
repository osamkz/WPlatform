import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PRODUCT, DATES, chf, num, pct, fmtDate, fmtTime, int, daysUntil, type Holding, type Activity } from "../data";
import { holdingPrice, genSeries, type Market } from "../market";
import { analyze } from "../ai";
import { Reveal, Flash, AreaChart, Donut, Badge } from "./ui";
import { IPulse, ICoins, IChart, IWallet } from "./icons";

interface Props {
  holdings: Holding[];
  cash: number;
  activity: Activity[];
  market: Market;
}

const RANGES = [{ label: "1M", days: 22 }, { label: "3M", days: 66 }, { label: "6M", days: 132 }, { label: "ALL", days: 260 }] as const;

export default function PortfolioView({ holdings, cash, activity, market }: Props) {
  const [range, setRange] = useState<(typeof RANGES)[number]["label"]>("3M");

  const rows = holdings.map((h) => {
    const price = holdingPrice(market, h.isin);
    const value = h.qty * price;
    const cost = h.qty * h.avgPrice;
    return { h, price, value, cost, pl: value - cost, plPct: cost ? ((value - cost) / cost) * 100 : 0 };
  });
  const invested = rows.reduce((s, r) => s + r.value, 0);
  const cost = rows.reduce((s, r) => s + r.cost, 0);
  const total = invested + cash;
  const pl = invested - cost;
  const plPct = cost ? (pl / cost) * 100 : 0;
  const a = analyze({ holdings, cash, market, subscribed: holdings.some((h) => h.isin === PRODUCT.isin) });

  const series = useMemo(
    () => genSeries(RANGES.find((r) => r.label === range)!.days, total * 0.932, total, 0.42, 21 + range.length),
    [range, Math.round(total / 50)]
  );

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      {/* header band */}
      <Reveal>
        <div className="relative bg-pine2 text-paper overflow-hidden">
          <div className="absolute inset-0 grid-dark" />
          <div className="absolute inset-0 vignette-dark" />
          <div className="relative p-6 lg:p-8 grid lg:grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-[0.16em] text-mint/60 font-semibold">Portfolio monitor</span>
                <span className="flex items-center gap-1.5 text-[11px] text-mint/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint live-dot" /> live valuation
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3">
                <div>
                  <div className="text-[11px] text-paper/55 uppercase tracking-[0.12em]">Total assets</div>
                  <Flash value={total}>
                    <span className="num text-[clamp(1.9rem,3.4vw,2.7rem)] leading-none font-semibold">{chf(total)}</span>
                  </Flash>
                </div>
                <div>
                  <div className="text-[11px] text-paper/55 uppercase tracking-[0.12em]">Unrealised P&L</div>
                  <div className={`num text-[20px] leading-tight ${pl >= 0 ? "text-mint" : "text-rust"}`}>
                    {pl >= 0 ? "+" : ""}{num(pl, 2)} <span className="text-[13px]">({pct(plPct)})</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-paper/55 uppercase tracking-[0.12em]">Income p.a.</div>
                  <div className="num text-[20px] leading-tight text-amber">{chf(a.incomeChf)}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-[12.5px]">
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.13em] text-mint/55">Invested</div>
                <div className="num text-paper mt-1">{chf(invested)}</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.13em] text-mint/55">Cash</div>
                <div className="num text-paper mt-1">{chf(cash)}</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.13em] text-mint/55">Risk</div>
                <div className="num text-paper mt-1">{num(a.riskScore, 1)} / 7</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* performance + allocation */}
      <div className="mt-8 grid lg:grid-cols-12 gap-6">
        <Reveal className="lg:col-span-8">
          <div className="bg-card border border-line p-5 h-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <IChart size={17} className="text-moss" />
                <h2 className="font-display font-semibold text-[16px] tracking-tight">Total assets · performance</h2>
              </div>
              <div className="flex border border-line">
                {RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRange(r.label)}
                    className={`px-3 py-1.5 text-[11.5px] num font-semibold transition-colors ${
                      range === r.label ? "bg-pine2 text-paper" : "text-dim hover:text-ink"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 text-ink">
              <AreaChart
                data={series}
                stroke={total >= series[0] ? "var(--color-fern)" : "var(--color-rust)"}
                labelMin={chf(Math.min(...series) * 0.999).replace("CHF ", "")}
                labelMax={chf(Math.max(...series) * 1.001).replace("CHF ", "")}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11.5px] text-dim num">
              <span>period start {chf(series[0])}</span>
              <span className={total >= series[0] ? "text-fern" : "text-rust"}>
                {pct((total / series[0] - 1) * 100)} over {range === "ALL" ? "12M" : range}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-4">
          <div className="bg-card border border-line p-5 h-full">
            <div className="flex items-center gap-2.5">
              <ILayersLocal />
              <h2 className="font-display font-semibold text-[16px] tracking-tight">Exposure by sleeve</h2>
            </div>
            <div className="mt-4 flex items-center gap-5">
              <Donut segments={a.sectors.map((s) => ({ value: s.pct, color: s.color }))} size={150} thickness={19}>
                <span className="num text-[11px] text-dim">{a.sectors.length}</span>
                <span className="font-display font-semibold text-[13px] -mt-0.5">sleeves</span>
              </Donut>
              <ul className="flex-1 space-y-1.5 min-w-0">
                {a.sectors.slice(0, 6).map((s) => (
                  <li key={s.name} className="flex items-center gap-2 text-[11.5px]">
                    <span className="w-2 h-2 shrink-0" style={{ background: s.color }} />
                    <span className="truncate text-dim">{s.name}</span>
                    <span className="num ml-auto">{num(s.pct, 1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[12px]">
              <span className="text-dim">Diversification score</span>
              <span className="num font-semibold">{a.divScore} / 100</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-fog overflow-hidden">
              <motion.div
                className="h-full bg-fern"
                initial={{ width: 0 }}
                whileInView={{ width: `${a.divScore}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </div>
          </div>
        </Reveal>
      </div>

      {/* holdings */}
      <Reveal>
        <div className="mt-8">
          <div className="flex items-center gap-2.5">
            <IWallet size={17} className="text-moss" />
            <h2 className="font-display font-semibold text-[17px] tracking-tight">Positions</h2>
            <span className="num text-[12px] text-dim">· {int(holdings.length)} held</span>
          </div>
          <div className="mt-4 overflow-x-auto bg-card border border-line">
            <table className="w-full text-[13px] min-w-[860px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-[0.12em] text-dim border-b border-line bg-fog/60">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-3 font-semibold text-right">Qty</th>
                  <th className="py-3 px-3 font-semibold text-right">Avg price</th>
                  <th className="py-3 px-3 font-semibold text-right">Last</th>
                  <th className="py-3 px-3 font-semibold text-right">Market value</th>
                  <th className="py-3 px-3 font-semibold text-right">P&L</th>
                  <th className="py-3 px-3 font-semibold text-right">Weight</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ h, price, value, pl: p, plPct: pp }) => (
                  <tr key={h.id} className="border-b border-line/70 last:border-0 hover:bg-fog/60 transition-colors align-top">
                    <td className="py-4 px-4">
                      <div className="font-display font-semibold text-[13.5px] leading-snug">{h.name}</div>
                      <div className="num text-[11px] text-dim mt-0.5">{h.isin} · {h.type}</div>
                      {h.barrierInfo && <div className="text-[11px] text-dim mt-0.5">{h.barrierInfo}</div>}
                    </td>
                    <td className="py-4 px-3 text-right num">{int(h.qty)}</td>
                    <td className="py-4 px-3 text-right num text-dim">{num(h.avgPrice, 2)}</td>
                    <td className="py-4 px-3 text-right">
                      <Flash value={price}><span className="num font-medium">{num(price, 2)}</span></Flash>
                    </td>
                    <td className="py-4 px-3 text-right num font-medium">{chf(value)}</td>
                    <td className={`py-4 px-3 text-right num ${p >= 0 ? "text-fern" : "text-rust"}`}>
                      {p >= 0 ? "+" : ""}{num(p, 2)}
                      <span className="block text-[11px] opacity-80">{pct(pp)}</span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <span className="w-16 h-1.5 bg-fog overflow-hidden">
                          <span className="block h-full bg-moss" style={{ width: `${(value / total) * 100}%` }} />
                        </span>
                        <span className="num text-[11.5px] w-11 text-right">{num((value / total) * 100, 1)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge tone={h.risk >= 5 ? "warn" : "ok"}>Risk {h.risk}/7</Badge>
                      <div className="text-[11px] text-dim mt-1.5">Maturity {fmtDate(h.maturity)}</div>
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-fog/60 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-display font-semibold text-[13.5px]">Cash — CHF current account</div>
                    <div className="num text-[11px] text-dim mt-0.5">Säntis Custody AG · available for subscription</div>
                  </td>
                  <td colSpan={3} />
                  <td className="py-4 px-3 text-right num font-medium">{chf(cash)}</td>
                  <td className="py-4 px-3 text-right num text-dim">0.00</td>
                  <td className="py-4 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="w-16 h-1.5 bg-fog overflow-hidden">
                        <span className="block h-full bg-sky" style={{ width: `${(cash / total) * 100}%` }} />
                      </span>
                      <span className="num text-[11.5px] w-11 text-right">{num((cash / total) * 100, 1)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4"><Badge tone="info">Liquid</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* activity */}
      <Reveal>
        <div className="mt-8 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-card border border-line">
            <div className="flex items-center gap-2.5 px-5 pt-5">
              <IPulse size={17} className="text-moss" />
              <h2 className="font-display font-semibold text-[16px] tracking-tight">Activity ledger</h2>
            </div>
            <ul className="mt-3 divide-y divide-line/80">
              {[...activity].sort((x, y) => y.date.getTime() - x.date.getTime()).map((ev) => (
                <li key={ev.id} className="flex items-center gap-4 px-5 py-3 hover:bg-fog/60 transition-colors">
                  <span
                    className={`w-8 h-8 shrink-0 grid place-items-center border ${
                      ev.kind === "coupon" ? "border-fern/35 text-fern bg-fern/8" : ev.kind === "buy" ? "border-amber/40 text-amber2 bg-amber/10" : "border-sky/35 text-sky bg-sky/8"
                    }`}
                  >
                    {ev.kind === "coupon" ? <ICoins size={15} /> : ev.kind === "buy" ? <IWallet size={15} /> : <IPulse size={15} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{ev.label}</div>
                    <div className="num text-[11px] text-dim">{fmtDate(ev.date)} · {fmtTime(ev.date)}</div>
                  </div>
                  <span className={`num text-[13px] ${ev.amount > 0 ? "text-fern" : ev.amount < 0 ? "text-ink" : "text-dim"}`}>
                    {ev.amount === 0 ? "—" : `${ev.amount > 0 ? "+" : ""}${num(ev.amount, 2)}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-line p-5">
              <h3 className="font-display font-semibold text-[15px] tracking-tight">Watchlist signals</h3>
              <ul className="mt-3 space-y-3">
                {[
                  { tone: "ok", text: `SMI® BRC barrier buffer ${num(27.4, 1)}% — no knock-in risk in current regime.` },
                  { tone: "info", text: `Basket at ${num(market.index, 2)} — ${pct(market.index - 100, 1)} above tracker reference.` },
                  { tone: "warn", text: `Subscription window closes in ${daysUntil(DATES.subClose)} days — primary market pricing ends then.` },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-[12.5px] leading-relaxed">
                    <Badge tone={s.tone} className="h-fit shrink-0 mt-0.5">{s.tone}</Badge>
                    <span className="text-ink2">{s.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-pine2 text-paper p-5 relative overflow-hidden">
              <div className="absolute inset-0 grid-dark opacity-60" />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-[0.14em] text-mint/60 font-semibold">Next coupon</div>
                <div className="mt-2 num text-[22px] font-semibold text-amber">+ {chf(1112.5)}</div>
                <div className="text-[12px] text-paper/60 mt-1">SMI® BRC · coupon 3/4 — payable in 96 days</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function ILayersLocal() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-moss)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 13 9 5 9-5" opacity=".55" />
    </svg>
  );
}
