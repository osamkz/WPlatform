import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PM_PROFILE, fmtTime, fmtDate, type ChatMsg } from "../data";
import { ISend, IChat, IShield, IClock } from "./icons";

interface Props {
  messages: ChatMsg[];
  busy: boolean;
  onSend: (text: string) => void;
}

const QUICK = [
  "What fees am I paying on the tracker?",
  "How liquid is it if I need to exit?",
  "What happens at maturity?",
  "Can you reserve allocation for me?",
];

export default function MessagesView({ messages, busy, onSend }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

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
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* thread list */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-line">
            <div className="px-5 pt-5 pb-3 flex items-center gap-2">
              <IChat size={16} className="text-moss" />
              <h2 className="font-display font-semibold text-[15px] tracking-tight">Desk threads</h2>
            </div>
            {/* active thread */}
            <div className="mx-3 mb-3 border-2 border-moss/50 bg-moss/6 p-3.5 flex gap-3 cursor-default">
              <span className="w-11 h-11 shrink-0 grid place-items-center bg-pine2 text-mint font-display font-semibold border border-moss/40">
                {PM_PROFILE.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[13.5px]">{PM_PROFILE.name}</span>
                  <span className="w-2 h-2 rounded-full bg-fern live-dot" />
                </div>
                <div className="text-[11px] text-dim">{PM_PROFILE.role}</div>
                <div className="text-[11.5px] text-ink2 truncate mt-1">
                  {last ? (last.from === "user" ? `You: ${last.text}` : last.text) : "Start the conversation"}
                </div>
              </div>
            </div>
            <div className="mx-3 mb-3 border border-line p-3.5 flex gap-3 opacity-55">
              <span className="w-11 h-11 shrink-0 grid place-items-center bg-fog text-dim font-display font-semibold border border-line">SD</span>
              <div className="min-w-0">
                <div className="font-semibold text-[13.5px]">Säntis Desk</div>
                <div className="text-[11px] text-dim">Settlement & corporate actions</div>
                <div className="text-[11.5px] text-dim truncate mt-1">Your coupon of CHF 1'112.50 was settled…</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-line p-5">
            <div className="font-display font-semibold text-[14.5px] tracking-tight">Your product manager</div>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <div className="flex justify-between gap-3"><dt className="text-dim">Name</dt><dd className="font-medium">{PM_PROFILE.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-dim">Role</dt><dd className="text-right font-medium">{PM_PROFILE.role}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-dim">Firm</dt><dd className="font-medium">{PM_PROFILE.firm}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-dim">Desk hours</dt><dd className="num">08:00–18:00 CET</dd></div>
            </dl>
            <div className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-dim border-t border-line pt-3">
              <IShield size={14} className="shrink-0 mt-0.5 text-moss" />
              Thread is end-to-end encrypted and archived under your client file. Responses typically within the hour during desk hours.
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-fog border border-line p-4 flex items-center gap-3">
            <IClock size={16} className="text-dim shrink-0" />
            <p className="text-[11.5px] leading-relaxed text-dim">
              Urgent execution requests: call the desk at <span className="num text-ink font-medium">+41 44 555 08 00</span>.
            </p>
          </motion.div>
        </div>

        {/* conversation */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="bg-card border border-line flex flex-col h-[calc(100vh-190px)] min-h-[540px]">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-line bg-fog/50">
              <span className="relative w-10 h-10 grid place-items-center bg-pine2 text-mint font-display font-semibold text-[14px] border border-moss/40">
                {PM_PROFILE.initials}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-fern border-2 border-card" />
              </span>
              <div>
                <div className="font-display font-semibold text-[15.5px] tracking-tight">{PM_PROFILE.name}</div>
                <div className="text-[11.5px] text-dim">{PM_PROFILE.role} · {PM_PROFILE.firm}</div>
              </div>
              <span className="ml-auto text-[11px] num text-dim hidden sm:block">started {fmtDate(new Date())}</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <div className="text-center">
                <span className="num text-[10.5px] text-dim border border-line bg-fog px-3 py-1">
                  Secure thread · CH1571730808 attached to file
                </span>
              </div>
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                    className={`flex gap-3 ${m.from === "user" ? "justify-end" : ""}`}
                  >
                    {m.from === "pm" && (
                      <span className="w-8 h-8 shrink-0 grid place-items-center bg-pine2 text-mint font-display font-semibold text-[11px] border border-moss/40 mt-0.5">
                        {PM_PROFILE.initials}
                      </span>
                    )}
                    <div className={`max-w-[80%] ${m.from === "user" ? "text-right" : ""}`}>
                      <div
                        className={`inline-block text-left text-[13.5px] leading-relaxed px-4 py-3 ${
                          m.from === "user" ? "bg-pine2 text-paper" : "bg-fog border border-line text-ink2"
                        }`}
                      >
                        {m.text}
                      </div>
                      <div className={`num text-[10.5px] text-dim mt-1 ${m.from === "user" ? "text-right" : ""}`}>
                        {m.from === "user" ? "You" : PM_PROFILE.name.split(" ")[0]} · {fmtTime(m.time)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {busy && (
                <div className="flex gap-3">
                  <span className="w-8 h-8 shrink-0 grid place-items-center bg-pine2 text-mint font-display font-semibold text-[11px] border border-moss/40">
                    {PM_PROFILE.initials}
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
                placeholder={`Message ${PM_PROFILE.name.split(" ")[0]}…`}
                className="flex-1 bg-paper border border-line px-4 py-3 text-[13.5px] outline-none focus:border-moss transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                className="px-5 bg-moss text-paper font-display font-semibold text-[13.5px] hover:bg-fern transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:translate-y-px"
              >
                <ISend size={15} /> Send
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
