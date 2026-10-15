"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeftRight,
  Users,
  Brain,
  SlidersHorizontal,
  Radar,
  Wallet,
  Check,
  TrendingUp,
  Terminal,
  Building2,
  User,
} from "lucide-react";

type AudienceType = "individual" | "quant" | "institution";

interface AudienceContent {
  tag: string;
  headline: string;
  subheadline: string;
  body: string[];
  ctaText: string;
  ctaHref: string;
  steps: {
    number: string;
    title: string;
    description: string;
  }[];
}

const AUDIENCE_DATA: Record<AudienceType, AudienceContent> = {
  individual: {
    tag: "FOR TRADERS & INDIVIDUALS",
    headline: "One Terminal. Every Prediction Market.",
    subheadline:
      "Stop juggling multiple accounts, confusing Polygon wallets, and fragmented order books.",
    body: [
      "Trayse brings Polymarket, Kalshi, and leading event contracts into a single unified workspace. Browse trending presidential odds, economic CPI releases, and crypto milestones side-by-side with real-time probability charts.",
      "Follow verified winning traders with one-click copytrading, or let our automated scanner spot risk-hedged price discrepancies when odds diverge between platforms.",
    ],
    ctaText: "EXPLORE THE TERMINAL",
    ctaHref: "/terminal",
    steps: [
      {
        number: "01",
        title: "Unified Discovery",
        description:
          "Search every live prediction market across Polymarket and Kalshi from a single search bar. Compare odds instantly without managing separate wallets.",
      },
      {
        number: "02",
        title: "Copytrade Top Predictors",
        description:
          "Discover the highest-ranked prediction traders by verified on-chain track record. Mirror their positions automatically as breaking events unfold.",
      },
      {
        number: "03",
        title: "Automated Arbitrage & Sentiment",
        description:
          "Capture guaranteed price discrepancies when Polymarket and Kalshi diverge, backed by real-time AI sentiment analysis of breaking news.",
      },
    ],
  },
  quant: {
    tag: "FOR DEVELOPERS & QUANTS",
    headline: "Low-Latency Market Data & Execution APIs.",
    subheadline:
      "Unified WebSockets, normalized probability feeds, and sub-second multi-venue execution.",
    body: [
      "Build algorithmic strategies across prediction markets without writing separate adapters for Polygon CTF contracts and CFTC-regulated order books. Trayse normalizes tick data, order types, and settlement into a single clean interface.",
      "Access sub-400ms atomic routing on Solana with delegated session keys, programmatic order placement, and historical tick datasets for backtesting.",
    ],
    ctaText: "VIEW DEVELOPER DOCS",
    ctaHref: "#resources",
    steps: [
      {
        number: "01",
        title: "Normalized WebSocket Feed",
        description:
          "Stream sub-50ms tick updates, Level 2 order books, and implied probabilities through a standardized JSON schema across all venues.",
      },
      {
        number: "02",
        title: "Programmatic Execution",
        description:
          "Deploy automated arbitrage bots using our TypeScript and Python SDKs. Execute cross-venue trades with delegated non-custodial session keys.",
      },
      {
        number: "03",
        title: "Historical Tick Datasets",
        description:
          "Backtest your predictive models against tick-level resolution data, implied probability surfaces, and macro event outcome timelines.",
      },
    ],
  },
  institution: {
    tag: "FOR INSTITUTIONS & FUNDS",
    headline: "Institutional Liquidity & Compliant Clearing.",
    subheadline:
      "Deep event market liquidity, segregated collateral custody, and capital efficiency.",
    body: [
      "Deploy meaningful size across macro, election, and geopolitical contracts without blowing out the spread. Trayse aggregates depth from decentralized and regulated venues to provide institutional-grade fills.",
      "Benefit from segregated wallet security, CFTC compliance guardrails, cross-venue capital netting, and dedicated API infrastructure with guaranteed SLAs.",
    ],
    ctaText: "CONTACT INSTITUTIONAL DESK",
    ctaHref: "mailto:desk@trayse.finance",
    steps: [
      {
        number: "01",
        title: "Aggregated Liquidity Pools",
        description:
          "Route six-figure positions across fragmented venues with minimal market impact using intelligent multi-venue smart order routing.",
      },
      {
        number: "02",
        title: "Segregated Custodial Security",
        description:
          "Maintain clear balance segregation between CFTC-regulated USD contracts and on-chain prediction markets with cold-storage multi-sig controls.",
      },
      {
        number: "03",
        title: "Cross-Market Capital Netting",
        description:
          "Optimize collateral efficiency by offsetting opposing positions across venues, freeing up working capital for your treasury operations.",
      },
    ],
  },
};

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  badge?: string;
  description: string;
}

