# Trayse Terminal v1: Master Build Plan & Agent Execution Engine

> **Document Version:** 1.0.0  
> **Target Release:** Colosseum Crypto World's Fair Hackathon (October 2026)  
> **Architecture Reference:** `build/terminal-v1.md`  
> **Tools & Stack Directory:** `build-tools.md`  
> **Blockchain Dual-Rail Reference:** `project-details/chain-integration.md`  
> **UI/UX Design References:** [Bullpen.fi](https://app.bullpen.fi) & [0xMonaco Terminal](https://trade.0xmonaco.com/futures/BTC)  
> **Localhost Monitor:** `http://localhost:3000/terminal`  
> **Status:** Phase 1 Active Execution  

---

## Architecture & Design DNA

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

### Visual & Interaction Identity (Inspired by Bullpen & 0xMonaco)
1. **OLED Obsidian Palette:** Pure black void background (`#000000`), deep slate surface panels (`#090A0E`), elevated card docks (`#12141C`), hairline border dividers (`#1F232F` / `rgba(255, 255, 255, 0.08)`).
2. **Signal Highlights:** Electric Mint (`#00D688` / `#00FFA3`) for positive spreads, bid ladders, live market indicators, and affirmative actions; Crimson (`#F6465D` / `#E5484D`) for ask ladders, negative divergence, and warning states.
3. **Institutional Tabular Figures:** Strict `font-mono tabular-nums` for all odds, cent values, latencies, liquidity volumes, and countdown clocks to eliminate visual jitter.
4. **Docked Workspace Structure:** Pinned top telemetry header dock, collapsible left activity sidebar, persistent bottom diagnostic status strip, and a modular high-density multi-panel workspace.

---

# Phase 1: Project Scaffolding, Design System & Layout Docks

## 1. Phase Objective & Acceptance Criteria
* **Objective:** Establish the production Next.js 15 App Router framework, strict TypeScript configuration, Tailwind CSS design tokens matching the Bullpen/0xMonaco dark theme, SVG brand asset pipeline, dual-rail blockchain state foundation (Solana SVM + Robinhood Chain L2), and the persistent institutional terminal layout dock shell.
* **Acceptance Criteria:**
  - `http://localhost:3000/terminal` loads with zero console errors or hydration warnings.
  - Pinned Top Header Dock renders the official Trayse SVG logotype, live latency tickers (SVM Yellowstone & Nitro L2), market status pulse, and multi-chain wallet trigger.
  - Left Activity Sidebar supports seamless navigation across Markets, Arb Radar, Watchlists, and Journal.
  - Bottom Status Strip displays active WebSocket connections, block heights, and memory diagnostics.
  - All numerical values use monospace tabular figures (`font-mono tabular-nums`).

---

## 2. Tasks User Must Handle Directly (Core Prerequisites Only)

To keep friction at absolute zero, user responsibilities are strictly confined to external account creation and git repository initialization:

### Task U1.1: Local & Remote Git Repository Setup
* **What you do:**
  1. Open terminal in the project root: `c:\Users\ADMIN\Documents\trayse`.
  2. Initialize git:
     ```powershell
     git init
     git branch -M main
     ```
  3. Create a public GitHub repository named `trayse` (e.g. `github.com/<your-username>/trayse`) for Colosseum hackathon verification.
  4. Link your remote:
     ```powershell
     git remote add origin https://github.com/<your-username>/trayse.git
     ```
* **Why only you can do this:** Authentication with your personal GitHub account requires your personal access token or SSH key.

### Task U1.2: Environment Configuration Setup (`.env.local`)
* **What you do:**
  1. Verify the generated `.env.local` file in the project root.
  2. (Optional) Paste any private Helius RPC API key, Serper API key, or custom endpoints when ready. The project defaults to free public fallback endpoints out of the box with zero required payment.
* **Why only you can do this:** Prevents sensitive API keys or private RPC tokens from ever touching public chat logs or git commits.

---

## 3. Tasks Agent Will Code & Design (Component by Component)

Here is the exact step-by-step breakdown of every task your AI agent will build, feature by feature and function at a time:

| Task ID | Task Name | Primary Component / Output | Stack & Tools |
| :--- | :--- | :--- | :--- |
| **A1.1** | Package Manifest & Strict TypeScript Setup | `package.json`, `tsconfig.json`, `next.config.ts` | Next.js 15, React 19, TypeScript 5.5+ |
| **A1.2** | Electric Obsidian Design System & Tokens | `app/globals.css`, `tailwind.config.ts` / Tailwind v4 | Tailwind CSS, Lucide, CSS Variables |
| **A1.3** | Brand Asset Pipeline & Favicon Integration | `public/logo/*`, `app/icon.svg` | SVG optimization, brand vector lockups |
| **A1.4** | Dual-Rail Blockchain State Store | `lib/stores/useDualRailStore.ts` | Zustand, Solana web3.js, EVM client types |
| **A1.5** | Pinned Institutional Header Dock | `components/terminal/HeaderDock.tsx` | ReUI, Lucide, Radix UI Primitives |
| **A1.6** | Left Activity Dock Navigation Bar | `components/terminal/ActivitySidebar.tsx` | ReUI Tab Rails, Lucide Icons, Tooltips |
| **A1.7** | Bottom Telemetry & Health Status Strip | `components/terminal/StatusBar.tsx` | Monospace Telemetry, Tabular Figures |
| **A1.8** | Terminal Shell Layout & Canvas Container | `app/terminal/layout.tsx`, `app/terminal/page.tsx` | App Router, Dynamic Resizable Panes |
| **A1.9** | Localhost Dev Server Launch & Health Check | `http://localhost:3000/terminal` | Node 25, Next.js Turbopack |

---

## 4. Full Agent Execution Prompts for Phase 1 Tasks

Below is the complete, self-contained prompt for each task. You can trigger each prompt sequentially to build out the terminal component by component.

---

### Agent Prompt A1.1: Package Manifest & Strict TypeScript Setup

```markdown
### TASK INSTRUCTION: A1.1 Package Manifest & Strict TypeScript Setup
**Target Files:**
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `.gitignore`

**Goal:**
Initialize the Next.js 15 App Router environment in `c:\Users\ADMIN\Documents\trayse` with zero-cost open source dependencies, strict TypeScript typings, and Turbopack optimization.

**Technical Requirements:**
1. Configure `package.json` with exact stable versions:
   - Framework: `next@15.2.0` (or latest stable 15.x), `react@19.0.0`, `react-dom@19.0.0`.
   - Tooling: `typescript@^5.7.0`, `@types/node@^22.0.0`, `@types/react@^19.0.0`, `@types/react-dom@^19.0.0`.
   - UI & Icons: `lucide-react@^0.475.0`, `clsx@^2.1.1`, `tailwind-merge@^3.0.0`, `class-variance-authority@^0.7.1`.
   - Primitives: `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`, `@radix-ui/react-tabs`, `@radix-ui/react-slot`.
   - State & Data: `zustand@^5.0.0`, `@tanstack/react-query@^5.60.0`.
   - Blockchain Client Typings: `@solana/web3.js@^1.98.0`, `viem@^2.23.0`.
2. Configure `tsconfig.json` with strict mode:
   - `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`
   - Path alias: `"@/*": ["./*"]`
3. Configure `next.config.ts`:
   - Enable React Compiler / Turbopack rules.
   - Configure image domains for Polymarket and Kalshi asset icons if needed.
4. Create `.gitignore`:
   - Ignore `node_modules`, `.next`, `dist`, `.env*.local`, `.DS_Store`.

**Execution:**
Generate the configuration files, execute `npm install`, and verify that `npm run build` or Next.js validation passes without errors.
```

---

### Agent Prompt A1.2: Electric Obsidian Design System & Styling Tokens

```markdown
### TASK INSTRUCTION: A1.2 Electric Obsidian Design System & Styling Tokens
**Target Files:**
- `app/globals.css`
- `lib/utils.ts`

**Goal:**
Establish the institutional quantitative design system matching https://app.bullpen.fi and https://trade.0xmonaco.com/futures/BTC. Implement the Electric Obsidian theme, 1px hairline border tokens, tabular figures, and glass surface cards.

**Design System Specifications:**
1. Color Tokens (OKLCH and Hex variables in CSS root):
   - Void Background: `--background: #000000;` (pure OLED black)
   - Slate Surface: `--surface: #090A0E;`
   - Surface Elevated: `--surface-elevated: #12141C;`
   - Hairline Border: `--border: #1F232F;` / `--border-subtle: rgba(255, 255, 255, 0.08);`
   - Electric Mint (Accent/Up/Buy): `--mint: #00D688;` / `--mint-glow: #00FFA3;`
   - Crimson (Down/Sell/Warn): `--crimson: #F6465D;` / `--destructive: #DC2F35;`
   - Text Primary: `--foreground: #F2F4F5;`
   - Text Muted: `--muted: #868D95;`
   - Text Dim: `--dim: #586068;`
2. Typography & Fonts:
   - System Sans: Inter, Manrope, or Geist Sans for headings and navigation labels.
   - Monospace: Geist Mono, JetBrains Mono, or SF Mono for numbers.
   - Enforce `font-mono tabular-nums` utility across all prices, latencies, and spreads to eliminate layout jitter.
3. Micro-Interaction Classes:
   - `.hairline-border`: `1px solid var(--border)`
   - `.glass-dock`: `background: rgba(9, 10, 14, 0.85); backdrop-filter: blur(12px);`
   - `.ticker-pulse-green`: Subtle 2s pulse animation for live feeds.
   - `.tab-active-pill`: High-contrast pill indicator with smooth ease-out transitions (150ms).
4. Helper Utility:
   - Create `lib/utils.ts` with standard `cn(...inputs)` combining `clsx` and `tailwind-merge`.

**Execution:**
Write `app/globals.css` and `lib/utils.ts`. Verify styles apply cleanly with deep black canvas and no white flashes during page render.
```

---

### Agent Prompt A1.3: Brand Asset Pipeline & Favicon Integration

```markdown
### TASK INSTRUCTION: A1.3 Brand Asset Pipeline & Favicon Integration
**Target Files:**
- `public/logo/trayse-logo.svg`
- `public/logo/trayse-logotype.svg`
- `public/favicon.ico` / `app/icon.svg`

**Goal:**
Process and integrate the vector brand marks from `logo-asset/` into Next.js public assets, ensuring optimal SVG scaling, zero distortion at 16px/24px/32px dimensions, and proper browser tab branding.

**Asset Sources:**
- `logo-asset/trayse-logo.svg` -> `public/logo/trayse-logo.svg` (compact mark)
- `logo-asset/trayse-logotype.svg` -> `public/logo/trayse-logotype.svg` (full lockup)
- `logo-asset/trayse-typeface.svg` -> `public/logo/trayse-typeface.svg`

**Specifications:**
1. Copy or link SVG files into `public/logo/`.
2. Create `app/icon.svg` referencing the Trayse geometric diamond-shield icon with the Electric Mint gradient for browser tab favicons.
3. Ensure SVG elements have `vector-effect="non-scaling-stroke"` and explicit `viewBox` attributes for crisp rendering on retina displays.
4. Verify by checking `http://localhost:3000/logo/trayse-logotype.svg` directly in the browser.
```

---

### Agent Prompt A1.4: Dual-Rail Blockchain State Store

```markdown
### TASK INSTRUCTION: A1.4 Dual-Rail Blockchain State Store
**Target Files:**
- `lib/stores/useDualRailStore.ts`
- `lib/types/blockchain.ts`

**Goal:**
Build the client-side Zustand store tracking real-time status, wallet connectivity, and telemetry across the Dual-Rail architecture:
1. Solana Rail (SVM / Yellowstone gRPC / Swig Smart Wallets)
2. Robinhood Chain Rail (Nitro L2 / Chainlink Streams / Tokenized Equities)

**Type Definitions (`lib/types/blockchain.ts`):**
```typescript
export type ActiveRail = "solana" | "robinhood" | "dual";

export interface RailTelemetry {
  rail: "solana" | "robinhood";
  name: string;
  network: "mainnet" | "testnet" | "devnet";
  status: "connected" | "syncing" | "degraded" | "offline";
  latencyMs: number;
  blockHeight: number;
  tps: number;
  sequencerOrValidator: string;
}

export interface DualRailState {
  activeRail: ActiveRail;
  solanaTelemetry: RailTelemetry;
  robinhoodTelemetry: RailTelemetry;
  solanaWallet: {
    connected: boolean;
    publicKey: string | null;
    balanceUsdc: number;
    swigSessionActive: boolean;
  };
  robinhoodWallet: {
    connected: boolean;
    address: string | null;
    balanceUsdg: number;
    eip7702Authorized: boolean;
  };
  setActiveRail: (rail: ActiveRail) => void;
  updateTelemetry: (rail: "solana" | "robinhood", data: Partial<RailTelemetry>) => void;
  setSolanaWallet: (wallet: Partial<DualRailState["solanaWallet"]>) => void;
  setRobinhoodWallet: (wallet: Partial<DualRailState["robinhoodWallet"]>) => void;
}
```

**Implementation Details:**
- Build `useDualRailStore` using Zustand with lightweight updates and zero re-renders on unchanged fields.
- Include sensible default telemetry (e.g. Solana Yellowstone: `12ms`, Robinhood Nitro L2: `28ms`, status: `connected`) to power the terminal UI before live sockets connect.
```

---

### Agent Prompt A1.5: Pinned Institutional Header Dock Component

```markdown
### TASK INSTRUCTION: A1.5 Pinned Institutional Header Dock Component
**Target Files:**
- `components/terminal/HeaderDock.tsx`

**Goal:**
Design and implement the pinned top header dock matching the aesthetic of 0xMonaco and Bullpen.fi. This header serves as the institutional cockpit providing live telemetry, latency indicators, global prediction stats, and wallet controls.

**Visual Layout & Elements (Height: `48px` / `h-12`):**
1. **Left Brand Section:**
   - Trayse Logotype SVG (`height: 22px`, electric mint glow on hover).
   - Live Status Badge: Pulsing mint dot `●` with label `TRAYSE v1.0` in `text-[11px] font-mono tracking-wider text-zinc-400`.
   - Venue Status Pill: `Polymarket CLOB ● Kalshi v2` with active green indicators.
2. **Center Telemetry & Rail Indicators:**
   - **Solana Yellowstone Indicator:**
     - Icon: Zap or Activity icon (`lucide-react`).
     - Label: `SOL Yellowstone: 12ms` (`font-mono text-xs tabular-nums text-emerald-400`).
   - **Robinhood Nitro L2 Indicator:**
     - Icon: Shield or Cpu icon.
     - Label: `RH Nitro L2: 26ms` (`font-mono text-xs tabular-nums text-sky-400`).
   - **Global Stats Ticker:**
     - 24h Prediction Vol: `$14.8M`
     - Active Arb Opportunities: `3 Pairs (+4.2% Max)` in a subtle glowing mint badge.
3. **Right Controls Section:**
   - Rail Switcher Pill: Segmented toggle between `[Dual Rail | Solana SVM | RH L2]`.
   - Sound FX Toggle / Notification bell icon.
   - Multi-Chain Connect Wallet Button:
     - Styled with hairline border `#1F232F`, bg `#12141C`, hover: `#1F232F`.
     - Displays `Connect Multi-Chain` with mini Solana and EVM chain badges.

**UI/UX Guardrails:**
- Enforce `h-12 px-4 border-b border-[#1F232F] bg-[#000000]/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between select-none`.
- Zero cumulative layout shift (CLS).
```

---

### Agent Prompt A1.6: Left Activity Dock Navigation Bar

```markdown
### TASK INSTRUCTION: A1.6 Left Activity Dock Navigation Bar
**Target Files:**
- `components/terminal/ActivitySidebar.tsx`

**Goal:**
Construct the compact institutional activity sidebar inspired by professional trading software and 0xMonaco. Enables instant switching between terminal modules with hotkey tooltips and indicator badges.

**Visual Layout & Items (Width: `56px` / `w-14` collapsed or `200px` expandable):**
1. Navigation Tabs:
   - **Markets (`/terminal`):** Icon `LayoutGrid` or `TrendingUp`, tooltip `Cross-Platform Market Browser (Alt+1)`.
   - **Arb Radar (`/terminal/arbitrage`):** Icon `Zap` or `Compass`, tooltip `Real-Time Arbitrage Scanner (Alt+2)`, badge counter showing live spread count (e.g. `3`).
   - **Watchlists (`/terminal/watchlists`):** Icon `Star` or `Bookmark`, tooltip `Pinned Watchlists (Alt+3)`.
   - **Trade Journal (`/terminal/journal`):** Icon `BookOpen` or `FileText`, tooltip `Non-Custodial Journal & Notes (Alt+4)`.
   - **Dual Rail Health (`/terminal/telemetry`):** Icon `Radio` or `Cpu`, tooltip `Yellowstone & Nitro L2 Telemetry (Alt+5)`.
2. Bottom Sidebar Controls:
   - Quick Search trigger (`Cmd+K` / `Ctrl+K` shortcut badge).
   - Audio / Sound effects toggle.
   - Terminal Settings modal trigger (`Settings` icon).
3. Active State Styling:
   - Active tab has left 2px mint border bar (`border-l-2 border-[#00D688]`), elevated background `bg-[#12141C]`, text white.
   - Inactive tabs: `text-zinc-500 hover:text-zinc-200 hover:bg-[#090A0E] transition-colors duration-150`.
```

---

### Agent Prompt A1.7: Bottom Telemetry & Health Status Strip

```markdown
### TASK INSTRUCTION: A1.7 Bottom Telemetry & Health Status Strip
**Target Files:**
- `components/terminal/StatusBar.tsx`

**Goal:**
Build the bottom diagnostic status strip anchored at the bottom of the viewport (`h-7` / 28px). Displays vital heartbeat signals, feed uptime, memory footprint, and hackathon judging verification data.

**Visual Layout & Items:**
1. Left Heartbeat:
   - Connection status: `ENGINE: CONNECTED` with green signal dot.
   - Feed status: `POLYMARKET: 100% OK (SWR)` | `KALSHI: 100% OK (v2)`.
2. Center Diagnostics:
   - Ingest latency: `TAPE LAG: 42ms`.
   - Last Normalized Sync: `10:42:15 UTC (2s ago)` (`tabular-nums`).
3. Right Execution Rails:
   - Solana Slot: `Slot #312,481,902`.
   - Arbitrum Sequencer Block: `Block #268,140,211`.
   - Build Version: `v1.0.0-hackathon` | `Colosseum Fair 2026`.
4. Styling:
   - `h-7 px-3 border-t border-[#1F232F] bg-[#000000] text-[11px] font-mono text-zinc-500 flex items-center justify-between select-none`.
```

---

### Agent Prompt A1.8: Terminal Shell Layout Canvas & Modular Dock

```markdown
### TASK INSTRUCTION: A1.8 Terminal Shell Layout Canvas & Modular Dock
**Target Files:**
- `app/terminal/layout.tsx`
- `app/terminal/page.tsx`
- `app/layout.tsx`
- `app/page.tsx`

**Goal:**
Assemble all dock components into the persistent layout shell. The root route `/` redirects or links to `/terminal`, and `/terminal` displays the master high-density quantitative workspace with placeholder modular panels.

**Layout Architecture:**
```
┌────────────────────────────────────────────────────────────────────────┐
│               HeaderDock (h-12, sticky top, live telemetry)            │
├──────┬─────────────────────────────────────────────────────────────────┤
│      │                                                                 │
│ Act. │             Main Terminal Workspace Canvas                      │
│ Side │  ┌──────────────────────────────┬────────────────────────────┐  │
│ bar  │  │ Market Grid / Radar Panel    │ Order Depth & Arb Calc     │  │
│(w-14)│  │ (High-density tabular view)  │ (Side-by-side ladders)     │  │
│      │  └──────────────────────────────┴────────────────────────────┘  │
│      │                                                                 │
├──────┴─────────────────────────────────────────────────────────────────┤
│               StatusBar (h-7, sticky bottom, diagnostic strip)         │
└────────────────────────────────────────────────────────────────────────┘
```

**Implementation Steps:**
1. `app/layout.tsx`: Root HTML shell with dark theme class, metadata title `"Trayse Terminal | Institutional Prediction Market Intelligence"`, and monospace font configurations.
2. `app/terminal/layout.tsx`: Wraps children with `HeaderDock`, `ActivitySidebar`, and `StatusBar`, ensuring `h-screen overflow-hidden bg-black flex flex-col`.
3. `app/terminal/page.tsx`: Renders the default Phase 1 overview dashboard:
   - Live telemetry status cards.
   - Dual-rail connection readiness cards.
   - Placeholder market table layout showcasing the 0xMonaco/Bullpen high-density design language.
```

---

### Agent Prompt A1.9: Localhost Dev Server Launch & Health Check

```markdown
### TASK INSTRUCTION: A1.9 Localhost Dev Server Launch & Health Check
**Goal:**
Launch Next.js in development mode via Turbopack on `http://localhost:3000/terminal`, run automated health checks, verify zero compilation or hydration errors, and confirm that the localhost interface is active for real-time user monitoring.

**Execution Steps:**
1. Start `npm run dev` in background on port 3000.
2. Probe `http://localhost:3000/terminal` via HTTP request or browser tool.
3. Verify that response status is `200 OK` and key DOM elements (`HeaderDock`, `ActivitySidebar`, `StatusBar`) render accurately.
4. Report URL and live status to the user.
```

---

## 5. Sequential Execution Roadmap for Remaining Phases

Once Phase 1 is verified on localhost, the build proceeds sequentially into subsequent phases:

* **Phase 2:** Ingestion & Normalization Layer (Polymarket Gamma/CLOB + Kalshi Trade API v2 + SWR Cache + Fuzzy Entity Matcher).
* **Phase 3:** Cross-Platform Market Browser & Depth Ladder Modal (High-density table, live sorting, bid/ask depth comparison).
* **Phase 4:** Unified Watchlists & Custom Dashboards (Zustand LocalStorage persistence, 1-click star actions, filtered views).
* **Phase 5:** Real-Time Arbitrage Scanner Engine (Synthetic risk-free spread detector, net ROI after taker fees, instant trade cards).
* **Phase 6:** Trade Journal & CSV Audit Export (Non-custodial execution log, PnL calculator, 1-click CSV/JSON export).
* **Phase 7:** Performance Polish, Vercel Production Deploy & Hackathon Code Freeze (`trayse.vercel.app/terminal`).
