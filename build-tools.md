# Trayse Technical Stack & Build Tools Directory

> **Document Version:** 1.0.0  
> **Project Budget:** $0.00 (100% Free Tier, Open Source & Public Infrastructure)  
> **Target Release:** Colosseum Crypto World's Fair Hackathon (October 2026)  
> **Status:** Production Specification  

---

## Executive Summary

Trayse is built as an institutional-grade quantitative intelligence terminal without incurring infrastructure or licensing costs. Every tool selected in this matrix is either:
1. **100% Open Source (MIT / Apache-2.0)** with zero recurring fees.
2. **Free Developer Tier / Public API** providing generous rate limits well above hackathon prototype and MVP thresholds.
3. **Client-Side / Edge-Native** to eliminate costly centralized database and server hosting requirements.

The tools are categorized below into **Dev Tools** and **Blockchain Tools**, subdivided by their functional architecture.

---

# Part 1: Dev Tools

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DEV TOOLS TAXONOMY                            │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Design & UI Engineering     │ Open Design Desktop, Kroma MCP,       │
│                                │ ui-skills CLI, ReUI, Figma, Lucide    │
├────────────────────────────────┼───────────────────────────────────────┤
│ 2. Frontend Framework & Core   │ Next.js 15 (Turbopack), TypeScript,   │
│                                │ Tailwind CSS v4, Radix UI Primitives  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. State & Data Caching        │ Zustand, TanStack React Query v5,     │
│                                │ LocalStorage Persistence              │
├────────────────────────────────┼───────────────────────────────────────┤
│ 4. Prediction Data Ingestion   │ Polymarket Gamma/CLOB REST & WS,      │
│                                │ Kalshi Trade API v2, Next Edge SWR    │
├────────────────────────────────┼───────────────────────────────────────┤
│ 5. Hosting, CI/CD & Versioning │ Vercel (Hobby Tier), GitHub Public    │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

### 1. Design, UI Engineering & Prototyping

| Tool / Resource | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Open Design Desktop** | Free Local App | Rapid layout prototyping & JSX generation | Clones visual structures from inspirations (`0xMonaco`, `Sorin`) directly into base Tailwind components. |
| **Kroma MCP Server** (`@kromamcp/server`) | Free (Serper API free tier: 2,500 queries) | Agentic design intelligence, shader/component discovery | Integrates directly into the AI assistant to search live shadcn/Magic UI components, noise textures, and micro-effects without leaving the editor. |
| **`ui-skills` CLI** (`npx ui-skills`) | 100% Free (MIT) | Motion physics, component polish & hardware acceleration | Enforces Emil Kowalski’s Vercel/Sonner rules: hardware-accelerated CSS transforms, 150–250ms snappy animations, and tabular figure stability (`tabular-nums`). |
| **ReUI Components** (`reui.io`) | 100% Free / Open Source | Drop-in Radix UI + Tailwind primitives | Pre-built accessible components (segmented pills, bento cards, animated tabs) that match our dark theme with zero vendor lock-in. |
| **Figma** | Free Starter Tier | Vector brand identity prototyping | Used exclusively for brand marks, wordmarks, lockups, and exporting production SVGs (`trayse-logo.svg`, `trayse-logotype.svg`). |
| **Lucide Icons** (`lucide-react`) | 100% Free (ISC) | Scalable UI icons | High-performance tree-shakeable icons for terminal telemetry (charts, order books, latency indicators). |

---

### 2. Frontend Framework & Core Language

| Tool / Library | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Next.js 15 (App Router)** | 100% Free (MIT) | Full-stack web framework | Enables hosting both marketing landing page (`/`) and quant terminal (`/terminal`) in one project; provides Edge API Route Handlers for proxying exchange feeds with zero CORS. |
| **TypeScript 5.5+** | 100% Free (Apache-2.0) | Strict end-to-end type safety | Guarantees exact schemas for normalized order books, Polymarket tokens, Kalshi cents, and arbitrage spreads without runtime bugs. |
| **Tailwind CSS v4** | 100% Free (MIT) | Utility styling & OKLCH color system | Provides native support for smooth dark-mode color scales, custom OLED black tokens (`#000000`), and electric mint accents (`#00D688` / `#00FFA3`). |
| **Radix UI Primitives** (`@radix-ui/*`) | 100% Free (MIT) | Accessible headless primitives | Powers dialog modals, dropdowns, tooltips, and tab bars with full keyboard navigation and WAI-ARIA compliance. |

---

### 3. State Management, Data Caching & Persistence

