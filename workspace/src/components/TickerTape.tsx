import { UNDERLYINGS, num } from "../data";
import type { Market } from "../market";

export default function TickerTape({ market }: { market: Market }) {
  const items = [
    {
      label: "SÄNTIS QUALITY BASKET",
      value: num(market.index, 2),
      chg: ((market.index / market.indexOpen - 1) * 100),
    },
    ...UNDERLYINGS.map((u) => ({
      label: u.ticker,
      value: num(market.quotes[u.id], 2),
      chg: (market.quotes[u.id] / market.dayOpen[u.id] - 1) * 100,
    })),
    { label: "SMI® (BRC COLLATERAL)", value: num(12_240 + market.brcPrice, 0), chg: (market.brcPrice / 1004.6 - 1) * 100 },
  ];
  const row = (key: string) => (
    <div key={key} className="flex items-center shrink-0">
      {items.map((it, i) => {
        const up = it.chg >= 0;
        return (
          <div key={`${key}-${i}`} className="flex items-center gap-2.5 px-5 py-1.5 border-r border-mint/10 whitespace-nowrap">
            <span className="text-[11px] font-semibold tracking-[0.1em] text-mint/70">{it.label}</span>
            <span className="num text-[12px] text-paper">{it.value}</span>
            <span className={`num text-[11px] ${up ? "text-mint" : "text-rust"} flex items-center gap-0.5`}>
              <svg width="7" height="7" viewBox="0 0 8 8" className={up ? "" : "rotate-180"}>
                <path d="M4 1 7.5 7h-7Z" fill="currentColor" />
              </svg>
              {up ? "+" : ""}
              {num(it.chg, 2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
  return (
    <div className="bg-pine2 border-y border-mint/15 overflow-hidden relative">
      <div className="flex ticker-track w-max">{row("a")}{row("b")}</div>
    </div>
  );
}
