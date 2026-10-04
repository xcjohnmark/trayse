# Trayse Terminal v1: Market Intelligence & Analytics Engine

> **Document Version:** 1.0.0  
> **Target Release:** Colosseum Crypto World's Fair Hackathon (October 2026)  
> **Classification:** Category A — Institutional Market Intelligence, Normalization & Analytics  
> **Deployment Target:** `trayse.vercel.app/terminal`  
> **Status:** Production Specification & Master Build Plan  

---

## Executive Summary

Trayse Terminal v1 transforms fragmented, slow prediction markets into an institutional-grade quantitative trading interface. Rather than jumping between Polymarket, Kalshi, and broker feeds with mismatched odds and conflicting contract semantics, Trayse unifies the prediction ecosystem into a normalized, micro-latency terminal.

This document establishes the end-to-end plan to take Trayse from **zero to a live, production-grade terminal** delivering:
1. **Cross-Platform Market Browser:** Normalized live odds, volumes, order book depth ladders, and resolution schedules across Polymarket and Kalshi.
2. **Unified Watchlists:** Custom institutional dashboards organized by asset class, macro events, election cycles, tech earnings, and volatility indicators.
3. **Arbitrage Scanner:** Real-time detection of synthetic risk-free spreads, fee-adjusted divergence, and positive expected value ($+EV$) opportunities across venues.
4. **Trade Journal & Notes:** Local non-custodial position tracker, mathematical trade rationale logger, and CSV audit exports.

---

## 1. System Architecture & Tech Stack

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      TRAYSE TERMINAL v1 ARCHITECTURE                   │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│          FRONTEND UI / UX           │   │         BACKEND EDGE / DATA         │
│ • Next.js 15 App Router             │   │ • Next.js Edge API Route Handlers   │
│ • TypeScript (Strict)               │   │ • Polymarket Gamma & CLOB Feeds     │
│ • Tailwind CSS v4 + Radix UI        │   │ • Kalshi Trade API v2 Ingestion     │
│ • ReUI Components + Lucide Icons    │   │ • Normalization & Fuzzy Link Engine │
│ • Zustand (Client State Store)      │   │ • Arbitrage & Spread Calculator     │
│ • TanStack Query (Data Invalidation)│   │ • In-Memory Memory Cache & SWR      │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
```

### Core Technologies & Libraries

* **Framework:** Next.js 15 (App Router, Turbopack enabled)
* **Language:** TypeScript 5.5+ (100% strict type definitions)
* **Styling & Design System:** Tailwind CSS, Radix UI Primitives, ReUI components (`reui.io`), `ui-skills` motion physics
* **Design DNA:** Pure OLED Black (`#000000`), Slate Surface (`#090A0E`), Hairline Borders (`#1F232F`), Electric Mint Accent (`#00D688` / `#00FFA3`), Tabular Figures (`tabular-nums`)
* **State Management:** Zustand (lightweight, zero-re-render stores for watchlists and journal) + TanStack React Query (data caching and background polling)
* **Hosting & CI/CD:** Vercel (Production URL: `trayse.vercel.app/terminal`, zero CORS friction)
* **Repository:** Public GitHub repository (`github.com/trayse/trayse`)

---

## 2. Real-Time Data Foundation: Polymarket & Kalshi Integration

### A. Polymarket Integration
Polymarket runs on the Polygon network using an off-chain Central Limit Order Book (CLOB) settled by smart contracts.

1. **Discovery & Metadata:**
   * **Endpoint:** `https://gamma-api.polymarket.com/events` & `https://gamma-api.polymarket.com/markets`
   * **Data Ingested:** Market ID, slug, question title, category, outcome prices (YES/NO), 24h volume, liquidity, end date, resolution source.
2. **Order Book Depth & Order Tape:**
   * **Endpoint:** `https://clob.polymarket.com/book?token_id={token_id}`
   * **Data Ingested:** Bids & Asks ladder (Price, Size).
   * **WebSocket Streaming:** `wss://ws-subscriptions-clob.polymarket.com/ws/market` (Subscribes to market updates for sub-second book recalculation).
