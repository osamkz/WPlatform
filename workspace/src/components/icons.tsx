import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: P) => {
  const { size = 18, ...rest } = p;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
};

export const IPeak = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 19 9.5 6.5 13 12l2.5-4L21 19Z" />
    <path d="M9.5 6.5 8 9.5l3 1.5" opacity=".55" />
  </svg>
);
export const IDoc = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 3h7l4 4v14H7Z" />
    <path d="M14 3v4h4M10 12h5M10 15.5h5" />
  </svg>
);
export const IDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v10m0 0 3.5-3.5M12 14 8.5 10.5M5 19h14" />
  </svg>
);
export const ISend = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12 20 4l-4.5 16-3.7-6.2L4 12Z" />
    <path d="m11.8 13.8 3.2-3.1" />
  </svg>
);
export const IBot = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="8" width="14" height="10" rx="2" />
    <path d="M12 8V5m0 0h3M9 13h.01M15 13h.01M9.5 15.5c.7.6 1.6.9 2.5.9s1.8-.3 2.5-.9" />
  </svg>
);
export const IChart = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 19V5M4 19h16" />
    <path d="m7 14 3.5-4 2.8 2.6L18 7" />
  </svg>
);
export const IShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 5 6v5c0 4.6 3 8 7 10 4-2 7-5.4 7-10V6Z" />
    <path d="m9 11.5 2.2 2.2L15.5 9" />
  </svg>
);
export const IClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 18 18 6M9 6h9v9" />
  </svg>
);
export const ICheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const IPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IMinus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);
export const IPulse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2.5-6 4 12L16 12h5" />
  </svg>
);
export const ILayers = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3 9 5-9 5-9-5Z" />
    <path d="m3 13 9 5 9-5" opacity=".55" />
  </svg>
);
export const IChat = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h16v11h-9l-4.5 3.5V17H4Z" />
    <path d="M8 10h8M8 13h5" opacity=".6" />
  </svg>
);
export const IChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IAlert = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 22 20H2Z" />
    <path d="M12 10v4.5M12 17.2h.01" />
  </svg>
);
export const IX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ILock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);
export const ICoins = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="6.5" rx="7" ry="3" />
    <path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
  </svg>
);
export const IScale = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v16m-5 0h10M12 4 6 6m6-2 6 2" />
    <path d="M6 6 3.5 12a2.7 2.7 0 0 0 5 0ZM18 6l-2.5 6a2.7 2.7 0 0 0 5 0Z" />
  </svg>
);
export const ISpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);
export const IWallet = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7.5h15v12H4Z" />
    <path d="M4 7.5 15 4v3.5M15 13h4" />
  </svg>
);
export const IUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5" />
  </svg>
);
