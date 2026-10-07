"use client";

import React, { useState, useEffect } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { INITIAL_MARKET_PAIRS, generateTickUpdate } from "@/lib/mock/market-data";
import { convertOdds } from "@/lib/market/normalization";
import {
  NormalizedMarketPair,
  MarketCategory,
  OddsFormat,
} from "@/lib/types/terminal";
import {
  Star,
  Search,
  X,
  Layers,
  ArrowUpRight,
  Zap,
  TrendingUp,
  BarChart2,
  ChevronDown,
  ShieldCheck,
  Activity,
  Brain,
} from "lucide-react";
import { QuantStrategyHub } from "@/components/terminal/QuantStrategyHub";

const CATEGORIES: (MarketCategory | "All")[] = [
  "All",
  "Macro",
  "Tech & Equities",
  "Physical & Weather",
  "Politics",
  "Crypto",
];

const ODDS_FORMATS: { label: string; value: OddsFormat; example: string }[] = [
  { label: "Probability (%)", value: "PROBABILITY", example: "64.0%" },
  { label: "Decimal (1.xx)", value: "DECIMAL", example: "1.56x" },
  { label: "American (+/-)", value: "AMERICAN", example: "-178 / +150" },
  { label: "Cents (¢)", value: "CENTS", example: "64¢" },
];