const PLATFORM_FEATURES: FeatureCard[] = [
  {
    icon: ArrowLeftRight,
    title: "Cross-Venue Arbitrage",
    badge: "Live",
    description:
      "Automatically scans Polymarket and Kalshi for mispriced event outcomes. Lock in risk-hedged spreads when identical events trade at divergent odds.",
  },
  {
    icon: Users,
    title: "Social Copytrading",
    badge: "Beta",
    description:
      "Follow verified top predictors with auditable on-chain track records. Allocate capital to mirror their trades in elections, macro, and crypto markets.",
  },
  {
    icon: Brain,
    title: "AI Sentiment Analysis",
    badge: "Live",
    description:
      "Natural language algorithms continuously parse breaking news, social trends, and polling data to score crowd sentiment before lines move.",
  },
  {
    icon: SlidersHorizontal,
    title: "Conditional Limit Orders",
    badge: "Live",
    description:
      "Prediction platforms natively offer only basic market orders. Trayse introduces conditional limit buys, take-profit triggers, and trailing stops.",
  },
  {
    icon: Radar,
    title: "Whale Radar & Block Flow",
    badge: "Live",
    description:
      "Real-time alerts tracking six-figure positions, smart-money accumulation, and abnormal volume surges across global prediction contracts.",
  },
  {
    icon: Wallet,
    title: "Unified Multi-Venue Portfolio",
    badge: "Core",
    description:
      "One dashboard to manage your balances across Kalshi USD and Polymarket USDC with atomic Solana settlement and rapid cross-venue transfers.",
  },
];

export default function ExploreSection() {
  const [activeAudience, setActiveAudience] = useState<AudienceType>("individual");
  const content = AUDIENCE_DATA[activeAudience];

  return (
    <section
      id="explore"
      className="relative w-full bg-[#0B0C10] text-white pt-24 pb-28 border-t border-white/[0.08]"
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* HEADER SECTION: Clean Eyebrow & Segmented Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/[0.08]">
          <div className="max-w-2xl">
            <span className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-zinc-400 block mb-3">
              EXPLORE TRAYSE
            </span>
            <h2 className="font-headline font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1]">
              How Trayse Works
            </h2>
            <p className="font-sans font-normal text-base sm:text-lg text-zinc-400 mt-3 leading-relaxed">
              Tailored workflows whether you are trading predictions individually, building automated algorithms, or allocating institutional capital.
            </p>
          </div>

          {/* Segmented Persona Switcher (Falcon / ReUI Style) */}
          <div className="inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveAudience("individual")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeAudience === "individual"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Individual</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAudience("quant")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeAudience === "quant"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Quant & Dev</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAudience("institution")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeAudience === "institution"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Institution</span>
            </button>
          </div>
        </div>

        {/* CORE 1-2-3 WORKFLOW: Falcon Finance 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-16 pb-20 items-start border-b border-white/[0.08]">
          {/* Left Column: Monogram, Persona Headline, Narrative, and Pill CTA */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* Monogram Badge */}
            <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center font-display font-black text-xl text-white mb-6">
              T
            </div>

            <span className="font-display font-medium text-xs tracking-wider uppercase text-[#E5A93C] mb-2">
              {content.tag}
            </span>

            <h3 className="font-headline font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight mb-4">
              {content.headline}
            </h3>

            <p className="font-sans font-medium text-base text-zinc-300 mb-4 leading-relaxed">
              {content.subheadline}
            </p>

            <div className="space-y-3 mb-8">
              {content.body.map((para, idx) => (
                <p
                  key={idx}
                  className="font-sans font-normal text-sm sm:text-base text-zinc-400 leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Falcon Style Pill Button */}
            <Link
              href={content.ctaHref}
              className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wider uppercase hover:bg-zinc-200 transition-colors"
            >
              <span>{content.ctaText}</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Column: 01, 02, 03 Stacked Feature Progression Cards */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {content.steps.map((step) => (
              <div
                key={step.number}
                className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-colors"
              >
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="font-headline font-black text-2xl sm:text-3xl text-[#E5A93C]">
                    {step.number}
                  </span>
                  <h4 className="font-headline font-bold text-lg sm:text-xl text-white tracking-tight">
                    {step.title}
                  </h4>
                </div>
                <p className="font-sans font-normal text-sm sm:text-base text-zinc-400 leading-relaxed pl-10">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PLATFORM CAPABILITIES GRID: Clear, Human, High-Craft Features */}
        <div className="pt-16">
          <div className="max-w-2xl mb-12">
            <span className="font-display font-semibold text-xs tracking-[0.2em] uppercase text-zinc-400 block mb-2">
              CORE CAPABILITIES
            </span>
            <h3 className="font-headline font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Built for the Future of Event Trading
            </h3>
            <p className="font-sans font-normal text-sm sm:text-base text-zinc-400 mt-2">
              Everything you need to analyze, automate, and execute across the global prediction market ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {feature.badge && (
                        <span className="font-mono text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-300">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="font-headline font-bold text-lg text-white mb-2 tracking-tight">
                      {feature.title}
                    </h4>
                    <p className="font-sans font-normal text-sm text-zinc-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