| Tool / Library | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Zustand** | 100% Free (MIT) | Client state store & local persistence | Ultra-lightweight (1.1 kB), zero-boilerplate store with `persist` middleware for storing custom watchlists and trade journal entries in `localStorage`. Zero unnecessary re-renders. |
| **TanStack React Query v5** | 100% Free (MIT) | Server state management & cache invalidation | Manages background polling of exchange feeds, SWR (stale-while-revalidate) deduplication, and loading/error states across the UI. |

---

### 4. Prediction Market Ingestion & External APIs

| API / Endpoint | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Polymarket Gamma API** | 100% Free Public REST | Market discovery, metadata, 24h volume | Requires no API key; pulls all top active prediction contracts, end dates, and outcomes. |
| **Polymarket CLOB API** | 100% Free Public REST & WS | Real-time order book depth & live prices | Free public access to bids and asks ladders at `clob.polymarket.com/book`. |
| **Kalshi Trade API v2** | 100% Free Public REST | Regulated US event contracts & order books | Free public endpoints (`api.elections.kalshi.com`) for reading active market ticks and depth. |
| **Next.js Edge Proxy Handlers** | 100% Free (Vercel Edge) | Server-side API proxy & in-memory caching | Bypasses browser CORS restrictions on exchange APIs and caches responses for 5–10 seconds to protect against rate limits. |

---

### 5. Hosting, CI/CD & Version Control

| Service / Platform | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Vercel** | Free Hobby Tier | Global hosting, Edge functions, SSL | Zero cost, instant automatic deployments on Git push, global CDN, zero-config SSL certificates, serves `trayse.vercel.app` and `trayse.vercel.app/terminal`. |
| **GitHub** | Free Public Repository | Version control, collaboration & judging log | Provides transparent, verifiable Git commit timestamps required by Colosseum hackathon rules (§6 & §8). |

---

# Part 2: Blockchain Tools

```
┌────────────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN TOOLS TAXONOMY                         │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Solana Micro-Latency Rail   │ Yellowstone gRPC, @solana/web3.js,    │
│                                │ Helius/Triton Geyser, SPL Token       │
├────────────────────────────────┼───────────────────────────────────────┤
│ 2. Solana Automation & Risk    │ Swig Smart Wallets (@anagrambuild)    │
│                                │ Delegated Session Keys & Stop-Losses  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. Solana Distribution         │ Dialect Blinks, @solana/actions       │
│                                │ Shareable 1-click execution cards     │
├────────────────────────────────┼───────────────────────────────────────┤
│ 4. Robinhood Chain Macro Rail  │ Nitro L2 Sequencer WS, Stock Tokens,  │
│                                │ ethers.js / viem, RH Price API        │
├────────────────────────────────┼───────────────────────────────────────┤
│ 5. Oracles & Pricing           │ Chainlink Data Streams (Sub-second)   │
├────────────────────────────────┼───────────────────────────────────────┤
│ 6. EVM Account Abstraction     │ EIP-7702, Alchemy Paymaster Bundler   │
├────────────────────────────────┼───────────────────────────────────────┤
│ 7. Non-Custodial Wallets       │ @solana/wallet-adapter, wagmi/Privy   │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

### 1. Solana High-Frequency Execution & Market Tape (SVM Rail)

| Tool / SDK | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Yellowstone gRPC Client** (`@triton-one/yellowstone-grpc`) | 100% Free / Open Source | Sub-millisecond validator state streaming | Streams Geyser plugin account and transaction events over HTTP/2 Protobuf, eliminating 400ms–2000ms HTTP polling latency. |
| **Helius / Triton Free Dev Feeds** | Free Developer Tier | RPC & Geyser validator endpoints | Provides reliable devnet/mainnet connectivity for testing and hackathon demo evaluation. |
| **`@solana/web3.js`** | 100% Free (Apache-2.0) | Core Solana blockchain interaction | Transaction building, signing, serialization, and balance queries. |
| **`@solana/spl-token`** | 100% Free (Apache-2.0) | Token account manipulation | Manages USDC / USDG stablecoin token balances and transfer instructions. |

---

### 2. Solana Smart Accounts & Risk Automation

| Tool / Protocol | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Swig Smart Wallets** (`@anagrambuild/swig-ts`) | 100% Free / Open Source | Delegated session keys & on-chain guardrails | Allows algorithmic copytrading and automated stop-loss limit orders without user private key custody. Enforces daily spend limits, maximum order notional sizes, and 5% max drawdown circuit breakers on-chain. |

---

### 3. Actionable Social Distribution

| Tool / Standard | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Dialect Blinks & Solana Actions** (`@dialectlabs/blinks`, `@solana/actions`) | 100% Free (Apache-2.0) | Dynamic 1-click execution cards on X/Discord | Serializes live Trayse arbitrage findings into rich action URLs; users can execute trades directly from social feeds via Phantom/Backpack. |

---

### 4. Robinhood Chain Macro & Equities Rail (Arbitrum Nitro L2)

| Tool / Resource | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **ethers.js / viem** | 100% Free (MIT) | EVM client library | Interfaces with Robinhood Chain L2 smart contracts, handles ABI serialization, and queries balances. |
| **Robinhood Chain L2 Sequencer Feed** (`wss://feed.mainnet.chain.robinhood.com`) | Free Public WebSocket | Low-latency trade fills & state updates | Direct socket connection to the Arbitrum Nitro sequencer for instantaneous execution. |
| **Robinhood Stock Tokens** | Native L2 Contracts | Tokenized US equities (NVDA, SPY, AAPL) | Powers cross-asset statistical arbitrage by comparing tokenized stock moves against delayed prediction market contracts. |
| **Robinhood Pricing Endpoint** (`api.robinhood.com/rhj/prices`) | Free Public REST | Sub-second equity price benchmark | High-frequency equity quote feed to calculate statistical beta sensitivity against event contracts. |