3. **Handling Rate Limits & CORS:**
   * Direct browser requests to Polymarket CLOB encounter CORS and rate limits (30 req/sec).
   * **Trayse Edge Proxy:** Next.js Route Handlers (`/api/markets/polymarket/events` and `/api/markets/polymarket/book`) fetch on the server side with `stale-while-revalidate` (SWR) headers and an in-memory 5-second LRU cache.

### B. Kalshi Integration
Kalshi is a CFTC-regulated prediction exchange utilizing a centralized order book settled in USD cents (1¢–99¢).

1. **Discovery & Metadata:**
   * **Endpoint:** `https://api.elections.kalshi.com/trade-api/v2/events` and `/series`
   * **Data Ingested:** Ticker, title, subtitle, category, open/close time, latest trade price, 24h volume.
2. **Order Book Depth:**
   * **Endpoint:** `https://api.elections.kalshi.com/trade-api/v2/markets/{ticker}/orderbook`
   * **Data Ingested:** Yes/No bids and asks denominated in integer cents (1–99).
3. **Probability Normalization:**
   * Kalshi quotes contracts as integer cents (e.g., `64¢`).
   * Trayse normalizes this directly into floating probabilities `0.640` and percentages `64.0%` matching Polymarket's `0.640` decimal format.

### C. Unified Market Normalizer & Entity Linking
To compare odds across Polymarket and Kalshi, Trayse implements a **Fuzzy Entity Matcher**:
* Cleans event titles (removes boilerplate like *"Will..."*, punctuation, and dates).
* Matches on normalized target keywords (e.g., `["Fed", "Rate Cut", "November 2026"]`, `["Trump", "Win", "Presidency"]`, `["NVDA", "Market Cap", "3.5T"]`).
* Enforces **Resolution Date Alignment**: Markets must resolve within a tolerance window of ±24 hours to qualify as a valid arbitrage pair.
* Output Schema:
  ```typescript
  export interface NormalizedMarketPair {
    id: string; // e.g., "fed-rate-cut-nov-26"
    canonicalTitle: string;
    category: "Macro" | "Crypto" | "Politics" | "Tech";
    expiryTimestamp: number;
    venues: {
      polymarket?: {
        marketId: string;
        yesPrice: number; // 0.00 - 1.00
        noPrice: number;
        volume24h: number;
        bestBid: number;
        bestAsk: number;
        liquidityUsd: number;
        url: string;
      };
      kalshi?: {
        ticker: string;
        yesPrice: number; // 0.00 - 1.00
        noPrice: number;
        volume24h: number;
        bestBid: number;
        bestAsk: number;
        liquidityUsd: number;
        url: string;
      };
    };
    arbitrage: {
      hasArb: boolean;
      grossSpreadBps: number;
      netSpreadBps: number;
      buyVenueYes: "polymarket" | "kalshi";
      buyVenueNo: "polymarket" | "kalshi";
      effectiveCost: number; // e.g., 0.965 ($0.965 to guarantee $1.00 payout)
      roiPercent: number;    // e.g., 3.62%
    };
  }
  ```

---

## 3. Core Functional Modules

### Module 1: Cross-Platform Market Browser
* **Navigation & Filter Bar:** Filter by Venue (`All`, `Polymarket`, `Kalshi`), Category (`All`, `Crypto`, `Macro`, `Politics`, `Earnings`), and Sort by (`Volume`, `Spread %`, `Closing Soon`, `Liquidity`).
* **High-Density Table View:**
  * Columns: Asset / Event, Closing In, Polymarket YES/NO, Kalshi YES/NO, Net Divergence, 24h Aggregate Volume, Quick Action.
  * Numerical stability: All price changes and spreads use `tabular-nums` with green/red ticker flash on tick update.
