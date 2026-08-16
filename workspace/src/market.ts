import { useEffect, useMemo, useRef, useState } from "react";
import { UNDERLYINGS, PRODUCT } from "./data";

/* deterministic PRNG so seeded history is stable between renders */
export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** seeded random walk pinned to start/end */
export function genSeries(n: number, start: number, end: number, vol: number, seed: number) {
  const rnd = mulberry(seed);
  const out: number[] = [start];
  let v = start;
  for (let i = 1; i < n - 1; i++) {
    const drift = (end - start) / n;
    v = v + drift + (rnd() - 0.5) * vol * v * 0.01;
    out.push(v);
  }
  out.push(end);
  return out;
}

const initialQuotes = Object.fromEntries(UNDERLYINGS.map((u) => [u.id, u.price]));
const dayOpenQuotes = Object.fromEntries(
  UNDERLYINGS.map((u, i) => [u.id, u.price * (1 - (0.002 + 0.0012 * (i % 4)))])
);

export function basketIndex(quotes: Record<string, number>) {
  let s = 0;
  for (const u of UNDERLYINGS) s += (u.weight / 100) * (quotes[u.id] / u.ref);
  return s * 100; // 100 = at reference levels
}

export interface Market {
  quotes: Record<string, number>;
  sparks: Record<string, number[]>;
  dayOpen: Record<string, number>;
  index: number; // basket level, 100 = reference
  indexOpen: number;
  certValue: number; // CHF per certificate (indicative)
  subPrice: number; // subscription price CHF
  intraday: number[]; // basket level intraday
  daily: number[]; // basket level, 90d history ending now
  brcPrice: number;
  ticks: number;
}

export function useMarket(): Market {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [sparks, setSparks] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(
      UNDERLYINGS.map((u, i) => [u.id, genSeries(24, u.price * 0.985, u.price, 0.5, 11 + i)])
    )
  );
  const [brcPrice, setBrcPrice] = useState(1004.6);
  const [ticks, setTicks] = useState(0);
  const intradayRef = useRef<number[]>([]);
  const quotesRef = useRef(initialQuotes);

  useEffect(() => {
    const t = setInterval(() => {
      const next = { ...quotesRef.current };
      for (const u of UNDERLYINGS) {
        const shock = (Math.random() - 0.5) * 0.0055 + 0.00006;
        next[u.id] = Math.max(u.ref * 0.6, next[u.id] * (1 + shock));
      }
      quotesRef.current = next;
      setQuotes(next);
      setSparks((s) => {
        const ns = { ...s };
        for (const u of UNDERLYINGS) ns[u.id] = [...s[u.id].slice(-23), next[u.id]];
        return ns;
      });
      setBrcPrice((p) => Math.min(1012, Math.max(992, p + (Math.random() - 0.48) * 1.4)));
      setTicks((x) => x + 1);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  const idxNow = basketIndex(quotes);

  useEffect(() => {
    intradayRef.current = [...intradayRef.current.slice(-59), idxNow];
  }, [idxNow]);

  const indexOpen = useMemo(() => {
    let s = 0;
    for (const u of UNDERLYINGS) s += (u.weight / 100) * (dayOpenQuotes[u.id] / u.ref);
    return s * 100;
  }, []);

  const daily = useMemo(
    () => genSeries(90, 100, idxNow, 0.55, 7),
    // re-seed occasionally so the chart breathes with the market
    [Math.round(idxNow * 4)]
  );

  return {
    quotes,
    sparks,
    dayOpen: dayOpenQuotes,
    index: idxNow,
    indexOpen,
    certValue: (PRODUCT.issuePrice * idxNow) / 100,
    subPrice: PRODUCT.issuePrice,
    intraday: intradayRef.current.length ? intradayRef.current : [idxNow],
    daily,
    brcPrice,
    ticks,
  };
}

/* portfolio helpers ------------------------------------------------------- */

export function holdingPrice(m: Market, isin: string): number {
  if (isin === PRODUCT.isin) return m.certValue;
  return m.brcPrice;
}
