"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Minus,
  ArrowUpRight,
  HelpCircle,
  ShieldCheck,
  Cpu,
  Coins,
  Scale,
} from "lucide-react";

type FaqCategory =
  | "all"
  | "arbitrage"
  | "execution"
  | "security"
  | "regulatory";

interface FaqItem {
  id: string;
  category: FaqCategory;
  categoryLabel: string;
  question: string;
  answer: string;
  technicalDetails?: string[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "odds-normalization",
    category: "arbitrage",
    categoryLabel: "Cross-Venue Arbitrage",
    question:
      "How does Trayse normalize odds between Polymarket's Polygon CLOB and Kalshi's CFTC exchange?",
    answer:
      "Polymarket quotes odds in sub-cent increments (0.0¢ to 100.0¢ USDC) via an off-chain Central Limit Order Book settled on Polygon, while Kalshi quotes integer cents ($0.01 to $0.99 USD) cleared through Kalshi Klear LLC (a CFTC-registered DCO). Trayse normalizes both into uniform implied probabilities [0.000, 1.000], factoring in maker/taker schedules (Polymarket 0% maker / 0% winner redemption fee on standard CTF vs Kalshi volume tiers), resolution horizon discounting, and executable synthetic spread deltas.",
    technicalDetails: [
      "Sub-40ms WebSocket synchronization via Polymarket CLOB L2 tape and Kalshi WebSocket v2.",
      "Real-time spread detection accounting for integer cent roundings and taker fee friction.",
      "Uniform ISO-8601 resolution horizon mapping across fragmented event descriptions.",
    ],
  },
  {
    id: "synthetic-arbitrage",
    category: "arbitrage",
    categoryLabel: "Cross-Venue Arbitrage",
    question:
      "What is 'Synthetic Risk-Free Arbitrage' and how is execution risk mitigated?",
    answer:
      "Synthetic arbitrage exploits pricing divergence on identical real-world binary outcomes across disconnected venues. If Polymarket quotes YES at 58.0¢ and Kalshi quotes NO at 38.0¢, the total basket cost is 96.0¢ for a contract pair mathematically guaranteed to pay exactly $1.00 upon resolution. Trayse captures this spread by concurrently dispatching Leg A on Polymarket (EIP-712 CLOB) and Leg B on Kalshi (RSA-authenticated API) under strict bilateral slippage collars, automatically aborting if either leg fills asymmetrically.",
    technicalDetails: [
      "Bilateral slippage collars: If either leg slips beyond tolerance, the trade is cancelled immediately.",
      "Annualized IRR calculations account for contract maturity horizon (from 2 days to 180 days).",
      "Historical backtest demonstrates zero execution leg failure under 15 bps slippage threshold.",
    ],
  },
  {
    id: "session-keys-custody",
    category: "security",
    categoryLabel: "Custody & Risk",
    question:
      "How do Delegated Session Keys protect capital against bot liquidations and exploit vectors?",
    answer:
      "Trayse utilizes non-custodial smart-wallet session keys on Solana. Your primary funds remain secure inside your Phantom or Backpack wallet. The ephemeral session key possesses strictly delegated execution rights: it can only place limit orders on verified prediction contracts and is cryptographically prevented from initiating fund transfers or withdrawals.",
    technicalDetails: [
      "Client-side private key generation: Ephemeral keys are stored in encrypted local session memory.",
      "Hard risk guardrails: Strict max daily loss caps ($5,000) and max single-order sizing ($2,500).",
      "Instant 1-click on-chain revocation at any time via your primary wallet.",
    ],
  },
  {
    id: "yield-bearing-margin",
    category: "execution",
    categoryLabel: "Execution & Solana",
    question:
      "Can I earn continuous yield on collateral while resting limit orders or holding long-duration event positions?",
    answer:
      "Yes. Traditional prediction platforms leave collateral idle while waiting for long-duration contracts to resolve. Trayse routes collateral through institutional yield-bearing dollar assets on Solana (including Ondo USDY and Paxos USDL). Margin capital backing resting limit orders continues earning 4.8%–5.4% SOFR-linked yield until filled or resolved.",
    technicalDetails: [
      "Compatible with major Solana yield-bearing stablecoins and tokenized Treasury assets.",
      "Yield accrues continuously into your account without requiring manual un-staking.",
      "Collateral remains instantly liquid for atomic cross-venue execution.",
    ],
  },
  {
    id: "latency-benchmarks",
    category: "execution",
    categoryLabel: "Execution & Solana",
    question:
      "What are the latency benchmarks for the Trayse WebSocket stream and programmatic SDK?",
    answer:
      "Trayse operates co-located edge relays in Northern Virginia (adjacent to Kalshi servers) and Frankfurt. Polymarket CLOB L2 order book deltas are processed off-thread in under 24 milliseconds. Solana-native execution batches confirm in an average slot window of 380-410 milliseconds.",
    technicalDetails: [
      "Off-thread high-frequency Web Worker streaming architecture (zero UI thread freezing).",
      "Rust-compiled WebSocket parsing client available in both Python AsyncIO and TypeScript.",
      "99.98% historic stream uptime with redundant failover relays.",
    ],
  },
  {
    id: "regulatory-partitioning",
    category: "regulatory",
    categoryLabel: "Regulatory & Compliance",
    question:
      "How are regulatory compliance boundaries maintained across international and US domestic participants?",
    answer:
      "Trayse operates strictly as a non-custodial intelligence and routing interface. It does not pool customer funds, operate an unlicensed exchange, or act as a counterparty. US domestic entities provide their own API credentials directly to CFTC-regulated Kalshi, while international participants trade non-custodially on Polymarket and Solana. Each execution leg routes client-side to its respective compliant venue.",
    technicalDetails: [
      "Zero custodial commingling: No Trayse middleman contracts hold user principal.",
      "Client-side credential encryption complying with institutional security standards.",
      "Automated tax and trade journal exports compatible with Form 8949 and IRS reporting.",
    ],
  },
  {
    id: "ai-micropayments",
    category: "regulatory",
    categoryLabel: "Regulatory & Compliance",
    question:
      "How do autonomous AI trading agents query Trayse signals via the x402 Micropayment protocol?",
    answer:
      "External AI trading agents and automated LLM models can purchase Trayse quantitative signals (such as nowcast delta edges and whale transaction pings) programmatically on a per-query basis using the x402 HTTP micropayment standard on Solana. Agents stream fractional cents per request without needing monthly credit card subscriptions.",
    technicalDetails: [
      "Standardized HTTP 402 Payment Required response handling.",
      "Sub-cent Solana micropayments settled in under 400 milliseconds.",
      "Machine-to-machine REST and WebSocket endpoints for autonomous agent economies.",
    ],
  },
];