* **Deep Order Book Modal / Flyout:**
  * Displays side-by-side vertical depth ladders for the selected event across both platforms.
  * Shows cumulative depth bars (`bg-emerald-500/15` and `bg-rose-500/15`).

### Module 2: Unified Watchlists
* **Personalized Dashboard:** Users can create custom named watchlists (e.g., *"Macro Volatility"*, *"Election Radar"*, *"Tech Earnings"*).
* **Storage Architecture:** Stored client-side in LocalStorage and Zustand with full offline resilience and instant loading.
* **1-Click Star Action:** Toggle any market directly into a watchlist with immediate state synchronization.

### Module 3: Real-Time Arbitrage Scanner
* **Mathematical Arbitrage Logic:**
  * **Direct Discrepancy:** When Platform A offers YES at $P_{A,\text{yes}} = 0.58$ and Platform B offers YES at $P_{B,\text{yes}} = 0.64$, directional traders can exploit pricing latency.
  * **Synthetic Risk-Free Arbitrage:** When a trader can simultaneously buy YES on Venue A and buy NO on Venue B such that:
    $$P_{A,\text{yes}} + P_{B,\text{no}} + \text{Fees} < 1.00$$
    Every set of contracts guarantees a \$1.00 payout at resolution, locking in risk-free basis profit:
    $$\text{Profit} = 1.00 - (P_{A,\text{yes}} + P_{B,\text{no}} + \text{Fees})$$
* **Live Scanner UI:**
  * Dedicated "Arb Radar" tab highlighting all pairs where effective cost $< \$0.985$.
  * Displays Net ROI %, estimated capital capacity based on top-of-book depth, and instant execution links.

### Module 4: Trade Journal & Personal Audit Notes
* **Non-Custodial Journaling:** Private, client-side trade log stored locally.
* **Fields:** Entry Date, Market Title, Venue, Position (YES/NO), Size (USD), Entry Price, Target Exit Price, Thesis / Rationale Notes, Current Status (Open / Closed / Won / Lost).
* **Metrics Summary:** Aggregate Invested Capital, Win Rate %, Realized PnL, Open Exposure.
* **Audit Export:** 1-Click "Export CSV" and "Export JSON" for tax reporting and performance tracking.

---

## 4. Phase-by-Phase Build Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRAYSE TERMINAL v1 PHASES                       │
├─────────┬──────────────────────────────────────────────────────────────┤
│ Phase 1 │ Project Scaffolding, Design System & Layout Docks            │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 2 │ Ingestion & Normalization Layer (Polymarket & Kalshi APIs)    │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 3 │ Cross-Platform Market Browser & Depth Ladder Modal           │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 4 │ Unified Watchlists & Category Filtering                      │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 5 │ Real-Time Arbitrage Scanner & Spread Calculator              │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 6 │ Trade Journal, Rationale Notes & CSV Audit Export            │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 7 │ Performance Polish, Micro-Interactions & Vercel Production   │
└─────────┴──────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Project Scaffolding, Design System & Layout Docks

* **Goal:** Initialize the production Next.js repository, configure Tailwind tokens with the "Electric Obsidian" palette, install ReUI components, and build the persistent terminal layout shell.
* **Development Tasks:**
  1. Initialize Next.js 15 App Router project in the repository root with TypeScript and Tailwind CSS.
  2. Configure `tailwind.config.ts` with exact color tokens:
     * `void`: `#000000`
     * `surface`: `#090A0E`
     * `surface-elevated`: `#12141C`
     * `border-hairline`: `#1F232F`
     * `mint`: `#00D688` / `#00FFA3`
     * `crimson`: `#F6465D`
  3. Import the official SVG brand assets from `/logo-asset/` into `/public/`.
  4. Create the core terminal shell at `app/terminal/layout.tsx`:
     * Pinned Top Header Dock: Logo lockup (`trayse-logotype.svg`), live latency ticker (`12ms`), market pulse indicator, and wallet placeholder.
     * Left Activity Sidebar: Navigation links (*Markets*, *Arbitrage Scanner*, *Watchlists*, *Journal*).
     * Main Canvas Container: Deep black background with 1px border cards.
