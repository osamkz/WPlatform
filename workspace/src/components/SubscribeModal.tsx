import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCT, DATES, ACCOUNTS, chf, int, fmtDate, num } from "../data";
import { IMinus, IPlus, ICheck, IX, ILock } from "./icons";

interface Props {
  open: boolean;
  cash: number;
  onClose: () => void;
  onConfirm: (qty: number, account: string) => void;
  onViewPortfolio: () => void;
}

export default function SubscribeModal({ open, cash, onClose, onConfirm, onViewPortfolio }: Props) {
  const [qty, setQty] = useState(10);
  const [account, setAccount] = useState(ACCOUNTS[0].id);
  const [ack, setAck] = useState(false);
  const [phase, setPhase] = useState<"form" | "placing" | "done">("form");
  const [orderId, setOrderId] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase("form");
      setAck(false);
      setConfirmed(false);
      setQty((q) => Math.max(1, Math.min(q, Math.floor(cash / 1000))));
    }
  }, [open]); // eslint-disable-line

  const nominal = qty * PRODUCT.issuePrice;
  const affordable = Math.max(0, Math.floor(cash / PRODUCT.issuePrice));
  const insufficient = nominal > cash;
  const valid = qty >= 1 && !insufficient && ack;

  const place = () => {
    if (!valid || phase !== "form") return;
    setPhase("placing");
    setTimeout(() => {
      setOrderId(`ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`);
      setPhase("done");
      if (!confirmed) {
        setConfirmed(true);
        onConfirm(qty, account);
      }
    }, 1500);
  };

  const acc = ACCOUNTS.find((a) => a.id === account)!;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-pine2/70 backdrop-blur-[3px]" onClick={phase === "placing" ? undefined : onClose} />
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative w-full max-w-lg bg-paper border border-line shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-pine2 text-paper px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-display font-semibold tracking-tight text-[16px]">
                  {phase === "done" ? "Order confirmed" : "Primary subscription"}
                </div>
                <div className="num text-[11px] text-mint/70 mt-0.5">{PRODUCT.isin} · {PRODUCT.short}</div>
              </div>
              {phase !== "placing" && (
                <button onClick={onClose} className="p-1.5 hover:bg-paper/10 transition-colors" aria-label="Close">
                  <IX size={17} />
                </button>
              )}
            </div>

            {phase !== "done" ? (
              <div className="p-6 space-y-5">
                {/* quantity */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase tracking-[0.14em] text-dim font-semibold">Certificates</label>
                    <span className="num text-[11.5px] text-dim">cash available {chf(cash)}</span>
                  </div>
                  <div className="mt-2 flex items-stretch border border-line bg-card">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-4 hover:bg-fog transition-colors disabled:opacity-30"
                      disabled={qty <= 1}
                      aria-label="Decrease"
                    >
                      <IMinus size={15} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={affordable || 1}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 w-full text-center num text-[22px] font-semibold bg-transparent outline-none py-2.5"
                    />
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="px-4 hover:bg-fog transition-colors"
                      aria-label="Increase"
                    >
                      <IPlus size={15} />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {[5, 10, 25, Math.min(50, affordable || 50)].map((n, i, arr) =>
                      i === arr.length - 1 && n === arr[i - 1] ? null : (
                        <button
                          key={n}
                          onClick={() => setQty(n)}
                          className={`num text-[11.5px] px-2.5 py-1 border transition-colors ${
                            qty === n ? "border-moss bg-moss text-paper" : "border-line hover:border-moss text-dim"
                          }`}
                        >
                          {n === (affordable || 50) ? `max ${n}` : n}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* account */}
                <div>
                  <label className="text-[11px] uppercase tracking-[0.14em] text-dim font-semibold">Settlement account</label>
                  <div className="mt-2 grid gap-2">
                    {ACCOUNTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAccount(a.id)}
                        className={`text-left border p-3 transition-colors ${
                          account === a.id ? "border-moss bg-moss/8" : "border-line hover:border-moss/50 bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[13.5px]">{a.label}</span>
                          <span className={`w-4 h-4 border grid place-items-center ${account === a.id ? "border-moss bg-moss text-paper" : "border-line"}`}>
                            {account === a.id && <ICheck size={11} />}
                          </span>
                        </div>
                        <div className="num text-[11.5px] text-dim mt-0.5">{a.iban} · {a.custody}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* summary */}
                <div className="border border-line bg-card p-4 space-y-2 text-[13px]">
                  <div className="flex justify-between"><span className="text-dim">Nominal · {int(qty)} × {chf(1000)}</span><span className="num">{chf(nominal)}</span></div>
                  <div className="flex justify-between"><span className="text-dim">Issue commission (embedded, 1.00%)</span><span className="num text-dim">included</span></div>
                  <div className="flex justify-between"><span className="text-dim">Execution price</span><span className="num">100.00%</span></div>
                  <div className="flex justify-between pt-2 border-t border-line font-semibold">
                    <span>Debit {fmtDate(DATES.issue)}</span><span className="num text-[15px]">{chf(nominal)}</span>
                  </div>
                </div>

                {insufficient && (
                  <div className="text-[12.5px] text-rust bg-rust/8 border border-rust/25 px-3 py-2">
                    Insufficient cash: order exceeds available balance by {chf(nominal - cash)}. Max affordable: {int(affordable)} certificates.
                  </div>
                )}

                {/* KID ack */}
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <button
                    onClick={() => setAck(!ack)}
                    className={`mt-0.5 w-[18px] h-[18px] shrink-0 border grid place-items-center transition-colors ${
                      ack ? "bg-moss border-moss text-paper" : "border-line bg-card"
                    }`}
                    role="checkbox"
                    aria-checked={ack}
                  >
                    {ack && <ICheck size={12} />}
                  </button>
                  <span className="text-[12.5px] leading-relaxed text-ink2" onClick={() => setAck(!ack)}>
                    I confirm that I have read and understood the <strong>Key Information Document</strong> and the Prospectus,
                    and that this order is <strong>binding</strong> at 100% of the nominal amount.
                  </span>
                </label>

                <button
                  onClick={place}
                  disabled={!valid || phase === "placing"}
                  className={`w-full py-3.5 font-display font-semibold text-[15px] tracking-tight transition-all flex items-center justify-center gap-2 ${
                    valid && phase !== "placing"
                      ? "bg-amber text-pine2 hover:bg-amber/85 active:translate-y-px"
                      : "bg-fog text-dim cursor-not-allowed"
                  }`}
                >
                  {phase === "placing" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-pine2/30 border-t-pine2 rounded-full animate-spin" />
                      Placing order…
                    </>
                  ) : (
                    <>
                      <ILock size={15} /> Place binding order · {chf(nominal)}
                    </>
                  )}
                </button>
                <p className="text-[11px] text-dim text-center -mt-1">
                  Executed at the issue price. Free cancellation until {fmtDate(DATES.subClose)}, 12:00 CET.
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col items-center text-center py-4">
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="w-14 h-14 grid place-items-center bg-fern/12 text-fern border border-fern/30 rounded-full"
                  >
                    <ICheck size={26} />
                  </motion.span>
                  <h3 className="font-display font-semibold text-[20px] tracking-tight mt-4">Subscription executed</h3>
                  <p className="text-[13px] text-dim mt-1.5 max-w-sm leading-relaxed">
                    {int(qty)} certificates of {PRODUCT.short} allocated at 100%. Settlement {fmtDate(DATES.issue)} against {acc.label}.
                  </p>
                </div>
                <div className="border border-line bg-card divide-y divide-line/80 text-[13px]">
                  {[
                    ["Order reference", orderId],
                    ["Quantity", `${int(qty)} certificates`],
                    ["Execution price", `100.00% · ${chf(PRODUCT.issuePrice)}`],
                    ["Total nominal", chf(qty * PRODUCT.issuePrice)],
                    ["Depot", acc.label],
                    ["First trading day", fmtDate(DATES.firstTrading)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between px-4 py-2.5">
                      <span className="text-dim">{k}</span>
                      <span className="num font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button onClick={onClose} className="py-3 border border-line font-semibold text-[13.5px] hover:border-moss hover:text-moss transition-colors">
                    Done
                  </button>
                  <button onClick={onViewPortfolio} className="py-3 bg-pine2 text-paper font-display font-semibold text-[13.5px] hover:bg-moss transition-colors">
                    View portfolio →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
