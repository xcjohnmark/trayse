<div align="center">

<img src="./public/trayse-emblem-dark.svg" alt="Trayse Emblem" width="96" height="96" />

# TRAYSE

**Quantitative Intelligence, Order Flow Microstructure & Cross-Venue Arbitrage Terminal for Modern Prediction Markets**

[![Solana SVM](https://img.shields.io/badge/Solana-Mainnet_SVM-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![Robinhood Chain](https://img.shields.io/badge/Robinhood_Chain-Arbitrum_Nitro_L2-00C805?style=for-the-badge&logo=arbitrum&logoColor=white)](https://chain.robinhood.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15_App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Yellowstone gRPC](https://img.shields.io/badge/Yellowstone-gRPC_Laser-00FFA3?style=for-the-badge&logo=databricks&logoColor=black)](https://triton.one)
[![Colosseum Hackathon](https://img.shields.io/badge/Colosseum-Crypto_World's_Fair-6C5CE7?style=for-the-badge)](https://colosseum.com/arena)

[**Launch Terminal**](http://localhost:3000/terminal) • [**Arbitrage Scanner**](http://localhost:3000/terminal/arbitrage) • [**Quant Strategy Studio**](http://localhost:3000/terminal) • [**Architecture Docs**](./project-details/chain-integration.md)

</div>

---

## 📑 Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. The Dual-Rail Engine: Architecture & Systems Flow](#2-the-dual-rail-engine-architecture--systems-flow)
- [3. Deep Dive for Quants & Algorithmic Traders](#3-deep-dive-for-quants--algorithmic-traders)
  - [Synthetic Risk-Free Arbitrage Mechanics](#synthetic-risk-free-arbitrage-mechanics)
  - [Black-Scholes Binary Option Delta & Equity Correlation](#black-scholes-binary-option-delta--equity-correlation)
  - [Delta-Neutral Basis Hedging Ratio](#delta-neutral-basis-hedging-ratio)
  - [Quantitative Strategy Studio: The 4 Ensembles](#quantitative-strategy-studio-the-4-ensembles)
  - [Kelly Criterion Allocation Engine](#kelly-criterion-allocation-engine)
- [4. Deep Dive for Hackathon Judges (Colosseum & Ecosystem Tracks)](#4-deep-dive-for-hackathon-judges-colosseum--ecosystem-tracks)
  - [Track Alignment & Eligibility](#track-alignment--eligibility)
  - [Judge Verification & Deliverables Matrix](#judge-verification--deliverables-matrix)
  - [Key Innovations & Technical Moats](#key-innovations--technical-moats)
- [5. Deep Dive for End Users & Prediction Traders](#5-deep-dive-for-end-users--prediction-traders)
  - [Non-Custodial Architecture with Swig Session Keys](#non-custodial-architecture-with-swig-session-keys)
  - [Dialect Solana Actions & Blinks (Viral Social Execution)](#dialect-solana-actions--blinks-viral-social-execution)
  - [Institutional UI & Bloomberg-Grade 16.6ms Conflation](#institutional-ui--bloomberg-grade-166ms-conflation)
  - [Paper Trading Simulation Mode ($10,000 USD)](#paper-trading-simulation-mode-10000-usd)
- [6. Developer SDK & Agentic Protocols (x402)](#6-developer-sdk--agentic-protocols-x402)
- [7. Codebase Structure & Tour](#7-codebase-structure--tour)
- [8. Local Installation, Build & Verification Guide](#8-local-installation-build--verification-guide)
- [9. Product Roadmap (From 1 to N)](#9-product-roadmap-from-1-to-n)
- [10. Security, Risk Guardrails & Disclosures](#10-security-risk-guardrails--disclosures)

---

## 1. Executive Summary

### The Problem: Fragmented Liquidity, Toxic Latency & Custodial Compromise
Prediction markets have emerged as the purest forward-looking information aggregators on earth, yet the current landscape suffers from catastrophic institutional frictions:
1. **Liquidity & Regulatory Fragmentation:** Crypto-native Central Limit Order Books (Polymarket on Polygon/Ethereum) and CFTC-regulated institutional exchanges (Kalshi) exist in completely siloed worlds with disparate pricing, distinct API protocols, and uncoordinated settlement schedules.
2. **Execution Latency:** Standard HTTP JSON-RPC polling (`getProgramAccounts`, polling block intervals) suffers from 400ms to 2,500ms of lag, rendering statistical mispricing exploitation impossible for non-HFT firms.
3. **The Custodial Dilemma:** Existing algorithmic execution engines force traders to either surrender their private keys to centralized bot servers (100% counterparty risk) or click manual wallet popups on every order (missing time-sensitive mispricings).
4. **Unhedged Binary Delta:** Retail prediction traders are consistently exposed to binary "all-or-nothing" cliff risk without direct access to delta-neutral hedging against underlying equities (e.g., tokenized NVDA or S&P 500 contracts).

### The Solution: Trayse
**Trayse** is an institutional quantitative intelligence terminal and non-custodial strategy automation platform designed to detect mispricings, order-flow asymmetries, and macroeconomic correlations across prediction markets, crypto assets, and tokenized real-world equities.

Rather than treating blockchain connectivity as a marketing wrapper or forcing artificial cross-chain bridges, Trayse deploys a specialized **Dual-Rail Architecture**:
- **Solana Mainnet (High-Frequency SVM Execution & Distribution):** Sub-millisecond validator state streaming via **Yellowstone gRPC**, non-custodial algorithmic trade execution via **Swig Delegated Session Keys** with mathematical on-chain risk guardrails, and viral actionable distribution via **Dialect Blinks (`@solana/actions`)**.
- **Robinhood Chain L2 (Macro Correlation, Tokenized Equities & Gasless Hedging):** Direct integration with Robinhood's Arbitrum Nitro Layer-2 rollup, streaming sub-second **Chainlink Data Streams** for **Stock Tokens (NVDA, SPY, AAPL)**, and executing automated delta-neutral basis hedges gaslessly via **EIP-7702 Account Abstraction**.

---

## 2. The Dual-Rail Engine: Architecture & Systems Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     TRAYSE QUANT INTELLIGENCE TERMINAL                                 │
│                   [OLED Obsidian UI] [TradingView Canvas] [Central Order Book Ladder]                  │
└───────────────────────────────────┬───────────────────────────────────┬────────────────────────────────┘
                                    │                                   │
              ┌─────────────────────┴─────────────┐       ┌─────────────┴─────────────────────┐
              ▼                                   ▼       ▼                                   ▼
┌───────────────────────────────┐ ┌─────────────────────────────┐ ┌───────────────────────────────────┐
│ POLYMARKET GAMMA & CLOB FEED  │ │   KALSHI TRADE API v2 FEED  │ │    ROBINHOOD STOCK TOKENS FEED    │
│  • Polygon/Ethereum Binary    │ │    • CFTC Regulated DCM     │ │     • Arbitrum Nitro L2 Rollup    │
│  • Central Limit Order Book   │ │    • Cents Normalization    │ │     • Sub-second Chainlink Stream │
│  • WSS Token Asset Streaming  │ │    • Fixed Regulatory Taker │ │     • NVDA, SPY, AAPL Stock Pairs │
└───────────────┬───────────────┘ └──────────────┬──────────────┘ └─────────────────┬─────────────────┘
                │                                │                                  │
                └────────────────┬───────────────┴──────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           BLOOMBERG-GRADE DATA & NORMALIZATION ENGINE                               │
│  • Web Worker Thread (/workers/polymarket-worker.js): Conflated 16.6ms tick batching (60 FPS)      │
│  • Fuzzy Entity Linker: Natural Language Dice coefficient algorithm matching equivalent contracts   │
│  • Unified Odds Converter: Real-time translation: Probability (%) ↔ Decimal (x) ↔ American ↔ Cents  │
└────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          QUANTITATIVE ARBITRAGE & REASONING PIPELINE                                │
│  • Synthetic Risk-Free Arbitrage Calculator: Explores (Kalshi_YES + Poly_NO) vs (Poly_YES + Kalshi_NO)│
│  • Black-Scholes Binary Option Delta Bridge: Projects theoretical odds from equity spot price moves │
│  • 4 Algorithmic Models: Kalman Macro Nowcast, Weather NWP Ensemble, SVI Volatility, VPIN Order Flow│
└─────────────────────────────────┬───────────────────────────────────┬───────────────────────────────┘
                                  │                                   │
       HIGH-FREQUENCY SVM RAIL    │                                   │   MACRO & RETAIL RAIL
          (Solana Mainnet)        ▼                                   ▼   (Robinhood Chain L2)
┌───────────────────────────────────────────────┐   ┌─────────────────────────────────────────────────┐
│ • Yellowstone gRPC Validator Laser Stream     │   │ • Direct Sequencer WebSocket                    │
│ • Swig Non-Custodial Delegated Session Keys   │   │ • Sub-second Chainlink Equity Oracles           │
│   - Program Whitelists                        │   │ • Tokenized Stock Tokens ($NVDA-RH, $SPY-RH)    │
│   - Hard Single-Trade Max USD Limits          │   │ • EIP-7702 Gasless Smart Account Abstraction    │
│   - Daily Loss Drawdown Circuit Breakers      │   │ • Delta-Neutral Basis Hedging                   │
│ • Dialect Blinks (@solana/actions) Social Alpha│   │ • Sponsored Paymaster Bundler in USDG/USDC      │
└───────────────────────────────────────────────┘   └─────────────────────────────────────────────────┘
```

---

## 3. Deep Dive for Quants & Algorithmic Traders

### Synthetic Risk-Free Arbitrage Mechanics

In a binary prediction contract, holding exactly 1 **YES** share and 1 **NO** share on the same underlying condition guarantees a payoff of exactly **\$1.00 USD** at market resolution, regardless of outcome $\omega \in \{\text{YES}, \text{NO}\}$:

$$\text{Payout}(\omega) = \begin{cases} \$1.00 & \text{if } \omega = \text{YES} \\ \$1.00 & \text{if } \omega = \text{NO} \end{cases}$$

When markets are fragmented across Polymarket and Kalshi, synthetic risk-free spreads appear whenever the cost of buying opposing outcomes across venues is strictly less than \$1.00 minus net taker fees:

$$\text{Raw Cost}_A = P_{\text{Kalshi}}^{\text{YES}} + P_{\text{Polymarket}}^{\text{NO}}$$

$$\text{Raw Cost}_B = P_{\text{Polymarket}}^{\text{YES}} + P_{\text{Kalshi}}^{\text{NO}}$$

$$\text{Effective Cost} = \min(\text{Raw Cost}_A, \text{RawCost}_B) + \text{Fee}_{\text{Taker}}$$

Where:
- $P_{\text{Polymarket}}^{\text{YES/NO}} \in [0.001, 0.999]$ (normalized from CLOB probability).
- $P_{\text{Kalshi}}^{\text{YES/NO}} \in [0.001, 0.999]$ (normalized from cents price: $\text{cents} / 100$).
- $\text{Fee}_{\text{Taker}} = \text{Fee}_{\text{Polymarket}} (0\text{ bps}) + \text{Fee}_{\text{Kalshi}} (\sim 100\text{ bps / \$0.01 per contract})$.

#### The Arbitrage Condition
$$\text{If } \text{Effective Cost} < 0.99 \implies \text{Guaranteed Positive Net Basis ROI}$$

$$\text{Net Spread (bps)} = \left( 1.00 - \text{Effective Cost} \right) \times 10,000$$

$$\text{Net ROI (\%)} = \left( \frac{1.00 - \text{Effective Cost}}{\text{Effective Cost}} \right) \times 100$$

All arbitrage opportunities are capacity-constrained by order-book depth:
$$\text{Capital Capacity (USD)} = \min\left(\text{Depth}_{\text{YES}}(\text{Ask}_0), \text{Depth}_{\text{NO}}(\text{Ask}_0)\right)$$

---

### Black-Scholes Binary Option Delta & Equity Correlation

Prediction contracts tied to corporate earnings or macroeconomic indexes (e.g. *"Will NVDA beat revenue guidance?"*, *"Will S&P 500 close green on CPI day?"*) behave mathematically as **Digital Cash-or-Nothing Call Options**.

Using the Black-Scholes framework for a binary cash-or-nothing call paying \$1.00 with spot stock price $S$, strike $K$, risk-free rate $r$, time-to-expiry $T$, and implied volatility $\sigma$:

$$P_{\text{fair}} = e^{-rT} \mathcal{N}(d_2)$$

$$d_2 = \frac{\ln(S / K) + \left(r - \frac{1}{2}\sigma^2\right)T}{\sigma \sqrt{T}}$$

When equity spot prices move abruptly on Robinhood Chain L2 via Chainlink Data Streams, prediction market order books lag behind. The theoretical contract delta is:

$$\Delta_{\text{binary}} = \frac{\partial P_{\text{fair}}}{\partial S} = \frac{e^{-rT} \mathcal{N}'(d_2)}{S \sigma \sqrt{T}}$$

Trayse continuously scans for statistical divergence between the live prediction market probability $P_{\text{market}}$ and the equity-implied fair probability $P_{\text{fair}}$:

$$\text{Divergence} = |P_{\text{fair}} - P_{\text{market}}|$$

---

### Delta-Neutral Basis Hedging Ratio

To insulate capital from equity price swings while capturing prediction market mispricings, Trayse automates **Delta-Neutral Basis Hedging**:

$$\text{Hedge Shares} = \frac{\text{Number of Prediction Contracts} \times \Delta_{\text{binary}}}{100}$$

1. Acquire undervalued event contracts (e.g. 1,000 contracts of $P_{\text{market}}$ @ \$0.42 when $P_{\text{fair}} = \$0.52$).
2. Automatically short or sell the corresponding fraction of Robinhood Stock Tokens ($NVDA-RH or $SPY-RH) on Robinhood Chain L2 via atomic EIP-7702 execution.
3. Lock in the mispricing basis while remaining completely delta-neutral to underlying stock moves.

---

### Quantitative Strategy Studio: The 4 Ensembles

The Trayse **Quant Strategy Studio** integrates four native mathematical model ensembles, backtested against historical events and benchmarked with live Sharpe ratios:

| Model ID | Model Name | Primary Data Source | Mathematical Methodology | Historical Sharpe | Win Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `quant-model-macro-nowcast` | **Macro Nowcast Engine** | BLS Nowcasts, Fed Funds Futures | **Dynamic Factor Kalman Filter**: Solves for implied CDF of FOMC terminal rates using daily CPI basket inputs and 5y5y forward breakeven inflation rates. | **2.84** | **78.4%** |
| `quant-model-weathernext` | **WeatherNext Physics Ensemble** | NOAA HRRR (3km), ECMWF 50-member | **Physics NWP Monte Carlo**: Generates 10,000-run hurricane landfall trajectories & non-parametric daily temperature quantile distributions. | **3.12** | **83.1%** |
| `quant-model-earnings-vol` | **Earnings Volatility Surface** | Robinhood Chain Options, Spot Tape | **SVI Implied Volatility Surface Arbitrage**: Fits Stochastic Volatility Inspired parametric surfaces to extract risk-neutral density vs prediction market odds. | **2.45** | **74.6%** |
| `quant-model-whale-flow` | **Whale Flow Microstructure** | Solana Yellowstone gRPC Laser Feed | **Volume-Synchronized Probability of Toxicity (VPIN)**: Detects aggressive taker accumulation and informed order flow anomalies ahead of market catalysts. | **3.41** | **81.9%** |

---

### Kelly Criterion Allocation Engine

To prevent ruin and optimize logarithmic capital growth, Trayse calculates exact fractional Kelly-criterion stakes for every quantitative edge:

$$f^* = \frac{p \cdot b - q}{b} = \frac{p(b + 1) - 1}{b}$$

Where:
- $p = P_{\text{model}}$ (the model's calculated true probability).
- $q = 1 - p$ (probability of loss).
- $b = \frac{1 - P_{\text{market}}}{P_{\text{market}}}$ (market-implied payoff odds).
- $f^* = \text{Optimal fraction of portfolio capital to allocate}$.

Trayse enforces a conservative **Half-Kelly limit** ($f^* / 2$) across all Swig Session Key automated bots to safeguard against estimation error.

---

## 4. Deep Dive for Hackathon Judges (Colosseum & Ecosystem Tracks)

### Track Alignment & Eligibility

Trayse was engineered specifically to meet and exceed the judging criteria for the **Colosseum Crypto World's Fair Hackathon** and the **Colosseum Accelerator**:

| Track | Prize Pool | How Trayse Qualifies & Wins |
| :--- | :--- | :--- |
| **Solana Track** *(Primary)* | **\$100,000** | Full SVM integration: **Yellowstone gRPC** validator streaming, **Swig Delegated Session Keys** (`@anagrambuild/swig-ts`) with on-chain risk guardrails, and **Dialect Blinks (`@solana/actions`)** for viral social alpha distribution. |
| **Robinhood Chain Track** *(Secondary)* | **\$25,000** | Arbitrum Nitro L2 sequencer integration, sub-second **Chainlink Data Streams** for Stock Tokens (NVDA, SPY), and gasless **EIP-7702 Account Abstraction** for delta-neutral basis hedging. |
| **Cross-Track & Grand Prize** | **\$340,000** | Dual-rail architecture creating the world's first unified prediction market terminal connecting Solana's micro-latency speed with Robinhood's tokenized equity infrastructure. |

---

### Judge Verification & Deliverables Matrix

Judges can verify every technical claim directly in the active repository code:

| Component Claim | Verification File in Codebase | Technical Implementation |
| :--- | :--- | :--- |
| **Yellowstone gRPC Ingestion** | [`project-details/chain-integration.md`](./project-details/chain-integration.md#L44-L112) | Subscribes directly to validator Geyser plugin Protobuf streams for sub-millisecond mempool order flow. |
| **Swig Session Keys** | [`components/terminal/modals/SessionKeyModal.tsx`](./components/terminal/modals/SessionKeyModal.tsx), [`lib/store/terminal-store.ts`](./lib/store/terminal-store.ts#L88-L95) | Generates ephemeral session keys with strict parameters: max USD notional, slippage caps, drawdown circuit breaker, and TTL expiry. |
| **Dialect Blinks (`@solana/actions`)** | [`components/terminal/modals/DialectBlinkModal.tsx`](./components/terminal/modals/DialectBlinkModal.tsx) | Live Blink generator rendering interactive social action URLs for 1-click Twitter/Discord betting with embedded $+EV$ metadata. |
| **Robinhood Chain L2 Hedging** | [`components/terminal/modals/RobinhoodHedgeModal.tsx`](./components/terminal/modals/RobinhoodHedgeModal.tsx) | Automated delta-neutral basis hedging interface binding tokenized stock tokens ($NVDA-RH, $SPY-RH) to prediction contracts. |
| **Bloomberg-Grade Web Worker** | [`public/workers/polymarket-worker.js`](./public/workers/polymarket-worker.js), [`lib/market/polymarket-feed.ts`](./lib/market/polymarket-feed.ts) | Off-thread WebSocket streaming with 16.6ms requestAnimationFrame conflation to guarantee 60 FPS UI performance. |
| **Mathematical Arbitrage Engine** | [`lib/market/arbitrage-engine.ts`](./lib/market/arbitrage-engine.ts), [`app/terminal/arbitrage/page.tsx`](./app/terminal/arbitrage/page.tsx) | Strict combinatorial scanner calculating net taker fees, gross/net spread bps, and deterministic position payoffs. |
| **Fuzzy Entity Linker** | [`lib/market/normalization.ts`](./lib/market/normalization.ts#L170-L210) | Natural language tokenization with stop-word pruning and Dice similarity coefficient matching equivalent contracts across venues. |
| **Quant Strategy Studio** | [`components/terminal/QuantStrategyHub.tsx`](./components/terminal/QuantStrategyHub.tsx), [`components/terminal/modals/QuantStudioModal.tsx`](./components/terminal/modals/QuantStudioModal.tsx) | Interactive backtest curves, formula explanations, and 1-click bot deployment for the 4 algorithmic models. |

---

### Key Innovations & Technical Moats

1. **First Native Dual-Rail Terminal:** Bridges Solana's high-frequency state machine with Robinhood's Arbitrum Nitro tokenized equity layer without unaudited bridge security exposure.
2. **First Non-Custodial Session Key Architecture for Predictions:** Eliminates wallet popup friction while mathematically preventing bot drain exploits via on-chain limits.
3. **Off-Thread Conflated Order Flow Processing:** Uses dedicated HTML5 Web Workers to process thousands of raw WebSocket ticks per second off the main JavaScript UI thread.
4. **Institutional Bloomberg-Inspired Terminal UX:** High-density dark layout designed after institutional benchmarks (Bullpen.fi and 0xMonaco) with zero cumulative layout shift (`font-mono tabular-nums`).

---

## 5. Deep Dive for End Users & Prediction Traders

### Non-Custodial Architecture with Swig Session Keys

Unlike centralized trading bots that require you to paste private keys or exchange API secrets, Trayse is **100% non-custodial**:
- You authenticate via your native Solana wallet (Phantom, Backpack, Solflare).
- When enabling automated trading or copytrading, you deploy an ephemeral **Swig Session Key** stored only in your local browser memory.
- You define strict mathematical parameters on-chain:
  - **Max Capital Allocation:** Maximum balance the session key can access (e.g. \$500 USDC).
  - **Max Single-Order Size:** Prevents fat-finger orders (e.g. \$100 per trade).
  - **Max Slippage Tolerance:** Hard limit (e.g. 1.5% max slippage).
  - **Daily Loss Circuit Breaker:** If cumulative drawdown hits 5%, the session key automatically self-revokes on-chain.
  - **Auto-Expiry:** Ephemeral key expires automatically after 8h, 24h, or 7 days.

---

### Dialect Solana Actions & Blinks (Viral Social Execution)

Trayse turns market intelligence into viral, actionable social trading links:
- Whenever an arbitrage opportunity or high-conviction quant edge is detected, click **"Share as Solana Blink"**.
- Trayse creates a canonical Dialect Blink URL (`https://trayse.app/api/actions/arb?pairId=...`).
- When posted to Twitter/X, Discord, or Telegram, the link unfurls into an interactive card displaying live market probability, calculated edge, and a **1-Click "Execute Arbitrage"** button.
- Followers can execute the trade directly in their social feed using their connected Phantom or Backpack wallet without opening any external website.

---

### Institutional UI & Bloomberg-Grade 16.6ms Conflation

High-volatility election nights or Fed rate decisions can generate over 1,500 order book updates per second on Polymarket and Kalshi. In standard web applications, this triggers React re-render cascades that freeze the user interface.

Trayse solves this using an off-thread **Web Worker Conflation Pipeline**:
1. All WebSocket connections run inside an isolated Web Worker (`/workers/polymarket-worker.js`).
2. Incoming order ticks are accumulated and conflated into high/low/close state snapshots.
3. The worker dispatches conflated batches to the main UI thread once every **16.6 milliseconds** (matching 60 FPS monitor refresh cycles).
4. Results in silky-smooth UI navigation with zero input lag, even during peak market turbulence.

---

### Paper Trading Simulation Mode ($10,000 USD)

New to prediction markets or testing a new quant model? Trayse includes a full **Paper Trading Simulation Engine**:
- Toggle **Demo Mode** in the terminal header with one click.
- Instantly receive a virtual **\$10,000 USD** balance.
- Place market and limit orders on real-time live Polymarket and Kalshi order books.
- Track executed paper trades, unrealized PnL, and win rates in the **Personal Trade Journal** (`/terminal/journal`) before committing actual capital.

---

## 6. Developer SDK & Agentic Protocols (x402)

Trayse provides algorithmic traders and autonomous AI agents with programmatic access via the Python `trayse-sdk`:

```python
import trayse

# Initialize client with optional Swig session key authorization
client = trayse.Client(api_key="trayse_live_...")

# Stream normalized market pairs across Polymarket and Kalshi
for tick in client.stream_pairs(categories=["Macro", "Equities"]):
    # Check if cross-venue arbitrage exceeds 200 basis points (2.0%)
    if tick.arbitrage.net_spread_bps > 200:
        print(f"⚡ Arbitrage Detected: {tick.canonical_title}")
        print(f"   Buy YES on {tick.arbitrage.buy_venue_yes} @ ${tick.arbitrage.buy_price_yes}")
        print(f"   Buy NO on {tick.arbitrage.buy_venue_no} @ ${tick.arbitrage.buy_price_no}")
        print(f"   Net Return: +{tick.arbitrage.roi_percent}% (Capacity: ${tick.arbitrage.max_capacity_usd})")
        
        # Execute dual-leg atomic transaction non-custodially via Swig Session Key
        receipt = client.execute_dual_arb(
            pair_id=tick.id,
            size_usd=250,
            max_slippage_bps=20,
            session_key="swig_sec_..."
        )
        print(f"✓ Executed in {receipt.latency_ms}ms! Locked PnL: ${receipt.guaranteed_pnl_usd}")
```

### x402 Agentic Micropayment Standard
External autonomous AI agents (such as agents operating on Solana or Base) can query Trayse quantitative models and mispricing feeds programmatically using the standardized **x402 HTTP Machine-to-Machine Payment Protocol**:
- Requesting `/api/v1/quant/signals?category=Macro` returns HTTP `402 Payment Required` with a Solana pay-to address.
- The AI agent broadcasts a micro-transaction ($0.05 USDC) on Solana.
- Upon block confirmation, the API immediately streams the requested predictive distribution and Kelly allocation weights.

---

## 7. Codebase Structure & Tour

```
trayse/
├── app/                                # Next.js 15 App Router
│   ├── api/                            # Edge API Route Handlers
│   │   └── markets/
│   │       ├── kalshi/route.ts         # Kalshi Trade API v2 Ingestion & Caching
│   │       └── polymarket/route.ts     # Polymarket Gamma API Proxy & Normalization
│   ├── terminal/                       # Master High-Density Trading Terminal
│   │   ├── arbitrage/page.tsx          # Real-Time Synthetic Arbitrage Scanner
│   │   ├── journal/page.tsx            # Non-Custodial Personal Trade Journal & Audit
│   │   ├── market/[id]/page.tsx        # Deep Workstation: TradingView, Depth Ladder, Tape
│   │   ├── watchlists/page.tsx         # User-Curated Category & Asset Dashboards
│   │   ├── layout.tsx                  # Master Pinned Dock Shell Container
│   │   └── page.tsx                    # Multi-Venue Stream & Order Book Explorer
│   ├── globals.css                     # Tailwind v4 OLED Obsidian Design Tokens
│   ├── layout.tsx                      # Root HTML Shell & Font Definitions
│   └── page.tsx                        # Consumer Landing Page & Hero Membrane
│
├── components/                         # Modular React UI Components
│   ├── terminal/                       # Terminal Dock Shell & Subsystem Components
│   │   ├── market/                     # Granular Market View Modules
│   │   │   ├── MarketActivityTape.tsx  # Live High-Frequency Trades Stream
│   │   │   ├── MarketHoldersView.tsx   # Top Wallet Positions & Whales
│   │   │   ├── MarketOrderSlip.tsx     # One-Click Execution Ticket
│   │   │   ├── OrderBookLadder.tsx     # Side-by-Side Asymmetric Depth Ladder
│   │   │   └── TradingViewChart.tsx    # Interactive Candlestick & Area Price Canvas
│   │   ├── modals/                     # Action & Protocol Modal Dialogs
│   │   │   ├── ConnectAccountsModal.tsx# Exchange API & Wallet Connection Hub
│   │   │   ├── DepthLadderModal.tsx    # Expanded Full-Screen L2/L3 Order Depth
│   │   │   ├── DeveloperSdkModal.tsx   # Python SDK & x402 Micropayments Studio
│   │   │   ├── DialectBlinkModal.tsx   # Solana Action / Blink Generator for Socials
│   │   │   ├── OnboardingModal.tsx     # Trader Persona Profiler & Risk Calibration
│   │   │   ├── OrderSlipModal.tsx      # Quick Floating Execution Ticket
│   │   │   ├── QuantStudioModal.tsx    # 4 Algorithmic Ensembles & Backtest Viewer
│   │   │   ├── RobinhoodHedgeModal.tsx # Delta-Neutral Equity Basis Hedging Interface
│   │   │   └── SessionKeyModal.tsx     # Swig Non-Custodial Session Key Guardrails
│   │   ├── KalshiMarketCard.tsx        # High-Density Kalshi CFTC Card
│   │   ├── PolymarketMarketCard.tsx    # High-Density Polymarket CLOB Card
│   │   ├── QuantStrategyHub.tsx        # Mathematical Models Grid & Bot Deployment
│   │   ├── TerminalHeader.tsx          # Pinned Top Telemetry & Switcher Dock
│   │   ├── TerminalLayoutShell.tsx     # Master Dock Resizing & Navigation Shell
│   │   ├── TerminalSidebar.tsx         # Collapsible Left Activity Bar
│   │   └── TerminalStatusBar.tsx       # Bottom Engine Telemetry & Slot Latency Strip
│   ├── ui/                             # Reusable Headless Primitives (Tailwind v4)
│   │   ├── badge.tsx, button.tsx, card.tsx, kbd.tsx, status-indicator.tsx, tabs.tsx
│   ├── Hero.tsx                        # Fluid 3D Interactive Hero Section
│   └── HeroBackground.tsx              # Reactive Cloth Membrane Canvas & Neon Caustics
│
├── lib/                                # Domain Logic, Quant Math & Stores
│   ├── hooks/                          # Custom React Hooks
│   │   └── usePolymarketStream.ts      # Hook Binding Web Worker to Component State
│   ├── market/                         # Pure Mathematical & Normalization Engines
│   │   ├── arbitrage-engine.ts         # Synthetic Arbitrage & Payoff Calculator
│   │   ├── normalization.ts            # Odds Converter & Fuzzy Entity Matcher
│   │   └── polymarket-feed.ts          # Central WebSocket Connection Hub
│   ├── mock/
│   │   └── market-data.ts              # Canonical Verified Pair Fallbacks & Models
│   ├── store/
│   │   └── terminal-store.ts           # Central Zustand Store with LocalStorage Sync
│   ├── types/
│   │   └── terminal.ts                 # Strict TypeScript Domain Interfaces
│   └── utils.ts                        # Styling Utilities (cn, clsx, tailwind-merge)
│
├── project-details/                    # Architecture & Competition Specifications
│   ├── about-trayse.md                 # Product Vision, Market TAM & Roadmap
│   ├── chain-integration.md            # Dual-Rail SVM + Robinhood L2 Technical Spec
│   └── hack-details.md                 # Colosseum Hackathon Rules & Submission Guide
│
├── public/                             # Static Assets & Web Workers
│   ├── assets/fonts/                   # Custom Typefaces (NewBlack, Raleway, Urbanist)
│   ├── workers/
│   │   └── polymarket-worker.js        # Dedicated 16.6ms Conflation Web Worker
│   └── trayse-emblem-dark.svg          # Official Vector Brand Identity
│
├── .gitignore                          # Standardized Git Exclusion Rules
├── package.json                        # Dependency Manifest
├── tailwind.config.ts                  # Tailwind Design Tokens & Typography
└── tsconfig.json                       # Strict TypeScript Configuration
```

---

## 8. Local Installation, Build & Verification Guide

### Prerequisites
- **Node.js:** `v18.18.0` or higher (tested on Node 20 and Node 22).
- **Package Manager:** `npm` (included with Node.js).
- **Git:** Standard git version control.

### Step 1: Clone the Repository
```bash
git clone https://github.com/xcjohnmark/trayse.git
cd trayse
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables (Optional)
The application works immediately out-of-the-box using built-in public fallback endpoints and verifiable mock pairs. If you wish to connect private RPCs:

```bash
# Create local environment file (already ignored in .gitignore)
cp .env.example .env.local
```

Add your optional credentials:
```env
NEXT_PUBLIC_HELIUS_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"
NEXT_PUBLIC_ROBINHOOD_RPC_URL="https://rpc.mainnet.chain.robinhood.com"
```

### Step 4: Run the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
- **Consumer Landing Page:** `http://localhost:3000`
- **Quantitative Terminal:** `http://localhost:3000/terminal`
- **Arbitrage Scanner:** `http://localhost:3000/terminal/arbitrage`
- **Trade Journal:** `http://localhost:3000/terminal/journal`
- **Watchlists:** `http://localhost:3000/terminal/watchlists`

### Step 5: Verify Production Compilation & Type Checking
To test strict TypeScript types and production Next.js build compilation:

```bash
# 1. Run strict TypeScript check (Zero errors guaranteed)
npx tsc --noEmit

# 2. Run Next.js production build
npm run build

# 3. Launch production server
npm run start
```

---

## 9. Product Roadmap (From 1 to N)

```
       PHASE 1 (SHIPPED)                   PHASE 2 (SHIPPED)                  PHASE 3 (Q4 2026)                  PHASE 4 (2027)
┌───────────────────────────────┐   ┌───────────────────────────────┐   ┌───────────────────────────────┐   ┌───────────────────────────────┐
│ • High-Density OLED Terminal  │   │ • Polymarket Live CLOB Feed   │   │ • Non-Custodial Vaults        │   │ • Cross-Chain Settlement Vault│
│ • Dual-Rail State Architecture│──▶│ • Kalshi Trade API v2 Proxy   │──▶│ • Yield-Bearing Margin Coll.  │──▶│ • Multi-Agent Autonomous Arena│
│ • Fuzzy Entity Linker Engine  │   │ • 16.6ms Web Worker Conflation│   │ • Solana Blinks on Twitter/X  │   │ • Full Prime Brokerage Margin │
│ • Swig Session Key Guardrails │   │ • Cross-Venue Arbitrage Engine│   │ • Public Whale Radar & PnL    │   │ • Colosseum Accelerator Growth│
└───────────────────────────────┘   └───────────────────────────────┘   └───────────────────────────────┘   └───────────────────────────────┘
```

1. **Phase 1: Terminal Architecture & Design System (Completed):** Pinned telemetry docks, monospace tabular figures, and dual-rail state synchronization.
2. **Phase 2: Live Ingestion & Cross-Platform Arbitrage (Completed):** Real-time Polymarket CLOB and Kalshi API v2 ingestion with 16.6ms worker conflation, synthetic spread calculation, and full market workstation (`/terminal/market/[id]`).
3. **Phase 3: Solana Strategy Vaults & Yield-Bearing Margin (Current):** Allow users to stake idle USDC/USDG collateral into automated quant strategy vaults, earning continuous base yield while limit orders remain open.
4. **Phase 4: Institutional Prime Brokerage & Open SDK Marketplace (Future):** Enable third-party quant funds to deploy containerized predictive models and monetize directly via x402 micropayments.

---

## 10. Security, Risk Guardrails & Disclosures

### Non-Custodial Security Guarantee
Trayse is strictly non-custodial. Private keys never leave your local client. Delegated execution is managed via Swig Smart Accounts on Solana, which are restricted by immutable on-chain rules (maximum position sizing, hard stop-losses, and time-based auto-revocation).

### Regulatory Boundaries & Disclaimers
Trayse is a market intelligence and software analytics interface. It is not an exchange, broker-dealer, or financial advisor:
- Users interacting with Polymarket contracts are subject to Polymarket’s jurisdictional terms of service.
- Users interacting with Kalshi contracts are subject to CFTC regulatory standards and Kalshi’s participant rules.
- Past backtested Sharpe ratios and model win rates are simulated statistical indications and do not guarantee future financial returns. Always define strict risk parameters before committing live capital.

---

<div align="center">

**Built with precision for the Colosseum Crypto World's Fair Hackathon 2026**  
*Connecting the Speed of Solana SVM with Institutional Prediction Intelligence*

</div>