* **Design Engineering Tasks:**
  * Apply `emil-design-eng` rules: Set all number fonts to `font-mono tabular-nums`.
  * Ensure touch-hover guardrails via `@media (hover: hover)`.
* **Execution Instructions:**
  Run `npx create-next-app@latest . --typescript --tailwind --app --eslint` inside the project directory, install `lucide-react`, `zustand`, `@tanstack/react-query`, and configure the layout.

---

### Phase 2: Ingestion & Normalization Layer (Polymarket + Kalshi)

* **Goal:** Implement server-side proxy route handlers that fetch live market data from Polymarket and Kalshi, clean the schemas, and produce a unified JSON feed.
* **Development Tasks:**
  1. Build `/app/api/markets/polymarket/route.ts`:
     * Fetches top active events from `https://gamma-api.polymarket.com/events?closed=false&limit=50&order=volume24hr`.
     * Deserializes tokens, outcome probabilities, and liquidity.
  2. Build `/app/api/markets/kalshi/route.ts`:
     * Fetches active markets from `https://api.elections.kalshi.com/trade-api/v2/events?limit=50&status=open`.
     * Converts integer cent prices into 0.00–1.00 float probabilities.
  3. Build `/lib/normalizer.ts`:
     * Normalizes both feeds into a shared `NormalizedMarket` structure.
     * Runs fuzzy keyword matching to correlate identical events on both platforms.
  4. Add SWR in-memory caching (cache for 10 seconds on the server, serve stale data while revalidating) to respect rate limits.
* **Execution Instructions:**
  Test API handlers locally using `curl http://localhost:3000/api/markets/all` to verify that both Polymarket and Kalshi records merge without errors.

---

### Phase 3: Cross-Platform Market Browser & Depth Ladder Modal

* **Goal:** Deliver the primary market explorer view with live search, sorting, venue badges, and an interactive depth inspector modal.
* **Development Tasks:**
  1. Create `components/terminal/MarketBrowser.tsx`:
     * Search input with debounced querying.
     * Category filter pills (*All*, *Macro*, *Crypto*, *Politics*, *Tech*).
     * High-density table displaying canonical event titles, Polymarket odds, Kalshi odds, 24h volume, and spread indicators.
  2. Create `components/terminal/DepthModal.tsx`:
     * Modal dialog (built on Radix UI Dialog) rendering the live order book depth ladder.
     * Visual bars representing liquidity volume at each price level.
  3. Implement tick flash animation (green flash on price increase, red flash on price decrease).
* **Design Tasks:**
  * Apply ReUI animated tabs for venue switching.
  * Add spring transitions for modal open/close (`stiffness: 260, damping: 20`).
* **Execution Instructions:**
  Wire `useQuery` hooks to poll `/api/markets/all` every 10 seconds, binding real-time state directly to the table rows.

---

### Phase 4: Unified Watchlists & Custom Dashboards

* **Goal:** Allow users to pin markets, organize them into named watchlists, and view tailored monitoring dashboards.
* **Development Tasks:**
  1. Create Zustand store `lib/stores/useWatchlistStore.ts` with `persist` middleware (persists to `localStorage`).
  2. Implement actions: `toggleWatchlist(marketId)`, `createList(name)`, `deleteList(id)`.
  3. Add quick "Star" button on every market table row and card.
  4. Build `components/terminal/WatchlistDashboard.tsx` with metrics cards showing aggregate volume and average spread of watched markets.
* **Execution Instructions:**
  Verify persistence by adding 3 markets, hard refreshing the browser, and confirming all pinned markets load instantly without network delay.

---

### Phase 5: Real-Time Arbitrage Scanner Engine

