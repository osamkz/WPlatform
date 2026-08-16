import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PRODUCT, INITIAL_HOLDINGS, INITIAL_CASH, INITIAL_ACTIVITY, FEATURED_HOLDING,
  DATES, fmtDate, int, uid, type Holding, type Activity, type ChatMsg, type Toast,
} from "./data";
import { useMarket } from "./market";
import { advisorGreeting, advisorReply, pmReply, type Desk } from "./ai";
import TickerTape from "./components/TickerTape";
import ProductView from "./components/ProductView";
import SubscribeModal from "./components/SubscribeModal";
import PortfolioView from "./components/PortfolioView";
import AdvisorView from "./components/AdvisorView";
import MessagesView from "./components/MessagesView";
import { IPeak, IDoc, IWallet, IBot, IChat, ICheck, IAlert, ISpark } from "./components/icons";

type Tab = "product" | "portfolio" | "advisor" | "messages";

const NAV: { id: Tab; label: string; icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: "product", label: "Product", icon: IDoc },
  { id: "portfolio", label: "Portfolio", icon: IWallet },
  { id: "advisor", label: "AI Advisor", icon: IBot },
  { id: "messages", label: "Messages", icon: IChat },
];

export default function App() {
  const market = useMarket();
  const [tab, setTab] = useState<Tab>("product");
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [cash, setCash] = useState(INITIAL_CASH);
  const [activity, setActivity] = useState<Activity[]>(INITIAL_ACTIVITY);
  const [advisorMsgs, setAdvisorMsgs] = useState<ChatMsg[]>([]);
  const [advisorBusy, setAdvisorBusy] = useState(false);
  const [pmMsgs, setPmMsgs] = useState<ChatMsg[]>(() => [
    {
      id: uid("pm"),
      from: "pm",
      text: `Guten Tag, Adrian — Lena Brunner here. I see you've opened the file on the Swiss Quality Dividend Tracker (${PRODUCT.isin}). The subscription window closes ${fmtDate(
        DATES.subClose
      )}; I can reserve allocation, walk you through the terms, or both. What would help most?`,
      time: new Date(Date.now() - 1000 * 60 * 42),
    },
  ]);
  const [pmBusy, setPmBusy] = useState(false);
  const [unread, setUnread] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const tabRef = useRef(tab);
  tabRef.current = tab;
  const deskRef = useRef<Desk>({ holdings, cash, market, subscribed: false });
  deskRef.current = {
    holdings,
    cash,
    market,
    subscribed: holdings.some((h) => h.isin === PRODUCT.isin),
  };
  const subscribed = deskRef.current.subscribed;
  const heldQty = holdings.find((h) => h.isin === PRODUCT.isin)?.qty ?? 0;

  /* toasts ------------------------------------------------------------- */
  const notify = (t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4600);
  };

  /* advisor ------------------------------------------------------------- */
  useEffect(() => {
    if (advisorMsgs.length === 0) {
      setAdvisorBusy(true);
      const t = setTimeout(() => {
        setAdvisorMsgs([{ id: uid("ai"), from: "ai", text: advisorGreeting(deskRef.current), time: new Date() }]);
        setAdvisorBusy(false);
      }, 900);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line

  const sendAdvisor = (text: string) => {
    setAdvisorMsgs((m) => [...m, { id: uid("ai"), from: "user", text, time: new Date() }]);
    setAdvisorBusy(true);
    setTimeout(() => {
      setAdvisorMsgs((m) => [...m, { id: uid("ai"), from: "ai", text: advisorReply(text, deskRef.current), time: new Date() }]);
      setAdvisorBusy(false);
    }, 1300 + Math.random() * 900);
  };

  /* messages ------------------------------------------------------------ */
  const sendPm = (text: string) => {
    setPmMsgs((m) => [...m, { id: uid("pm"), from: "user", text, time: new Date() }]);
    setPmBusy(true);
    setTimeout(() => {
      setPmMsgs((m) => [...m, { id: uid("pm"), from: "pm", text: pmReply(text, deskRef.current.subscribed), time: new Date() }]);
      setPmBusy(false);
      if (tabRef.current !== "messages") setUnread((u) => u + 1);
    }, 1600 + Math.random() * 1200);
  };

  useEffect(() => {
    if (tab === "messages") setUnread(0);
  }, [tab]);

  /* subscription ---------------------------------------------------------- */
  const confirmSubscribe = (qty: number) => {
    setHoldings((hs) => {
      const ex = hs.find((h) => h.isin === PRODUCT.isin);
      return ex ? hs.map((h) => (h.isin === PRODUCT.isin ? { ...h, qty: h.qty + qty } : h)) : [...hs, { ...FEATURED_HOLDING, qty }];
    });
    setCash((c) => c - qty * PRODUCT.issuePrice);
    setActivity((a) => [
      {
        id: uid("a"),
        date: new Date(),
        kind: "buy",
        label: `Subscription — Swiss Quality Dividend Tracker (${int(qty)} × CHF 1'000)`,
        amount: -qty * PRODUCT.issuePrice,
        currency: "CHF",
      },
      ...a,
    ]);
    notify({ tone: "ok", title: "Order confirmed", body: `${int(qty)} certificates allocated at 100% — portfolio updated.` });
    setTimeout(() => {
      setPmMsgs((m) => [
        ...m,
        {
          id: uid("pm"),
          from: "pm",
          text: `Your subscription over ${int(qty)} certificate${qty === 1 ? "" : "s"} just landed on my desk — confirmed at 100%, settlement ${fmtDate(
            DATES.issue
          )}. I'll flag every observation date personally. Welcome aboard the basket. — Lena`,
          time: new Date(),
        },
      ]);
      if (tabRef.current !== "messages") setUnread((u) => u + 1);
    }, 1500);
  };

  const openSubscribe = () => {
    setTab("product");
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-paper text-ink relative">
      <div className="fixed inset-0 grid-paper pointer-events-none" />

      {/* ============================ HEADER ============================ */}
      <header className="sticky top-0 z-40 bg-pine2 text-paper border-b border-mint/15">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center gap-6">
          <button onClick={() => setTab("product")} className="flex items-center gap-3 group shrink-0">
            <span className="w-9 h-9 grid place-items-center bg-amber text-pine2 group-hover:bg-mint transition-colors">
              <IPeak size={20} />
            </span>
            <span className="leading-none">
              <span className="font-display font-bold tracking-tight text-[16px] block">SÄNTIS CAPITAL</span>
              <span className="text-[9.5px] uppercase tracking-[0.24em] text-mint/60 font-semibold">Structured Products Desk</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = tab === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className={`relative px-4 py-2 text-[13.5px] font-semibold flex items-center gap-2 transition-colors ${
                    active ? "text-paper" : "text-paper/55 hover:text-paper"
                  }`}
                >
                  <Icon size={16} />
                  {n.label}
                  {n.id === "messages" && unread > 0 && (
                    <span className="num min-w-[18px] h-[18px] px-1 grid place-items-center bg-amber text-pine2 text-[10.5px] font-semibold rounded-full">
                      {unread}
                    </span>
                  )}
                  {n.id === "advisor" && <ISpark size={10} className="text-amber" />}
                  {active && <motion.span layoutId="navtab" className="absolute inset-x-2 -bottom-[13px] h-[3px] bg-amber" />}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-5">
            <ZurichClock />
            <div className="hidden lg:flex items-center gap-2.5 border border-mint/20 pl-2 pr-3 py-1.5">
              <span className="w-7 h-7 grid place-items-center bg-moss text-mint text-[11px] font-display font-semibold">AK</span>
              <span className="leading-tight">
                <span className="block text-[12px] font-semibold">Adrian Keller</span>
                <span className="block text-[10px] text-mint/60">Private Client · Zürich</span>
              </span>
            </div>
          </div>
        </div>

        {/* mobile nav */}
        <nav className="md:hidden flex border-t border-mint/12">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex-1 py-2.5 text-[11px] font-semibold flex flex-col items-center gap-1 relative ${
                tab === n.id ? "text-amber" : "text-paper/55"
              }`}
            >
              {({ product: IDoc, portfolio: IWallet, advisor: IBot, messages: IChat }[n.id] as any)({ size: 16 })}
              {n.label}
              {n.id === "messages" && unread > 0 && (
                <span className="absolute top-1 right-1/4 num min-w-[16px] h-[16px] px-0.5 grid place-items-center bg-amber text-pine2 text-[9.5px] rounded-full">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="relative">
        <TickerTape market={market} />

        <AnimatePresence mode="wait">
          <motion.main
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {tab === "product" && (
              <ProductView
                market={market}
                subscribed={subscribed}
                heldQty={heldQty}
                onSubscribe={() => setModalOpen(true)}
                onAskManager={() => setTab("messages")}
                notify={notify}
              />
            )}
            {tab === "portfolio" && <PortfolioView holdings={holdings} cash={cash} activity={activity} market={market} />}
            {tab === "advisor" && (
              <AdvisorView
                holdings={holdings}
                cash={cash}
                market={market}
                messages={advisorMsgs}
                busy={advisorBusy}
                onSend={sendAdvisor}
                onSubscribe={openSubscribe}
              />
            )}
            {tab === "messages" && <MessagesView messages={pmMsgs} busy={pmBusy} onSend={sendPm} />}
          </motion.main>
        </AnimatePresence>

        {/* footer */}
        <footer className="relative bg-pine2 text-paper/60 mt-16">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 text-paper">
                <span className="w-7 h-7 grid place-items-center bg-amber text-pine2"><IPeak size={16} /></span>
                <span className="font-display font-bold tracking-tight text-[14px]">SÄNTIS CAPITAL</span>
              </div>
              <p className="text-[12px] leading-relaxed mt-3 max-w-xs">
                Bahnhofstrasse 24, 8001 Zürich · FINMA-regulated securities firm. Structured products desk for private and institutional clients.
              </p>
            </div>
            <div className="text-[12px] leading-relaxed">
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-mint/55 font-semibold text-paper/80 mb-2">Important</div>
              Structured products carry issuer credit risk and are not covered by deposit insurance. Past performance and indicative
              values are no guarantee of future results. This platform is a product demonstration — figures are simulated.
            </div>
            <div className="text-[12px]">
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-mint/55 font-semibold text-paper/80 mb-2">Desk hours</div>
              <div className="num">Mon–Fri · 08:00–18:00 CET</div>
              <div className="num mt-1">+41 44 555 08 00 · desk@saentis.example</div>
              <div className="mt-3 flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-fern live-dot" /> Market data delayed ≤ 15 min unless flagged live
              </div>
            </div>
          </div>
          <div className="border-t border-mint/12">
            <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex flex-wrap justify-between gap-2 text-[11px] num text-paper/40">
              <span>© {new Date().getFullYear()} Säntis Capital AG — demonstration environment</span>
              <span>Prospectus · KID · Privacy — available in Documents</span>
            </div>
          </div>
        </footer>
      </div>

      {/* modal + toasts */}
      <SubscribeModal
        open={modalOpen}
        cash={cash}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmSubscribe}
        onViewPortfolio={() => {
          setModalOpen(false);
          setTab("portfolio");
        }}
      />

      <div className="fixed bottom-5 right-5 z-[60] space-y-2.5 w-[min(360px,calc(100vw-40px))]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
              className={`border bg-paper shadow-xl p-4 flex gap-3 ${
                t.tone === "ok" ? "border-fern/40" : t.tone === "warn" ? "border-amber/50" : "border-sky/40"
              }`}
            >
              <span
                className={`w-8 h-8 shrink-0 grid place-items-center ${
                  t.tone === "ok" ? "bg-fern/12 text-fern" : t.tone === "warn" ? "bg-amber/15 text-amber2" : "bg-sky/12 text-sky"
                }`}
              >
                {t.tone === "ok" ? <ICheck size={16} /> : t.tone === "warn" ? <IAlert size={15} /> : <ISpark size={15} />}
              </span>
              <div className="min-w-0">
                <div className="font-display font-semibold text-[13.5px] tracking-tight">{t.title}</div>
                {t.body && <div className="text-[12px] text-dim mt-0.5 leading-snug">{t.body}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ZurichClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const h = parseInt(get("hour"));
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", weekday: "short" }).format(now);
  const open = h >= 9 && h < 17 && !["Sat", "Sun"].includes(day);
  return (
    <div className="hidden sm:flex items-center gap-2.5 text-right leading-tight">
      <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-fern live-dot" : "bg-rust"}`} />
      <span>
        <span className="num block text-[13px] text-paper">{get("hour")}:{get("minute")}<span className="text-paper/45">:{get("second")}</span></span>
        <span className="block text-[9.5px] uppercase tracking-[0.14em] text-mint/55 font-semibold">
          Zürich · SIX {open ? "open" : "closed"}
        </span>
      </span>
    </div>
  );
}
