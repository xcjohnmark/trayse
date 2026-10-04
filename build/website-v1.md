# Trayse Website v1: Minimalist High-Impact Landing Page

> **Document Version:** 1.0.0  
> **Target Release:** Colosseum Crypto World's Fair Hackathon (October 2026)  
> **Design Inspiration:** `https://0xmonaco.com/` + `https://world.xyz/`  
> **Deployment Target:** `trayse.vercel.app/`  
> **Status:** Production Specification & Build Plan  

---

## Executive Summary

The Trayse website is a sleek, ultra-minimalist landing page designed to establish immediate institutional credibility, communicate Trayse’s core value proposition in seconds, and direct traders straight into the quant terminal at `/terminal`.

Following the design language of **0xMonaco** and **World.xyz**, the site rejects corporate clutter, massive walls of text, and cookie-cutter crypto templates. Instead, it pairs a **monumental hero headline**, a **prominent 1-click terminal launch CTA**, a **real-time micro-preview ticker**, and a **curated high-contrast feature list**.

---

## 1. Visual Identity & Design System

* **Canvas Void:** Pure OLED Black (`#000000` / `#0A0A0B`)
* **Card Containers:** Deep Zinc (`#0C0D11` / `#121318`) with 1px hairline border `rgba(255, 255, 255, 0.08)`
* **Primary Brand Accent:** Electric Mint (`#00D688` / `#00FFA3`)
* **Typography:**
  * Display Headline: **Geist Sans Bold** with tight tracking (`tracking-tight` / `-0.03em`)
  * Body Text: **Geist Sans Regular** in titanium slate (`#94A3B8`)
  * Numbers & Tickers: **Geist Mono** with `tabular-nums`
* **Motion Physics:** Subtly damped spring entrance (`stiffness: 260, damping: 20`) via Framer Motion / Tailwind CSS transitions

---

## 2. Page Structure & Components

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRAYSE WEBSITE WIREFRAME                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Logo: trayse-logotype.svg]      [Live Beta Pill]   [Launch Terminal ↗]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                [ ● Live on Solana & Robinhood Chain ]                  │
│                                                                        │
│           Institutional Intelligence for Prediction Markets.           │
│                                                                        │
│     Normalized odds, cross-venue order books, and real-time            │
│     synthetic arbitrage across Polymarket, Kalshi, and beyond.         │
│                                                                        │
│              [ Launch Terminal ↗ ]      [ View on GitHub ]             │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                     [ LIVE SPREAD TEASER CARD ]                        │
│   Fed Rate Cut Nov 26: Poly 48¢ vs Kalshi 52¢ | Arb Spread: +4.12%    │
├────────────────────────────────────────────────────────────────────────┤
│                             FEATURES GRID                              │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┐ │
│  │ 1. Cross-Venue       │ 2. Arbitrage Radar   │ 3. Dual-Rail Engine  │ │
│  │ Polymarket & Kalshi  │ Sub-second synthetic │ Solana micro-tape &  │ │
│  │ normalized depth     │ risk-free spreads    │ Robinhood hedge      │ │
│  └──────────────────────┴──────────────────────┴──────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  © 2026 Trayse. Built for Colosseum Hackathon. [GitHub] [X] [Discord]  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### A. Header Capsule (Floating Navigation Bar)
* Pinned floating pill dock centered at top of viewport (`fixed top-6 left-1/2 -translate-x-1/2 z-50`).
* Contains:
  * Brand Logo: `trayse-logotype.svg` (from `/logo-asset/`).
  * Live Status Indicator: Glowing mint dot with pulse animation (`animate-ping bg-[#00D688]`) next to "Beta".
  * Direct Action CTA: "Launch Terminal" button linking directly to `/terminal`.

#### B. Hero Section
* **Badge Pill:** "Built for Quantitative Traders & Quants".
* **Monumental Headline:**  
  * *"Institutional Intelligence for Prediction Markets."* (Font size `text-5xl md:text-7xl lg:text-8xl`, white text with subtle gradient clip).
* **Supporting Subtitle:**  
  * *"Normalized live odds, cross-venue order book depth, and real-time synthetic arbitrage across Polymarket, Kalshi, and beyond."*
