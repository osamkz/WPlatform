# Säntis Capital — Structured Products Investor Desk

A structured-products investor platform (modeled on the Leonteq product-page experience) with live simulated market data, subscription flow, portfolio monitoring, an AI advisor, and a product-manager messaging thread.

## Stack

- **Vite 6** + **React 18** + **TypeScript 5**
- **Tailwind CSS v4** (CSS-first theming via `@theme` in `src/index.css`)
- **framer-motion** (modal, toasts, tab transitions)
- Custom SVG charts & iconography — no chart or icon libraries

## Run locally

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run typecheck  # strict TS check
```

The production build is fully static (`dist/index.html` + assets) and can be hosted anywhere.

## Project structure

```
index.html                  Fonts (Space Grotesk, IBM Plex Sans/Mono), title, meta
src/
  main.tsx                  Entry point
  App.tsx                   Shell: header, nav tabs, clock, toasts, state wiring, modal
  index.css                 Design tokens (@theme), ambient backgrounds, keyframes
  data.ts                   Product term sheet, basket constituents, seed portfolio,
                            documents, PM thread, formatters
  market.ts                 useMarket() — live price simulation + persistence (localStorage)
  ai.ts                     Portfolio analytics, VEGA reply engine, PM auto-replies
  components/
    icons.tsx               Hand-drawn SVG icon set
    ui.tsx                  Reveal, Flash, Sparkline, AreaChart, Donut, Gauge, Badge, Modal, Toggle
    TickerTape.tsx          Scrolling market tape
    ProductView.tsx         Term sheet: masthead, payoff diagram, scenarios, underlyings, docs
    SubscribeModal.tsx      Order flow: validation → binding order → confirmation
    PortfolioView.tsx       Valuation, performance chart, allocation, holdings, activity
    AdvisorView.tsx         VEGA analytics + chat
    MessagesView.tsx        Thread with the product manager
```

## Key mechanics

- **Single source of truth** — `useMarket()` ticks every ~2.5 s; product, portfolio, advisor and
  ticker all read the same quotes, so prices update everywhere simultaneously.
- **Persistence** — portfolio, chat, messages and settings survive reload via `localStorage`.
- **Dates are relative to "today"** — subscription window, coupon schedule and time-to-maturity
  stay realistic whenever the app runs.
- **Subscription ripples through the app** — a new order updates holdings, cash and activity,
  triggers a toast, re-ranks the AI analysis, and prompts a proactive message from the PM.