---

### 5. High-Frequency Oracles & Price Feeds

| Tool / Protocol | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **Chainlink Data Streams** | Free Public Testnet / Dev Access | Sub-second high-frequency price feeds | Decentralized, low-latency oracle verification ensuring Trayse arbitrage models rely on tamper-proof reference prices. |

---

### 6. EVM Account Abstraction & Gasless Hedging

| Standard / Provider | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **EIP-7702** | Native Protocol Feature | Ephemeral smart contract execution for EOAs | Native to Robinhood Chain; lets standard user wallets execute batched transactions (Approve + Swap + Hedge) in a single atomic click. |
| **Alchemy Paymaster / Bundler** | Free Developer Tier | Sponsored & stablecoin gas settlement | Eliminates the need for users to hold native ETH for gas; fees are sponsored or paid directly in USDG/USDC. |

---

### 7. Non-Custodial Wallet Connectors

| Library | Cost / Tier | Function in Trayse | Why It's the Right Choice |
| :--- | :--- | :--- | :--- |
| **`@solana/wallet-adapter`** | 100% Free (Apache-2.0) | Standard Solana wallet integration | Connects Phantom, Backpack, and Solflare wallets for signing Solana transactions and authorizing Swig sessions. |
| **Privy / RainbowKit** | Free Developer Tier | Embedded & external EVM wallet connector | Frictionless onboarding for Robinhood Chain with email/social logins or MetaMask/Rabby connection. |

---

## 3. Financial Summary: Total Project Cost

| Category | Monthly Cost | Hackathon Sprint Cost | Production Scaling Cost |
| :--- | :--- | :--- | :--- |
| **Frontend & Backend Hosting (Vercel)** | \$0.00 | \$0.00 | \$0.00 (Hobby tier is free indefinitely) |
| **Domain & SSL Certificates** | \$0.00 | \$0.00 | \$0.00 (Uses `trayse.vercel.app`) |
| **Prediction Data APIs (Polymarket & Kalshi)** | \$0.00 | \$0.00 | \$0.00 (Public REST & WebSockets) |
| **Design Tools (Kroma MCP, ReUI, Figma, Lucide)** | \$0.00 | \$0.00 | \$0.00 (Free tiers & open source) |
| **Solana Tools (Yellowstone gRPC, Swig, Blinks)** | \$0.00 | \$0.00 | \$0.00 (Open-source SDKs & free dev RPCs) |
| **Robinhood Chain Tools (Nitro L2, EIP-7702, RH API)** | \$0.00 | \$0.00 | \$0.00 (Public testnet/devnet endpoints) |
| **Total Expenditure** | **\$0.00** | **\$0.00** | **\$0.00** |

---

## 4. Verification & Best Practices for Hackathon Development

1. **Zero Secret Leaks:** Keep all free API keys (Serper API, RPC endpoint tokens) strictly in `.env.local`. Never commit `.env` files to public GitHub repositories.
2. **Deterministic Versioning:** All npm packages should use exact versions in `package.json` to prevent dependency breakage during CI/CD builds on Vercel.
3. **No Unnecessary Infrastructure:** Avoid standing up independent database instances (e.g., PostgreSQL, Redis) during the MVP sprint. Trayse’s architecture leverages local persistent storage (Zustand + `localStorage`) and Edge SWR caching, which are faster, 100% private, and completely free.