* **Call to Action Buttons:**
  * **Primary CTA:** High-contrast Electric Mint button (`bg-[#00D688] hover:bg-[#00FFA3] text-black font-semibold px-8 py-3.5 rounded-full`) linking to `/terminal`.
  * **Secondary CTA:** Subtle glass pill (`bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3.5 rounded-full`) linking to GitHub / Documentation.

#### C. Live Spread Teaser (Interactive Micro-Preview)
* An animated preview card demonstrating Trayse’s core value in one glance.
* Displays a live or simulated high-profile arbitrage market:
  * **Event:** *"Will Federal Reserve Cut Rates in November 2026?"*
  * **Polymarket YES:** `46.0¢`
  * **Kalshi NO:** `49.0¢`
  * **Guaranteed Payout:** `$1.00`
  * **Synthetic Arbitrage Edge:** `+5.26% Net ROI`
* Flashing tick animation proving live mathematical intelligence.

#### D. Features Grid (Bento Box Architecture)
Three focused, high-density cards highlighting core capabilities:
1. **Card 1: Cross-Platform Market Normalization**  
   * Eliminates venue fragmentation. Ingests Polymarket CLOB and Kalshi Trade API v2 into standardized decimal probabilities and unified depth ladders.
2. **Card 2: Real-Time Arbitrage Scanner**  
   * Computes cross-venue pricing discrepancies and synthetic risk-free spreads adjusted for platform taker fees.
3. **Card 3: Dual-Rail Capital Infrastructure**  
   * Built for Solana Mainnet (Yellowstone gRPC streaming + Swig non-custodial session keys) and Robinhood Chain L2 (tokenized stock tokens & delta-neutral basis hedging).

#### E. Minimalist Footer
* Simple single-row layout (`border-t border-white/5 py-8 text-xs text-zinc-500`).
* Links: GitHub Repository, Colosseum Arena Project, X (Twitter), Discord, and Hackathon Legal Disclaimer.

---

## 3. Phase-by-Phase Build Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                         WEBSITE v1 BUILD PHASES                        │
├─────────┬──────────────────────────────────────────────────────────────┤
│ Phase 1 │ Landing Page Root Route & Layout Shell (`app/page.tsx`)       │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 2 │ Floating Header Navigation & Monumental Hero Section         │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 3 │ Interactive Real-Time Spread Teaser Widget                   │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 4 │ Features Bento Grid & Institutional Value Cards              │
├─────────┼──────────────────────────────────────────────────────────────┤
│ Phase 5 │ Mobile Responsiveness, Micro-Interactions & Vercel Deploy    │
└─────────┴──────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Landing Page Root Route & Layout Shell

* **Goal:** Set up `app/page.tsx` within the unified Next.js App Router, sharing the global Tailwind styling and font configuration.
* **Development Tasks:**
  1. Create `app/page.tsx` as a Server Component for optimal SEO and instant initial load.
  2. Configure metadata in `app/layout.tsx`:
     * Title: `Trayse — Institutional Intelligence for Prediction Markets`
     * Description: `Normalized live odds, cross-venue order books, and real-time synthetic arbitrage across Polymarket, Kalshi, and tokenized equities.`
     * OpenGraph and Twitter cards pointing to `trayse-logotype-1.svg`.
  3. Ensure background is locked to pure OLED black (`bg-[#000000] min-h-screen text-white`).
* **Execution Instructions:**
  Verify that visiting `http://localhost:3000/` loads the black canvas with correct tab titles and favicon.

---

### Phase 2: Floating Header Navigation & Monumental Hero Section

* **Goal:** Implement the floating pill navigation dock and the high-impact hero typography.
* **Development Tasks:**
  1. Build `components/website/Navbar.tsx`:
     * Floating glass capsule: `rounded-full bg-[#0C0D11]/80 backdrop-blur-md border border-white/10 px-6 py-3`.
     * Embed `trayse-logotype.svg` for crisp vector scaling.
     * Add "Launch Terminal ↗" button with client-side `next/link` pointing directly to `/terminal`.
  2. Build `components/website/Hero.tsx`:
     * Sub-headline badge pill with glowing mint ping dot.
     * Monumental headline using `text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight`.
     * Dual action CTA buttons (*"Launch Terminal"* and *"View Documentation"*).
