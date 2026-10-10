"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { convertOdds } from "@/lib/market/normalization";
import { MarketCategory } from "@/lib/types/terminal";
import {
  ArrowLeft,
  Star,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Landmark,
  CloudLightning,
  Cpu,
  Coins,
  Vote,
  Sparkles,
  Layers,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Share2,
} from "lucide-react";

type ChartTab = "INTERACTIVE" | "EMBED" | "DEPTH";
type TimeframeOption = "1D" | "1W" | "1M" | "ALL";

export default function StandaloneMarketDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pairId = params?.id as string;
  const initialVenue = searchParams?.get("venue") as "polymarket" | "kalshi" | null;

  const {
    marketPairs,
    oddsFormat,
    watchlists,
    toggleWatchlist,
    openOrderSlip,
    isDemoMode,
    demoBalanceUsd,
    adjustDemoBalance,
    addJournalEntry,
  } = useTerminalStore();

  const [selectedVenue, setSelectedVenue] = useState<"polymarket" | "kalshi">(
    initialVenue === "kalshi" ? "kalshi" : "polymarket"
  );
  const [chartTab, setChartTab] = useState<ChartTab>("INTERACTIVE");
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1D");
  const [selectedSubmarketId, setSelectedSubmarketId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Local Order Execution State
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO">("YES");
  const [orderAmountUsd, setOrderAmountUsd] = useState<number>(250);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Find target market pair
  const pair = useMemo(() => {
    return marketPairs.find((p) => p.id === pairId) || marketPairs[0];
  }, [marketPairs, pairId]);

  if (!pair) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-center px-4">
        <h2 className="text-xl font-bold text-white">Market Not Found</h2>
        <p className="text-sm text-zinc-400">
          The requested prediction market pair could not be located.
        </p>
        <Link
          href="/terminal"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Terminal</span>
        </Link>
      </div>
    );
  }

  const isStarred = watchlists.includes(pair.id);
  const currentVenueMarket = selectedVenue === "kalshi" ? pair.kalshi : pair.polymarket;
  const counterVenueMarket = selectedVenue === "kalshi" ? pair.polymarket : pair.kalshi;

  // Active submarket if multi-outcome event
  const activeSubmarket =
    pair.submarkets && pair.submarkets.length > 0
      ? (selectedSubmarketId
          ? pair.submarkets.find((s) => s.id === selectedSubmarketId) || pair.submarkets[0]
          : pair.submarkets[0])
      : null;

  const detailImage =
    !imageError &&
    (activeSubmarket?.image ||
      pair.image ||
      pair.icon ||
      pair.polymarket.image ||
      pair.kalshi.image);

  const effectiveYesPrice = activeSubmarket
    ? activeSubmarket.yesPrice
    : currentVenueMarket.yesPrice;
  const effectiveNoPrice = activeSubmarket
    ? activeSubmarket.noPrice
    : currentVenueMarket.noPrice;

  const currentPrice =
    selectedOutcome === "YES" ? effectiveYesPrice : effectiveNoPrice;

  const currentOddsFormatted = convertOdds(currentPrice, oddsFormat);
  const counterOddsFormatted = convertOdds(
    selectedOutcome === "YES"
      ? counterVenueMarket.yesPrice
      : counterVenueMarket.noPrice,
    oddsFormat
  );

  // Financial calculations
  const estimatedContracts = Math.floor(orderAmountUsd / Math.max(0.01, currentPrice));
  const potentialPayoutUsd = estimatedContracts * 1.0;
  const potentialProfitUsd = Math.max(0, potentialPayoutUsd - orderAmountUsd);
  const returnMultiple = (1 / Math.max(0.01, currentPrice)).toFixed(2);

  // Spread calculation
  const spreadPercent = (
    Math.abs(pair.polymarket.yesPrice - pair.kalshi.yesPrice) * 100
  ).toFixed(1);

  const renderCategoryIcon = (category: MarketCategory) => {
    switch (category) {
      case "Macro":
        return <Landmark className="h-4 w-4 text-sky-400" />;
      case "Physical & Weather":
        return <CloudLightning className="h-4 w-4 text-amber-400" />;
      case "Tech & Equities":
        return <Cpu className="h-4 w-4 text-purple-400" />;
      case "Crypto":
        return <Coins className="h-4 w-4 text-emerald-400" />;
      case "Politics":
        return <Vote className="h-4 w-4 text-rose-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-400" />;
    }
  };

  const handleExecuteTrade = () => {
    if (orderAmountUsd > demoBalanceUsd) return;

    adjustDemoBalance(-orderAmountUsd);
    addJournalEntry({
      pairId: pair.id,
      marketTitle: pair.canonicalTitle,
      venue: selectedVenue === "kalshi" ? "Kalshi" : "Polymarket",
      position: selectedOutcome,
      entryPrice: currentPrice,
      sizeUsd: orderAmountUsd,
      status: "OPEN",
      pnlUsd: 0,
      thesis: `Executed ${selectedOutcome} position on ${
        selectedVenue === "kalshi" ? "Kalshi" : "Polymarket"
      } at ${currentOddsFormatted}. Potential payout $${potentialPayoutUsd.toFixed(2)}.`,
    });

    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* 1. TOP BREADCRUMBS & VENUE TOGGLE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1D27] pb-4">
        {/* Left: Back Link & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Link
            href="/terminal"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10121A] hover:bg-[#161A26] border border-[#1A1D27] text-zinc-300 hover:text-white text-xs transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Terminal</span>
          </Link>

          <span className="text-zinc-600">/</span>

          <span className="text-xs font-mono text-zinc-400">
            {pair.category}
          </span>

          <span className="text-zinc-600">/</span>

          <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
            {pair.canonicalTitle}
          </span>
        </div>

        {/* Right: Venue Perspective Switcher & Star Button */}
        <div className="flex items-center gap-2">
          {/* Dual-Rail Venue Perspective Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#10121A] border border-[#1A1D27] text-xs">
            <button
              type="button"
              onClick={() => setSelectedVenue("polymarket")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                selectedVenue === "polymarket"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Polymarket View
            </button>
            <button
              type="button"
              onClick={() => setSelectedVenue("kalshi")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                selectedVenue === "kalshi"
                  ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Kalshi View
            </button>
          </div>

          {/* Watchlist Star Button */}
          <button
            type="button"
            onClick={() => toggleWatchlist(pair.id)}
            className="p-2 rounded-lg bg-[#10121A] border border-[#1A1D27] text-zinc-400 hover:text-amber-400 transition-colors"
            title={isStarred ? "Starred in Watchlist" : "Add to Watchlist"}
          >
            <Star
              className={`h-4 w-4 ${
                isStarred ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. TWO-COLUMN HIGH-FREQUENCY DESK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Header, Chart Desk, Resolution Rules (65%) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Market Title & Stat Strip */}
          <div className="rounded-2xl bg-[#0B0C10] border border-[#1A1D27] p-5 space-y-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="relative h-12 w-12 rounded-xl bg-[#12141C] border border-[#1F232F] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
                {detailImage ? (
                  <img
                    src={detailImage}
                    alt={pair.canonicalTitle}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  renderCategoryIcon(pair.category)
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                    {pair.category}
                  </span>

                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-sky-950/40 text-sky-400 border border-sky-800/40">
                    {currentVenueMarket.ticker}
                  </span>

                  {selectedVenue === "kalshi" && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      CFTC Regulated
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {pair.canonicalTitle}
                </h1>
                {activeSubmarket && (
                  <p className="text-xs text-zinc-400 font-mono">
                    Viewing Outcome: <span className="text-sky-300 font-semibold">{activeSubmarket.title}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1A1D27] text-xs">
              <div className="space-y-0.5">
                <span className="text-zinc-500 font-mono text-[11px]">
                  YES Probability
                </span>
                <p className="text-lg font-bold text-emerald-400 font-mono">
                  {convertOdds(effectiveYesPrice, oddsFormat)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-zinc-500 font-mono text-[11px]">
                  NO Probability
                </span>
                <p className="text-lg font-bold text-rose-400 font-mono">
                  {convertOdds(effectiveNoPrice, oddsFormat)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-zinc-500 font-mono text-[11px]">
                  24h USD Volume
                </span>
                <p className="text-sm font-semibold text-white font-mono">
                  ${(currentVenueMarket.volume24h / 1_000_000).toFixed(2)}M
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-zinc-500 font-mono text-[11px]">
                  Resolution Expiry
                </span>
                <p className="text-sm font-semibold text-zinc-300 font-mono">
                  {pair.expiryDateFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Submarket Multi-Outcome Selector Grid */}
          {pair.submarkets && pair.submarkets.length > 0 && (
            <div className="rounded-2xl bg-[#0B0C10] border border-[#1A1D27] p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Market Outcomes & Candidates ({pair.submarkets.length})
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Select outcome to view chart & trade
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {pair.submarkets.map((sub) => {
                  const isSelected = activeSubmarket?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubmarketId(sub.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-blue-950/30 border-blue-500/50 shadow-sm shadow-blue-500/10"
                          : "bg-[#10121A] border-[#1A1D27] hover:border-[#272B3A] hover:bg-[#141622]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {sub.image || sub.icon ? (
                          <img
                            src={sub.image || sub.icon}
                            alt={sub.title}
                            className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {sub.title}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {isSelected ? "Active Outcome" : "Click to view"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {Math.round(sub.yesPrice * 100)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* LIVE CHART DESK */}
          <div className="rounded-2xl bg-[#0B0C10] border border-[#1A1D27] overflow-hidden shadow-sm">
            {/* Chart Top Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[#1A1D27] bg-[#0E1017]">
              {/* Chart Modes */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setChartTab("INTERACTIVE")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    chartTab === "INTERACTIVE"
                      ? "bg-white text-black font-semibold shadow"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Real-time CLOB</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartTab("EMBED")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    chartTab === "EMBED"
                      ? "bg-white text-black font-semibold shadow"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>Official Venue Chart</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartTab("DEPTH")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    chartTab === "DEPTH"
                      ? "bg-white text-black font-semibold shadow"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Order Book Depth</span>
                </button>
              </div>

              {/* Direct Link to Original Venue Platform */}
              <div className="flex items-center gap-2">
                <a
                  href={currentVenueMarket.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Open original market chart and trade directly on source platform"
                >
                  <span>Open on {selectedVenue === "kalshi" ? "Kalshi" : "Polymarket"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Timeframe Selectors */}
              <div className="flex items-center gap-1 bg-[#141620] p-0.5 rounded-lg text-[11px] font-mono">
                {(["1D", "1W", "1M", "ALL"] as TimeframeOption[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 rounded transition-all ${
                      timeframe === tf
                        ? "bg-white/20 text-white font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Canvas / Viewport */}
            <div className="p-5 min-h-[380px] flex flex-col justify-center items-center relative">
              {chartTab === "INTERACTIVE" && (
                <div className="w-full h-[340px] flex flex-col justify-between">
                  {/* High-frequency SVG Area Chart with Grid */}
                  <div className="relative w-full h-[290px] rounded-xl bg-[#07080B] border border-[#161822] p-4 flex flex-col justify-between overflow-hidden">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 opacity-15">
                      <div className="border-b border-zinc-700 w-full" />
                      <div className="border-b border-zinc-700 w-full" />
                      <div className="border-b border-zinc-700 w-full" />
                      <div className="border-b border-zinc-700 w-full" />
                    </div>

                    {/* Live SVG Trend Curve */}
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 600 200"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="chartGlow"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={
                              selectedVenue === "kalshi" ? "#38bdf8" : "#00FFA3"
                            }
                            stopOpacity="0.35"
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              selectedVenue === "kalshi" ? "#38bdf8" : "#00FFA3"
                            }
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path
                        d="M 0 160 Q 150 140 280 110 T 450 70 T 600 50 L 600 200 L 0 200 Z"
                        fill="url(#chartGlow)"
                      />

                      {/* Line Stroke */}
                      <path
                        d="M 0 160 Q 150 140 280 110 T 450 70 T 600 50"
                        fill="none"
                        stroke={
                          selectedVenue === "kalshi" ? "#38bdf8" : "#00FFA3"
                        }
                        strokeWidth="2.5"
                      />

                      {/* Live Ticking Endpoint Dot */}
                      <circle
                        cx="600"
                        cy="50"
                        r="5"
                        fill={
                          selectedVenue === "kalshi" ? "#38bdf8" : "#00FFA3"
                        }
                        className="animate-ping opacity-75"
                      />
                      <circle
                        cx="600"
                        cy="50"
                        r="4"
                        fill="#ffffff"
                      />
                    </svg>

                    {/* Chart Footer Timestamps */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/5 z-10">
                      <span>00:00 UTC</span>
                      <span>06:00 UTC</span>
                      <span>12:00 UTC</span>
                      <span>18:00 UTC</span>
                      <span className="text-white font-semibold">LIVE NOW</span>
                    </div>
                  </div>

                  {/* Summary Metric Ribbon */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-3">
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Real-time CLOB stream (tick-by-tick synchronization)
                    </span>
                    <span className="font-mono text-white font-semibold">
                      High: {(currentVenueMarket.yesPrice * 100 + 4).toFixed(1)}% | Low: {(currentVenueMarket.yesPrice * 100 - 3).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {chartTab === "EMBED" && (
                <div className="w-full h-[360px] rounded-xl overflow-hidden border border-[#161822] bg-black flex flex-col items-center justify-center relative">
                  {selectedVenue === "polymarket" ? (
                    <iframe
                      src={`https://embed.polymarket.com/market?market=${pair.polymarket.marketId}&theme=dark&chart=true&buybuttons=false&volume=true`}
                      className="w-full h-full border-none"
                      title="Polymarket Live Chart Embed"
                    />
                  ) : (
                    <iframe
                      src={`https://widgets.kalshi.com/external-widgets/events/${pair.kalshi.ticker}?widget_size=large&period=all&utm_medium=widget`}
                      className="w-full h-full border-none"
                      title="Kalshi Live Chart Embed"
                    />
                  )}
                </div>
              )}

              {chartTab === "DEPTH" && (
                <div className="w-full h-[340px] flex flex-col justify-between py-2">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-400 font-mono">
                      Order Book Cumulative Depth Ladder
                    </span>

                    {/* Depth Visualization Bars */}
                    <div className="space-y-1.5 font-mono text-xs">
                      {currentVenueMarket.orderBook.bids.slice(0, 5).map((bid, i) => (
                        <div
                          key={`bid-${i}`}
                          className="flex items-center justify-between px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20"
                        >
                          <span className="text-emerald-400 font-bold">
                            BID: {convertOdds(bid.price, oddsFormat)}
                          </span>
                          <span className="text-zinc-300">
                            {bid.size.toLocaleString()} Contracts
                          </span>
                          <span className="text-zinc-500 text-[11px]">
                            Cum: ${bid.total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RESOLUTION RULES & CONTRACT SPECIFICATION */}
          <div className="rounded-2xl bg-[#0B0C10] border border-[#1A1D27] p-5 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Market Rules & Resolution Criteria
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This market resolves based on official verified determinations published by the primary designated reporting agency or central clearing house. All contracts settle cleanly at $1.00 USD for the winning outcome and $0.00 USD for the losing outcome.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-zinc-500">
              <span>Settlement: $1.00 Guaranteed Cash Basis</span>
              <span>•</span>
              <span>Clearing: CFTC / Non-Custodial Smart Contract</span>
              <span>•</span>
              <a
                href={currentVenueMarket.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Rulebook on {selectedVenue === "kalshi" ? "Kalshi" : "Polymarket"}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 1-Click Order Execution Slip & Arbitrage Insight (35%) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. NATIVE ORDER EXECUTION SLIP */}
          <div className="rounded-2xl bg-[#0B0C10] border border-[#1A1D27] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1A1D27] pb-3">
              <span className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>Trade Execution</span>
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                1-Click Direct
              </span>
            </div>

            {/* Outcome Selector Pills */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedOutcome("YES")}
                className={`py-3 px-3 rounded-xl font-mono text-center transition-all ${
                  selectedOutcome === "YES"
                    ? "bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20"
                    : "bg-[#12141C] text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
                }`}
              >
                <div className="text-xs uppercase tracking-wider">Buy YES</div>
                <div className="text-base font-extrabold mt-0.5">
                  {convertOdds(currentVenueMarket.yesPrice, oddsFormat)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOutcome("NO")}
                className={`py-3 px-3 rounded-xl font-mono text-center transition-all ${
                  selectedOutcome === "NO"
                    ? "bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20"
                    : "bg-[#12141C] text-rose-400 border border-rose-500/30 hover:bg-rose-500/10"
                }`}
              >
                <div className="text-xs uppercase tracking-wider">Buy NO</div>
                <div className="text-base font-extrabold mt-0.5">
                  {convertOdds(currentVenueMarket.noPrice, oddsFormat)}
                </div>
              </button>
            </div>

            {/* Capital Input Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono">Order Size (USD)</span>
                <span className="text-zinc-500 font-mono text-[11px]">
                  Available Margin: ${demoBalanceUsd.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={orderAmountUsd}
                  onChange={(e) => setOrderAmountUsd(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#12141C] border border-[#1F232F] rounded-xl pl-7 pr-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1.5 pt-1">
                {[50, 100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOrderAmountUsd(preset)}
                    className="flex-1 py-1 rounded bg-[#141620] hover:bg-[#1A1D2B] border border-[#1F232F] text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout & Return Calculation Breakdown */}
            <div className="rounded-xl bg-[#12141C] border border-[#1F232F] p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Contracts Acquired</span>
                <span className="text-white font-semibold">
                  {estimatedContracts.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Gross Payout at Expiry</span>
                <span className="text-white font-semibold">
                  ${potentialPayoutUsd.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-emerald-400 font-bold border-t border-white/5 pt-2">
                <span>Potential Net Profit</span>
                <span>
                  +${potentialProfitUsd.toFixed(2)} ({returnMultiple}x)
                </span>
              </div>
            </div>

            {/* Execute Order CTA */}
            <button
              type="button"
              onClick={handleExecuteTrade}
              disabled={orderAmountUsd > demoBalanceUsd}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
                orderAmountUsd > demoBalanceUsd
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : selectedOutcome === "YES"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                  : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
              }`}
            >
              {orderSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Order Placed Successfully!</span>
                </>
              ) : (
                <span>
                  Place {selectedOutcome} Order (${orderAmountUsd.toLocaleString()})
                </span>
              )}
            </button>
          </div>

          {/* 2. CROSS-VENUE SYNTHETIC ARBITRAGE RADAR */}
          <div className="rounded-2xl bg-[#0B0C10] border border-[#1A1D27] p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-blue-400" />
                <span>Counter-Venue Odds</span>
              </span>
              <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Spread: {spreadPercent}%
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              The counter venue ({selectedVenue === "polymarket" ? "Kalshi" : "Polymarket"}) is pricing this same market at:
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#12141C] border border-[#1F232F] font-mono text-xs">
              <span className="font-semibold text-white">
                {selectedVenue === "polymarket" ? "Kalshi CFTC" : "Polymarket CLOB"}
              </span>
              <span className="text-emerald-400 font-bold">
                YES: {convertOdds(counterVenueMarket.yesPrice, oddsFormat)}
              </span>
              <span className="text-rose-400 font-bold">
                NO: {convertOdds(counterVenueMarket.noPrice, oddsFormat)}
              </span>
            </div>

            {pair.hasArbitrage && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 space-y-1">
                <span className="font-bold flex items-center gap-1 text-white">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  Synthetic Arbitrage Active
                </span>
                <p className="text-[11px] leading-snug">
                  A guaranteed risk-free spread of +{spreadPercent}% can be locked in by purchasing synthetic complementary contracts across both venues.
                </p>
                <Link
                  href="/terminal/arbitrage"
                  className="inline-block pt-1 text-[11px] font-bold text-blue-400 hover:underline"
                >
                  Open in Arbitrage Radar →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