* **Goal:** Automatically calculate synthetic risk-free arbitrage spreads and display an institutional "Arb Radar" with actionable alerts.
* **Development Tasks:**
  1. Create `lib/arbitrage.ts`:
     * Calculates $P_{A,\text{yes}} + P_{B,\text{no}}$ for all linked cross-venue pairs.
     * Deducts estimated platform taker fees (Polymarket 0%, Kalshi ~1.5–2% maker/taker formula).
     * Calculates net ROI % and annualised yield based on days to resolution.
  2. Create `components/terminal/ArbitrageRadar.tsx`:
     * Filter by Min ROI (e.g., `> 1.0%`, `> 2.5%`, `> 5.0%`).
     * Card view highlighting: "Buy YES on Polymarket @ $0.46" + "Buy NO on Kalshi @ $0.49" -> Total Cost: \$0.95 -> Guaranteed Payout: \$1.00 -> **Spread: +5.26% ROI**.
     * 1-Click outbound direct links to both platforms' market URLs.
  3. Add desktop toast notification (via Sonner) when a new arbitrage spread $> 3.0\%$ appears.
* **Execution Instructions:**
  Simulate order book price shifts in unit tests to verify the arbitrage engine calculates accurate net payouts after platform fees.

---

### Phase 6: Trade Journal, Rationale Notes & CSV Audit Export

* **Goal:** Provide traders with a self-contained, private execution journal to log theses, track open positions, and export audit trails.
* **Development Tasks:**
  1. Create `lib/stores/useJournalStore.ts` with local persistence.
  2. Build `components/terminal/TradeJournal.tsx`:
     * "Log Position" modal with inputs for: Market Name, Venue, Side (YES/NO), Size, Entry Price, Target Price, Thesis Notes.
     * Live PnL calculation: Calculates unrealized profit/loss based on incoming live price ticks.
     * Summary Cards: Total Invested, Open PnL ($ and %), Win Rate.
  3. Build CSV & JSON exporter:
     * Generates downloadable `.csv` file formatted with timestamps, tickers, sides, entry prices, and notes for audit compliance.
* **Execution Instructions:**
  Test logging 2 trades, updating status to "Closed", and exporting CSV; verify file opens cleanly in Excel / Google Sheets.

---

### Phase 7: Performance Polish, Vercel Production Deploy & Code Freeze

* **Goal:** Optimize performance, eliminate layout shift, deploy to `trayse.vercel.app/terminal`, and tag the official Git commit.
* **Development Tasks:**
  1. Audit bundle size with `@next/bundle-analyzer` (ensure terminal initial load $< 150\text{ KB}$ gzipped).
  2. Run Lighthouse audit on `/terminal` (target: 95+ Performance, 100 Accessibility).
  3. Connect GitHub repository to Vercel; configure production domain `trayse.vercel.app`.
  4. Test edge cases: Network offline state, API rate-limit fallbacks, graceful empty states.
  5. Tag Git release for hackathon judging:
     ```bash
     git tag -a v1.0.0-hackathon-terminal -m "Trayse Terminal v1 Production Release"
     git push origin v1.0.0-hackathon-terminal
     ```
* **Execution Instructions:**
  Verify live deployment on `https://trayse.vercel.app/terminal` across Chrome, Firefox, Safari, and mobile viewport.

---

## 5. Definition of Done (DoD) Checklist

- [ ] Next.js 15 App Router running at `/terminal` with zero console errors.
- [ ] Live Polymarket and Kalshi APIs feeding normalized data every 10 seconds.
- [ ] Fuzzy entity matcher successfully links identical events across both platforms.
- [ ] Depth ladder modal renders accurate bid/ask liquidity ladders.
- [ ] Arbitrage Scanner surfaces verified synthetic spreads with net ROI calculation.
- [ ] Watchlists and Trade Journal persist across browser reloads via LocalStorage.
- [ ] 1-Click CSV export generates valid audit files.
- [ ] Deployed live on Vercel at `trayse.vercel.app/terminal` with zero CORS issues.
- [ ] Clean Git commit log reflecting hackathon work tagged before deadline.
