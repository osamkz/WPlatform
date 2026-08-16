import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCT, num, fmtTime, type ChatMsg, type Holding } from "../data";
import type { Market } from "../market";
import { analyze } from "../ai";
import { Gauge, Badge } from "./ui";
import { IBot, ISend, IAlert, ISpark, ICheck } from "./icons";

interface Props {
  holdings: Holding[];
  cash: number;
  market: Market;
  messages: ChatMsg[];
  busy: boolean;
  onSend: (text: string) => void;
  onSubscribe: () => void;
}

const QUICK = [
  "Analyse my portfolio",
  "How risky is my book?",
  "What happens at the barrier?",
  "Should I subscribe to the tracker?",
];

export default function AdvisorView({ holdings, cash, market, messages, busy, onSend, onSubscribe }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const a = analyze({ holdings, cash, market, subscribed: holdings.some((h) => h.isin === PRODUCT.isin) });

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = (t: string) => {
    const text = t.trim();
    if (!text || busy) return;
    setInput("");
    onSend(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 grid lg:grid-cols-12 gap-6 items-start">
      {/* ------------------- left: portfolio pulse ------------------- */}
      <div className="lg:col-span-4 space-y-5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="bg-pine2 text-paper relative overflow-hidden">
          <div className="absolute inset-0 grid-dark opacity-70" />
          <div className="relative p-6">
            <div className="flex items-center gap-2">
              <ISpark size={16} className="text-amber" />
              <span className="font-display font-semibold tracking-tight text-[15px]">Portfolio pulse</span>
              <span className="ml-auto text-[10.5px] uppercase tracking-[0.14em] text-mint/55">VEGA engine</span>
            </div>
            <div className="mt-4">
              <Gauge dark value={a.riskScore} label="Composite risk · 1–7" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-px bg-mint/12 border border-mint/12 text-center">
              {[
                { k: "Diversif.", v: `${a.divScore}/100` },
                { k: "Cash", v: `${num(a.cashPct, 0)}%` },
                { k: "Yield", v: `${num(a.incomePct, 1)}%` },
              ].map((s) => (
                <div key={s.k} className="bg-pine2 py-3">
                  <div className="num text-[16px] font-semibold text-paper">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-[0.13em] text-mint/50 mt-0.5">{s.k}</div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-mint/55 font-semibold">Exposure map</div>
              <ul className="mt-2.5 space-y-2">
                {a.sectors.slice(0, 6).map((s) => (
                  <li key={s.name}>
                    <div className="flex justify-between text-[11.5px]">
                      <span className="text-paper/75 truncate pr-2">{s.name}</span>
                      <span className="num text-paper/90">{num(s.pct, 1)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-paper/10 overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{ background: s.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(s.pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* alerts */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="bg-card border border-line">
          <div className="flex items-center gap-2 px-5 pt-5">
            <IAlert size={16} className="text-amber2" />
            <h3 className="font-display font-semibold text-[15px] tracking-tight">Recommendations</h3>
            <Badge tone="dim" className="ml-auto">{a.alerts.length}</Badge>
          </div>
          <ul className="mt-3 divide-y divide-line/80">
            {a.alerts.map((al, i) => (
              <li key={i} className="px-5 py-4">
                <div className="flex items-start gap-2.5">
                  <span className={`mt-1 w-2 h-2 shrink-0 ${al.tone === "warn" ? "bg-amber" : al.tone === "ok" ? "bg-fern" : "bg-sky"}`} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold leading-snug">{al.title}</div>
                    <p className="text-[12px] leading-relaxed text-dim mt-1">{al.body}</p>
                    {al.action && (
                      <button
                        onClick={() => (al.action!.kind === "subscribe" ? onSubscribe() : setInput(al.action!.prompt ?? ""))}
                        className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-moss hover:text-fern transition-colors"
                      >
                        <ICheck size={12} /> {al.action.label} →
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ------------------- right: chat ------------------- */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-8">
        <div className="bg-card border border-line flex flex-col h-[calc(100vh-190px)] min-h-[540px]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-line bg-fog/50">
            <span className="relative w-10 h-10 grid place-items-center bg-pine2 text-mint border border-moss/40">
              <IBot size={20} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-fern border-2 border-card live-dot" />
            </span>
            <div>
              <div className="font-display font-semibold text-[15.5px] tracking-tight">VEGA</div>
              <div className="text-[11.5px] text-dim">Structured-products analyst · reads your book in real time</div>
            </div>
            <Badge tone="ok" className="ml-auto hidden sm:inline-flex">online</Badge>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${m.from === "user" ? "justify-end" : ""}`}
                >
                  {m.from === "ai" && (
                    <span className="w-8 h-8 shrink-0 grid place-items-center bg-pine2 text-mint border border-moss/40 mt-0.5">
                      <IBot size={15} />
                    </span>
                  )}
                  <div className={`max-w-[82%] ${m.from === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block text-left text-[13.5px] leading-relaxed px-4 py-3 ${
                        m.from === "user" ? "bg-pine2 text-paper" : "bg-fog border border-line text-ink2"
                      }`}
                    >
                      {m.text}
                    </div>
                    <div className={`num text-[10.5px] text-dim mt-1 ${m.from === "user" ? "text-right" : ""}`}>
                      {m.from === "user" ? "You" : "VEGA"} · {fmtTime(m.time)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {busy && (
              <div className="flex gap-3">
                <span className="w-8 h-8 shrink-0 grid place-items-center bg-pine2 text-mint border border-moss/40">
                  <IBot size={15} />
                </span>
                <div className="bg-fog border border-line px-4 py-3.5 flex items-center gap-1.5">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-dim" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-dim" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-dim" />
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-2 flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={busy}
                className="text-[11.5px] font-medium border border-line px-3 py-1.5 text-dim hover:border-moss hover:text-moss transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-4 border-t border-line flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about risk, income, barriers, allocation…"
              className="flex-1 bg-paper border border-line px-4 py-3 text-[13.5px] outline-none focus:border-moss transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              className="px-5 bg-amber text-pine2 font-display font-semibold text-[13.5px] hover:bg-amber/85 active:translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ISend size={15} /> Ask
            </button>
          </form>
        </div>
        <p className="mt-2.5 text-[11px] text-dim flex items-center gap-1.5">
          <IBot size={12} /> VEGA analyses your positions in real time. Output is a decision aid, not personalised investment advice.
        </p>
      </motion.div>
    </div>
  );
}