export default function FaqSection() {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    "odds-normalization": true, // Default first open
  });

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section
      id="faq"
      className="relative w-full bg-[#111113] text-white pt-28 pb-32 overflow-hidden isolate"
    >
      {/* Background Subtle Radial Gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      {/* Top Hairline Separator */}
      <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[2px] bg-[#00D688] blur-[2px]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-16 border-b border-white/[0.08]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#00D688] animate-pulse" />
              <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-[#00D688]">
                03 / INSTITUTIONAL DUE DILIGENCE
              </span>
            </div>

            <h2 className="font-headline font-bold text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[1.04] text-white tracking-[-0.03em] mb-4">
              <span className="block">The Architecture Demystified.</span>
              <span className="block text-zinc-300">Precision Answers for Discerning Capital.</span>
            </h2>

            <p className="font-sans font-normal text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Everything quantitative hedge funds, algorithmic builders, and prediction market specialists need to know regarding non-custodial execution, regulatory partitioning, and settlement.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-[#18191e]/90 border border-white/10 rounded-2xl px-5 py-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-6 mb-1">
              <span className="font-sans text-xs text-zinc-400 font-medium">Compliance Model</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#00D688]/15 text-[#00FFA3] border border-[#00D688]/30">
                CFTC & WEB3
              </span>
            </div>
            <div className="flex items-baseline gap-2 font-mono tabular-nums text-xl font-bold text-white">
              <span>Non-Custodial</span>
              <span className="text-xs text-zinc-400 font-normal font-sans">client-side execution</span>
            </div>
          </div>
        </div>

        {/* CONTROLS: Category Pills + Instant Search Input */}
        <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Questions" },
              { id: "arbitrage", label: "Arbitrage & Spreads" },
              { id: "execution", label: "Execution & Solana" },
              { id: "security", label: "Custody & Keys" },
              { id: "regulatory", label: "Regulatory & Compliance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as FaqCategory)}
                className={`font-sans text-xs px-4 py-2 rounded-xl transition-all border cursor-pointer ${
                  selectedCategory === tab.id
                    ? "bg-white text-black font-semibold border-white shadow-sm"
                    : "bg-[#18191e] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search architecture, Kalshi, keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16171c] border border-white/10 focus:border-[#00D688]/50 rounded-xl pl-10 pr-4 py-2 text-xs font-sans text-white placeholder-zinc-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-mono"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ACCORDION LIST WITH FULL ARIA ROLES */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="bg-[#16171c] border border-white/10 rounded-2xl p-12 text-center">
              <HelpCircle className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
              <p className="font-sans text-sm text-zinc-400">
                No questions matching &quot;{searchQuery}&quot;. Try searching for &quot;Kalshi&quot;, &quot;yield&quot;, or &quot;arbitrage&quot;.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = !!openIds[item.id];
              const contentId = `faq-content-${item.id}`;
              const triggerId = `faq-trigger-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`bg-[#16171c]/90 border rounded-2xl transition-all backdrop-blur-md overflow-hidden ${
                    isOpen
                      ? "border-white/25 shadow-lg bg-[#181920]"
                      : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <button
                    id={triggerId}
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full text-left p-6 sm:p-7 flex items-start justify-between gap-6 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00FFA3]"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                  >
                    <div>
                      <span className="font-display font-semibold text-[11px] text-[#00D688] uppercase tracking-wider block mb-1.5">
                        {item.categoryLabel}
                      </span>
                      <h3 className="font-sans font-bold text-base sm:text-lg text-white leading-snug">
                        {item.question}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? "bg-white text-black rotate-180" : "bg-white/5 text-zinc-300"
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={contentId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="px-6 sm:p-7 pb-7 pt-2 border-t border-white/[0.06] font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed"
                    >
                      <p className="mb-4">{item.answer}</p>

                      {item.technicalDetails && (
                        <div className="bg-[#111216] border border-white/[0.06] rounded-xl p-4 mt-4 space-y-2">
                          <span className="font-display font-bold text-[10px] uppercase text-zinc-400 tracking-wider block mb-1">
                            Technical Verification Points:
                          </span>
                          {item.technicalDetails.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00D688] shrink-0 mt-1.5" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM SUPPORT / TERMINAL CTA BANNER */}
        <div className="mt-16 bg-gradient-to-r from-[#181920] to-[#121722] border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="font-headline font-bold text-xl sm:text-2xl text-white mb-2">
              Have Specialized Institutional Requirements?
            </h4>
            <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Our engineering team supports custom FIX protocol adapters, private high-throughput WebSocket streams, and dedicated market-making infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/terminal"
              className="font-sans font-semibold text-xs bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-full transition-all active:scale-95 shadow-xl flex items-center gap-1.5"
            >
              <span>Launch Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
