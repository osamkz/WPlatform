import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

/* ------------------------------ reveal ------------------------------ */

export function Reveal({
  children,
  delay = 0,
  className,
  y = 18,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------- live number flash ------------------------- */

export function Flash({ value, className, children }: { value: number; className?: string; children: ReactNode }) {
  const prev = useRef(value);
  const [cls, setCls] = useState("");
  useEffect(() => {
    if (value > prev.current) setCls("flash-up");
    else if (value < prev.current) setCls("flash-down");
    prev.current = value;
    const t = setTimeout(() => setCls(""), 850);
    return () => clearTimeout(t);
  }, [value]);
  return <span className={`${cls} inline-block rounded-[3px] px-1 -mx-1 ${className ?? ""}`}>{children}</span>;
}

/* ------------------------------ badge ------------------------------ */

const tones: Record<string, string> = {
  ok: "bg-fern/12 text-fern border-fern/30",
  warn: "bg-amber/14 text-amber2 border-amber/40",
  bad: "bg-rust/12 text-rust border-rust/30",
  info: "bg-sky/12 text-sky border-sky/30",
  dim: "bg-dim/10 text-dim border-dim/25",
};

export function Badge({ tone = "dim", children, className = "" }: { tone?: string; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/* ------------------------------ charts ------------------------------ */

export function linePath(data: number[], w: number, h: number, pad = 2) {
  if (data.length < 2) return `M ${pad} ${h / 2} L ${w - pad} ${h / 2}`;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  d += ` L ${pts[pts.length - 1][0].toFixed(1)} ${pts[pts.length - 1][1].toFixed(1)}`;
  return d;
}

export function Sparkline({
  data,
  w = 96,
  h = 30,
  stroke = "var(--color-fern)",
  fill = false,
}: {
  data: number[];
  w?: number;
  h?: number;
  stroke?: string;
  fill?: boolean;
}) {
  const d = linePath(data, w, h);
  const gid = useRef(`sg${Math.random().toString(36).slice(2, 8)}`).current;
  const area = `${d} L ${w - 2} ${h} L 2 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
        </>
      )}
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AreaChart({
  data,
  w = 640,
  h = 220,
  stroke = "var(--color-fern)",
  dashed,
  labelMin,
  labelMax,
}: {
  data: number[];
  w?: number;
  h?: number;
  stroke?: string;
  dashed?: number[];
  labelMin?: string;
  labelMax?: string;
}) {
  const d = linePath(data, w, h, 6);
  const gid = useRef(`ag${Math.random().toString(36).slice(2, 8)}`).current;
  const area = `${d} L ${w - 6} ${h - 4} L 6 ${h - 4} Z`;
  const last = data[data.length - 1];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const lastY = 6 + (1 - (last - min) / (max - min || 1)) * (h - 12);
  const ref = data[0];
  const refY = 6 + (1 - (ref - min) / (max - min || 1)) * (h - 12);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.26" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="6" x2={w - 6} y1={h * f} y2={h * f} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 5" />
      ))}
      <line x1="6" x2={w - 6} y1={refY} y2={refY} stroke="currentColor" strokeOpacity="0.28" strokeDasharray="2 4" />
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" className="draw-line" style={{ ["--dash" as string]: 1600 }} />
      {(dashed ?? []).map((v, i) => {
        const y = 6 + (1 - (v - min) / (max - min || 1)) * (h - 12);
        return <line key={i} x1="6" x2={w - 6} y1={y} y2={y} stroke="var(--color-amber)" strokeWidth="1.4" strokeDasharray="6 5" opacity="0.8" />;
      })}
      <circle cx={w - 6} cy={lastY} r="3.6" fill={stroke} />
      <circle cx={w - 6} cy={lastY} r="7.5" fill={stroke} opacity="0.25" className="live-dot" />
      {labelMax && (
        <text x={w - 10} y="14" textAnchor="end" fontSize="10" fill="currentColor" opacity="0.55" className="num">
          {labelMax}
        </text>
      )}
      {labelMin && (
        <text x={w - 10} y={h - 8} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.55" className="num">
          {labelMin}
        </text>
      )}
    </svg>
  );
}

export function Donut({
  segments,
  size = 168,
  thickness = 20,
  children,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  thickness?: number;
  children?: ReactNode;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = `${Math.max(frac * c - 2.5, 0.5)} ${c}`;
          const off = -acc * c;
          acc += frac;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={off}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function Gauge({ value, max = 7, label, dark = false }: { value: number; max?: number; label?: string; dark?: boolean }) {
  const frac = Math.min(Math.max(value / max, 0), 1);
  const color = value <= 3 ? "var(--color-fern)" : value <= 5 ? "var(--color-amber)" : "var(--color-rust)";
  const angle = -90 + frac * 180;
  const needle = dark ? "var(--color-mint)" : "var(--color-ink)";
  const tickFill = dark ? "rgba(233,241,236,0.55)" : "var(--color-dim)";
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 116" className="w-full max-w-[220px]">
        <path d="M 18 104 A 82 82 0 0 1 182 104" fill="none" stroke={dark ? "rgba(154,220,180,0.16)" : "var(--color-line)"} strokeWidth="13" strokeLinecap="round" />
        <path
          d="M 18 104 A 82 82 0 0 1 182 104"
          fill="none"
          stroke={color}
          strokeWidth="13"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${frac * 100} 100`}
          style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.2,0.7,0.2,1)" }}
        />
        <g transform={`rotate(${angle} 100 104)`} style={{ transition: "transform 0.9s cubic-bezier(0.2,0.7,0.2,1)" }}>
          <line x1="100" y1="104" x2="100" y2="38" stroke={needle} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="100" cy="104" r="5.5" fill={needle} />
        </g>
        {Array.from({ length: max + 1 }, (_, i) => {
          const a = (-90 + (i / max) * 180) * (Math.PI / 180);
          const x = 100 + Math.sin(a) * 96;
          const y = 104 - Math.cos(a) * 96;
          return (
            <text key={i} x={x} y={y + 3} textAnchor="middle" fontSize="9" fill={tickFill} className="num">
              {i}
            </text>
          );
        })}
      </svg>
      <div className="mt-1 text-center">
        <span className="num text-2xl font-semibold" style={{ color }}>
          {value.toFixed(1)}
        </span>
        <span className={`num text-sm ${dark ? "text-paper/50" : "text-dim"}`}> / {max}</span>
        {label && <div className={`text-[11px] uppercase tracking-[0.14em] mt-0.5 ${dark ? "text-paper/45" : "text-dim"}`}>{label}</div>}
      </div>
    </div>
  );
}