* **Design Engineering Tasks:**
  * Add spring hover animation on buttons using Emil Kowalski's guidelines (`transform: scale(1.02)` gated behind `@media (hover: hover)`).
* **Execution Instructions:**
  Inspect hero section across desktop and mobile screens to verify text does not overflow or wrap awkwardly.

---

### Phase 3: Interactive Real-Time Spread Teaser Widget

* **Goal:** Create an attention-grabbing live simulation card showing an active Polymarket ↔ Kalshi spread directly under the hero section.
* **Development Tasks:**
  1. Build `components/website/SpreadTeaser.tsx`:
     * Container: `max-w-3xl mx-auto rounded-2xl bg-[#0C0D11] border border-white/10 p-6`.
     * Displays a side-by-side venue odds comparison:
       * Left: Polymarket YES probability pill.
       * Right: Kalshi NO probability pill.
       * Center: Net Arbitrage Spread badge (`+4.12% ROI`) in `#00D688`.
  2. Add simulated micro-tick animation: Every 4 seconds, the prices fluctuate slightly with green/red flashes, demonstrating active order flow.
  3. Add 1-click CTA: *"Open in Terminal"* button that deep-links directly to `/terminal`.
* **Execution Instructions:**
  Verify that the teaser is lightweight, causes zero layout shift, and looks like a live financial instrument.

---

### Phase 4: Features Bento Grid & Institutional Value Cards

* **Goal:** Build a 3-card bento grid detailing Trayse's technical capabilities without visual clutter.
* **Development Tasks:**
  1. Build `components/website/FeaturesGrid.tsx`:
     * Card 1: **Cross-Platform Normalization** (Polymarket CLOB + Kalshi Trade API v2 unified).
     * Card 2: **Real-Time Arbitrage Scanner** (Sub-second synthetic spreads and fee-adjusted ROI).
     * Card 3: **Dual-Rail Capital Infrastructure** (Solana micro-tape + Robinhood Chain hedging).
  2. Add subtle icons from `lucide-react` (*Scale*, *Zap*, *Layers*).
  3. Apply subtle hover borders: `hover:border-[#00D688]/40 transition-colors duration-200`.
* **Execution Instructions:**
  Check card alignment and responsive flex wrapping on smaller viewports.

---

### Phase 5: Mobile Responsiveness, Micro-Interactions & Vercel Deploy

* **Goal:** Finalize the landing page, verify performance, and deploy to production on Vercel at `trayse.vercel.app`.
* **Development Tasks:**
  1. Build `components/website/Footer.tsx` with project copyright, GitHub link, and Colosseum Hackathon badge.
  2. Audit mobile responsiveness (ensure navigation remains clean and hero text scales properly on 375px+ screens).
  3. Deploy to Vercel via CLI or Git push:
     ```bash
     git add .
     git commit -m "feat(website): implement 0xMonaco-inspired minimalist landing page"
     git push origin main
     ```
  4. Test seamless soft navigation: Clicking "Launch Terminal" instantly transitions from `trayse.vercel.app/` to `trayse.vercel.app/terminal` in $< 50\text{ms}$ with zero page reload.
* **Execution Instructions:**
  Run Google Lighthouse audit on `https://trayse.vercel.app` to verify 98+ performance score.

---

## 4. Definition of Done (DoD) Checklist

- [ ] Minimalist hero section matching 0xMonaco aesthetic live at `app/page.tsx`.
- [ ] Floating navigation dock renders official vector logo (`trayse-logotype.svg`).
- [ ] "Launch Terminal" button smoothly routes to `/terminal` via `next/link`.
- [ ] Real-time spread teaser highlights active prediction market arbitrage.
- [ ] 3-card bento features grid clearly explains Trayse's value proposition.
- [ ] Zero CORS errors, zero external dependencies required for initial page load.
- [ ] Deployed live on Vercel at `trayse.vercel.app` for $0.