export default function TerminalMarketBrowserPage() {
  const {
    oddsFormat,
    setOddsFormat,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    watchlists,
    toggleWatchlist,
    setSelectedPairId,
    openModal,
    activeRail,
  } = useTerminalStore();

  const [pairs, setPairs] = useState<NormalizedMarketPair[]>(INITIAL_MARKET_PAIRS);
  const [flashingPairIds, setFlashingPairIds] = useState<{ [id: string]: "up" | "down" }>({});
  const [activeView, setActiveView] = useState<"MARKETS" | "STRATEGIES">("MARKETS");

  // 1. Real-time tick simulation (every 3.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setPairs((prevPairs) => {
        const randomIndex = Math.floor(Math.random() * prevPairs.length);
        const targetPair = prevPairs[randomIndex];
        const updatedPair = generateTickUpdate(targetPair);

        const direction =
          updatedPair.polymarket.yesPrice >= targetPair.polymarket.yesPrice ? "up" : "down";

        setFlashingPairIds((prev) => ({ ...prev, [targetPair.id]: direction }));
        setTimeout(() => {
          setFlashingPairIds((prev) => {
            const next = { ...prev };
            delete next[targetPair.id];
            return next;
          });
        }, 1200);

        const next = [...prevPairs];
        next[randomIndex] = updatedPair;
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // 2. Filter logic
  const filteredPairs = pairs.filter((pair) => {
    // Category match
    if (activeCategory !== "All" && pair.category !== activeCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = pair.canonicalTitle.toLowerCase().includes(q);
      const matchPmTicker = pair.polymarket.ticker.toLowerCase().includes(q);
      const matchKalshiTicker = pair.kalshi.ticker.toLowerCase().includes(q);
      const matchEquity = pair.correlatedEquityTicker?.toLowerCase().includes(q);
      if (!matchTitle && !matchPmTicker && !matchKalshiTicker && !matchEquity) {
        return false;
      }
    }

    // Blockchain rail filter (if specific rail selected)
    if (activeRail === "ROBINHOOD" && !pair.correlatedEquityTicker) {
      // Still show, but optionally could filter or highlight
    }

    return true;
  });

  // Aggregate stats
  const totalArbCount = pairs.filter((p) => p.hasArbitrage).length;
  const totalVolume = pairs.reduce(
    (acc, p) => acc + p.polymarket.volume24h + p.kalshi.volume24h,
    0
  );
  const avgDivergence = Math.round(
    pairs.reduce((acc, p) => acc + p.divergenceBps, 0) / pairs.length
  );

  const formatVolume = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const getCategoryColor = (cat: MarketCategory) => {
    switch (cat) {
      case "Macro":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Tech & Equities":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "Physical & Weather":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Politics":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Crypto":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-sans">
      {/* Top Telemetry Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-2.5">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>INGESTION PAIRS</span>
            <Activity className="h-3 w-3 text-zinc-500" />
          </div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">
            {pairs.length}{" "}
            <span className="text-[10px] font-normal text-zinc-500">Dual-Audited</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-2.5">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>ACTIVE ARBITRAGES</span>
            <Zap className="h-3 w-3 text-[#00FFA3]" />
          </div>
          <div className="text-lg font-bold font-mono text-[#00FFA3] mt-0.5 flex items-center gap-1.5">
            {totalArbCount} Detected
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
              Live
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-2.5">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>24H COMBINED VOLUME</span>
            <BarChart2 className="h-3 w-3 text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">
            {formatVolume(totalVolume)}
          </div>
        </div>

        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-2.5">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>AVG VENUE SPREAD</span>
            <TrendingUp className="h-3 w-3 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
            {avgDivergence} bps
          </div>
        </div>
      </div>

      {/* View Switcher: Market Browser vs Quant Strategy Studio */}
      <div className="flex items-center justify-between border-b border-[#1F232F] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView("MARKETS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              activeView === "MARKETS"
                ? "bg-[#12141C] border-[#00D688] text-[#00FFA3]"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>ORDER FLOW BROWSER ({pairs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("STRATEGIES")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              activeView === "STRATEGIES"
                ? "bg-purple-950/20 border-purple-500/50 text-purple-300"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Brain className="h-3.5 w-3.5 text-purple-400" />
            <span>QUANT STRATEGY STUDIO (4 MODELS)</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
          ALT+1 MARKETS • ALT+2 ARB RADAR
        </div>
      </div>

      {activeView === "STRATEGIES" ? (
        <QuantStrategyHub />
      ) : (
        <>
          {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-[#0C0D12] border border-[#1F232F] p-2.5 rounded-lg">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search events, tickers (e.g. $NVDA, FED, BTC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12141C] border border-[#1F232F] rounded-md pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00D688] font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Center: Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono whitespace-nowrap transition-colors border ${
                  isActive
                    ? "bg-[#00D688]/15 border-[#00D688] text-[#00FFA3] font-semibold"
                    : "bg-[#12141C] border-[#1F232F] text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right: Odds Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-500 hidden xl:inline">ODDS:</span>
          <div className="relative">
            <select
              aria-label="Odds Format"
              value={oddsFormat}
              onChange={(e) => setOddsFormat(e.target.value as OddsFormat)}
              className="bg-[#12141C] border border-[#1F232F] rounded-md px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#00D688] cursor-pointer pr-8 appearance-none"
            >
              {ODDS_FORMATS.map((fmt) => (
                <option key={fmt.value} value={fmt.value} className="bg-[#12141C]">
                  {fmt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* High-Density Market Table */}
      <div className="flex-1 rounded-lg border border-[#1F232F] bg-[#090A0E] overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1F232F] bg-[#0E1017] text-[10px] font-mono text-zinc-500 tracking-wider">
                <th className="py-2.5 px-3 w-8 text-center">★</th>
                <th className="py-2.5 px-3 min-w-[280px]">EVENT / UNDERLYING</th>
                <th className="py-2.5 px-3 min-w-[170px] bg-purple-950/10">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    <span>POLYMARKET (CLOB)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[170px] bg-blue-950/10">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>KALSHI (CFTC v2)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[110px] text-right">SPREAD (DIV)</th>
                <th className="py-2.5 px-3 min-w-[100px] text-right">24H VOLUME</th>
                <th className="py-2.5 px-3 min-w-[180px] text-right">ACTIONS / ROUTING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F232F] text-xs font-mono">
              {filteredPairs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 font-mono">
                    No prediction markets match &quot;{searchQuery}&quot; under &quot;{activeCategory}&quot;.
                  </td>
                </tr>
              ) : (
                filteredPairs.map((pair) => {
                  const isStarred = watchlists.includes(pair.id);
                  const flashState = flashingPairIds[pair.id];
                  const aggregateVol = pair.polymarket.volume24h + pair.kalshi.volume24h;
                  const isHighDivergence = pair.divergenceBps >= 200;

                  return (
                    <tr
                      key={pair.id}
                      className={`hover:bg-[#12141C]/80 transition-colors ${
                        flashState === "up"
                          ? "bg-[#00FFA3]/5"
                          : flashState === "down"
                          ? "bg-rose-500/5"
                          : ""
                      }`}
                    >
                      {/* 1. Star / Watchlist */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(pair.id)}
                          aria-label={`Star ${pair.canonicalTitle}`}
                          className="text-zinc-600 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              isStarred
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-600 hover:text-zinc-400"
                            }`}
                          />
                        </button>
                      </td>

                      {/* 2. Canonical Title & Category */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-mono ${getCategoryColor(
                              pair.category
                            )}`}
                          >
                            {pair.category}
                          </span>
                          {pair.hasArbitrage && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 font-bold flex items-center gap-0.5">
                              <Zap className="h-2.5 w-2.5" />
                              ARB
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-zinc-100 text-[13px] mt-1 line-clamp-1">
                          {pair.canonicalTitle}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-3">
                          <span>EXP: {pair.expiryDateFormatted}</span>
                          <span className="text-zinc-600">•</span>
                          <span>TICKERS: {pair.polymarket.ticker} / {pair.kalshi.ticker}</span>
                        </div>
                      </td>

                      {/* 3. Polymarket YES / NO */}
                      <td className="py-3 px-3 bg-purple-950/5">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#12141C] border border-purple-500/20 px-2 py-1 rounded flex-1 text-center">
                            <span className="text-[9px] text-zinc-500 block">YES</span>
                            <span
                              className={`font-bold transition-colors ${
                                flashState ? "text-[#00FFA3]" : "text-white"
                              }`}
                            >
                              {convertOdds(pair.polymarket.yesPrice, oddsFormat)}
                            </span>
                          </div>
                          <div className="bg-[#12141C] border border-[#1F232F] px-2 py-1 rounded flex-1 text-center">
                            <span className="text-[9px] text-zinc-500 block">NO</span>
                            <span className="text-zinc-400">
                              {convertOdds(pair.polymarket.noPrice, oddsFormat)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Kalshi YES / NO */}
                      <td className="py-3 px-3 bg-blue-950/5">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#12141C] border border-blue-500/20 px-2 py-1 rounded flex-1 text-center">
                            <span className="text-[9px] text-zinc-500 block">YES</span>
                            <span
                              className={`font-bold transition-colors ${
                                flashState ? "text-[#00FFA3]" : "text-white"
                              }`}
                            >
                              {convertOdds(pair.kalshi.yesPrice, oddsFormat)}
                            </span>
                          </div>
                          <div className="bg-[#12141C] border border-[#1F232F] px-2 py-1 rounded flex-1 text-center">
                            <span className="text-[9px] text-zinc-500 block">NO</span>
                            <span className="text-zinc-400">
                              {convertOdds(pair.kalshi.noPrice, oddsFormat)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Spread / Divergence */}
                      <td className="py-3 px-3 text-right">
                        <div
                          className={`font-bold inline-block px-1.5 py-0.5 rounded text-[11px] ${
                            isHighDivergence
                              ? "bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30"
                              : "text-zinc-400"
                          }`}
                        >
                          {pair.divergenceBps} bps
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          {isHighDivergence ? "⚡ Spread Wide" : "Balanced"}
                        </div>
                      </td>

                      {/* 6. 24h Volume */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-semibold text-zinc-200">
                          {formatVolume(aggregateVol)}
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          PM: {formatVolume(pair.polymarket.volume24h)}
                        </div>
                      </td>

                      {/* 7. Actions & Cross-Rail Flyouts */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Book Depth Ladder Trigger */}
                          <button
                            type="button"
                            onClick={() => setSelectedPairId(pair.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-zinc-200 hover:text-white text-[11px] font-mono transition-colors"
                            title="Inspect 5-level side-by-side CLOB order book"
                          >
                            <Layers className="h-3 w-3 text-purple-400" />
                            <span>Depth</span>
                          </button>

                          {/* Correlated Robinhood Equity Link (if available) */}
                          {pair.correlatedEquityTicker && (
                            <button
                              type="button"
                              onClick={() => openModal("ROBINHOOD_HEDGE", pair.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono transition-colors"
                              title="Hedge on Robinhood Chain L2"
                            >
                              <ShieldCheck className="h-3 w-3 text-amber-400" />
                              <span>{pair.correlatedEquityTicker}</span>
                            </button>
                          )}

                          {/* Dialect Blink Trigger (if Arbitrage positive) */}
                          {pair.hasArbitrage && (
                            <button
                              type="button"
                              onClick={() => openModal("DIALECT_BLINK", pair.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-[#00D688]/15 hover:bg-[#00D688]/25 border border-[#00D688]/40 text-[#00FFA3] text-[11px] font-mono transition-colors"
                              title="Share Solana Action Blink"
                            >
                              <Zap className="h-3 w-3" />
                              <span>Blink</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Telemetry Strip */}
        <div className="flex items-center justify-between border-t border-[#1F232F] px-4 py-2 bg-[#0C0D12] text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span>SHOWING: {filteredPairs.length} of {pairs.length} MARKETS</span>
            <span>•</span>
            <span className="text-[#00FFA3] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
              LIVE TICK STREAM ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>FORMAT: {oddsFormat}</span>
            <span>•</span>
            <span>PRESS ALT+2 FOR ARBITRAGE RADAR</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
