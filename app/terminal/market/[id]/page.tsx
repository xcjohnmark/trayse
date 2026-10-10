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
  TrendingUp,
  Landmark,
  CloudLightning,
  Cpu,
  Coins,
  Vote,
  Sparkles,
  BarChart2,
  Loader2,
  Trophy,
} from "lucide-react";
import { TradingViewChart, ChartTimeframe, ChartDisplayMode } from "@/components/terminal/market/TradingViewChart";
import { OrderBookLadder } from "@/components/terminal/market/OrderBookLadder";
import { MarketActivityTape } from "@/components/terminal/market/MarketActivityTape";
import { MarketHoldersView } from "@/components/terminal/market/MarketHoldersView";
import { MarketOrderSlip } from "@/components/terminal/market/MarketOrderSlip";

type ChartTab = "INTERACTIVE" | "EMBED";
type LowerWorkstationTab = "TRADES" | "HOLDERS" | "RULES";

export default function StandaloneMarketDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pairId = params?.id as string;
  const initialVenue = searchParams?.get("venue") as "polymarket" | "kalshi" | null;

  const {
    marketPairs,
    isLoadingMarkets,
    loadLiveMarkets,
    oddsFormat,
    watchlists,
    toggleWatchlist,
    demoBalanceUsd,
    adjustDemoBalance,
    addJournalEntry,
  } = useTerminalStore();

  const [selectedVenue, setSelectedVenue] = useState<"polymarket" | "kalshi">(
    initialVenue === "kalshi" ? "kalshi" : "polymarket"
  );
  const [chartTab, setChartTab] = useState<ChartTab>("INTERACTIVE");
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1D");
  const [chartDisplayMode, setChartDisplayMode] = useState<ChartDisplayMode>("AREA");
  const [lowerTab, setLowerTab] = useState<LowerWorkstationTab>("TRADES");
  const [selectedSubmarketId, setSelectedSubmarketId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Load live markets if store is empty
  useEffect(() => {
    if (marketPairs.length === 0) {
      loadLiveMarkets("ALL");
    }
  }, [marketPairs.length, loadLiveMarkets]);

  // Find target market pair strictly from live markets
  const pair = useMemo(() => {
    return marketPairs.find((p) => p.id === pairId) || null;
  }, [marketPairs, pairId]);

  if (isLoadingMarkets || (marketPairs.length === 0 && !pair)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-center px-4 font-mono">
        <Loader2 className="h-8 w-8 text-[#00D688] animate-spin" />
        <h2 className="text-lg font-semibold text-white">Loading Market Data...</h2>
        <p className="text-xs text-zinc-500">Synchronizing live order books and contract feeds</p>
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-center px-4 font-mono">
        <h2 className="text-xl font-bold text-white">Market Not Found</h2>
        <p className="text-xs text-zinc-400">
          The requested prediction market contract could not be found.
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

  // Active submarket if multi-outcome event
  const activeSubmarket =
    pair.submarkets && pair.submarkets.length > 0
      ? selectedSubmarketId
        ? pair.submarkets.find((s) => s.id === selectedSubmarketId) || pair.submarkets[0]
        : pair.submarkets[0]
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
      case "Sports":
        return <Trophy className="h-4 w-4 text-orange-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-400" />;
    }
  };

  const handleExecuteTrade = ({
    outcome,
    orderType,
    action,
    amountUsd,
    limitPrice,
    slippage,
  }: {
    outcome: "YES" | "NO";
    orderType: "MARKET" | "LIMIT";
    action: "BUY" | "SELL";
    amountUsd: number;
    limitPrice?: number;
    slippage: number;
  }) => {
    const executedPrice = limitPrice ?? (outcome === "YES" ? effectiveYesPrice : effectiveNoPrice);

    if (action === "BUY") {
      adjustDemoBalance(-amountUsd);
    } else {
      adjustDemoBalance(amountUsd);
    }

    addJournalEntry({
      pairId: pair.id,
      marketTitle: activeSubmarket
        ? `${pair.canonicalTitle} (${activeSubmarket.title})`
        : pair.canonicalTitle,
      venue: selectedVenue === "kalshi" ? "Kalshi" : "Polymarket",
      position: outcome,
      entryPrice: executedPrice,
      sizeUsd: amountUsd,
      status: "OPEN",
      pnlUsd: 0,
      thesis: `${action} ${outcome} at ${convertOdds(executedPrice, oddsFormat)} via ${orderType} order.`,
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4 font-sans select-none">
      {/* 1. TOP BREADCRUMBS & VENUE TOGGLE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2638] pb-3">
        {/* Left: Back Link & Breadcrumbs */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/terminal"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-[#94A3B8] hover:text-white text-xs font-mono transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Terminal</span>
          </Link>

          <span className="text-[#334155] font-mono">/</span>

          <span className="text-xs font-mono text-[#94A3B8]">
            {pair.category}
          </span>

          <span className="text-[#334155] font-mono">/</span>

          <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
            {pair.canonicalTitle}
          </span>
        </div>

        {/* Right: Venue Perspective Switcher & Star Button */}
        <div className="flex items-center gap-2">
          {/* Venue Perspective Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#0F131C] border border-[#1E2638] text-xs font-mono">
            <button
              type="button"
              onClick={() => setSelectedVenue("polymarket")}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                selectedVenue === "polymarket"
                  ? "bg-[#00D688]/20 text-[#00FFA3] border border-[#00D688]/30"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Polymarket View
            </button>
            <button
              type="button"
              onClick={() => setSelectedVenue("kalshi")}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                selectedVenue === "kalshi"
                  ? "bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Kalshi View
            </button>
          </div>

          {/* Watchlist Star Button */}
          <button
            type="button"
            onClick={() => toggleWatchlist(pair.id)}
            className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-[#94A3B8] hover:text-amber-400 transition-colors"
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

      {/* 2. MARKET HEADER STRIP & STATS */}
      <div className="rounded-xl bg-[#121722] border border-[#1E2638] p-4 space-y-3 shadow-lg shadow-black/20">
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="relative h-12 w-12 rounded-lg bg-[#182030] border border-[#242E44] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
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
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#182030] border border-[#242E44] text-[#CBD5E1]">
                {pair.category}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#182030] border border-[#242E44] text-[#94A3B8]">
                {selectedVenue === "kalshi" ? "Kalshi" : "Polymarket"}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {pair.canonicalTitle}
            </h1>
            {activeSubmarket && (
              <p className="text-xs text-[#94A3B8] font-mono">
                Viewing Outcome:{" "}
                <span className="text-[#00FFA3] font-semibold">{activeSubmarket.title}</span>
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#1E2638] text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[#94A3B8] text-[11px]">YES Price</span>
            <p className="text-lg font-bold text-[#00FFA3] tabular-nums">
              {convertOdds(effectiveYesPrice, oddsFormat)}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#94A3B8] text-[11px]">NO Price</span>
            <p className="text-lg font-bold text-[#F43F5E] tabular-nums">
              {convertOdds(effectiveNoPrice, oddsFormat)}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#94A3B8] text-[11px]">24h Volume</span>
            <p className="text-sm font-semibold text-white tabular-nums">
              ${(currentVenueMarket.volume24h / 1_000_000).toFixed(2)}M
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#94A3B8] text-[11px]">Closes</span>
            <p className="text-sm font-semibold text-[#CBD5E1]">
              {pair.expiryDateFormatted}
            </p>
          </div>
        </div>
      </div>

      {/* 3. MULTI-OUTCOME CANDIDATE STRIP */}
      {pair.submarkets && pair.submarkets.length > 0 && (
        <div className="rounded-xl bg-[#121722] border border-[#1E2638] p-3 space-y-2 shadow-md font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Market Outcomes ({pair.submarkets.length})
            </span>
            <span className="text-[10px] text-[#94A3B8]">
              Select outcome to view chart &amp; order book
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {pair.submarkets.map((sub) => {
              const isSelected = activeSubmarket?.id === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubmarketId(sub.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#182030] border-[#3B82F6] shadow-sm text-white"
                      : "bg-[#0F131C] border-[#1E2638] hover:border-[#2E3C57] hover:bg-[#182030]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    {sub.image || sub.icon ? (
                      <img
                        src={sub.image || sub.icon}
                        alt={sub.title}
                        className="h-6 w-6 rounded object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    <span className="text-xs font-semibold text-white truncate">
                      {sub.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#00FFA3] shrink-0 tabular-nums">
                    {Math.round(sub.yesPrice * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MAIN WORKSPACE: TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Chart + Order Book + Tabs (8 cols / ~67%) */}
        <div className="lg:col-span-8 space-y-4">
          {/* CHART DESK */}
          <div className="rounded-xl bg-[#121722] border border-[#1E2638] overflow-hidden shadow-lg shadow-black/20 flex flex-col">
            {/* Chart Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#1E2638] bg-[#0F131C] font-mono text-xs">
              {/* Left Controls: Modes */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setChartTab("INTERACTIVE")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all font-medium ${
                    chartTab === "INTERACTIVE"
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Interactive Chart</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartTab("EMBED")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all font-medium ${
                    chartTab === "EMBED"
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>Venue Embed</span>
                </button>

                {/* Display Mode: Area vs Candles */}
                {chartTab === "INTERACTIVE" && (
                  <div className="flex items-center ml-2 border-l border-[#1E2638] pl-2 gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setChartDisplayMode("AREA")}
                      className={`px-1.5 py-0.5 rounded transition-all ${
                        chartDisplayMode === "AREA"
                          ? "bg-white/20 text-white font-bold"
                          : "text-[#64748B] hover:text-white"
                      }`}
                    >
                      Area
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartDisplayMode("CANDLESTICK")}
                      className={`px-1.5 py-0.5 rounded transition-all ${
                        chartDisplayMode === "CANDLESTICK"
                          ? "bg-white/20 text-white font-bold"
                          : "text-[#64748B] hover:text-white"
                      }`}
                    >
                      Candles
                    </button>
                  </div>
                )}
              </div>

              {/* Right Controls: Timeframe Selectors & Venue Link */}
              <div className="flex items-center gap-2">
                {chartTab === "INTERACTIVE" && (
                  <div className="flex items-center gap-1 bg-[#182030] border border-[#242E44] p-0.5 rounded text-[11px]">
                    {(["5m", "15m", "1h", "1D", "1W", "1M", "ALL"] as ChartTimeframe[]).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeframe(tf)}
                        className={`px-1.5 py-0.5 rounded transition-all ${
                          timeframe === tf
                            ? "bg-white/20 text-white font-bold"
                            : "text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}

                <a
                  href={currentVenueMarket.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#94A3B8] hover:text-white bg-[#182030] border border-[#242E44] transition-colors"
                  title="Open market on source platform"
                >
                  <span>Open</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Chart Body */}
            <div className="min-h-[380px] h-[380px] w-full relative bg-[#0B0E14]">
              {chartTab === "INTERACTIVE" ? (
                <TradingViewChart
                  currentPrice={effectiveYesPrice}
                  timeframe={timeframe}
                  displayMode={chartDisplayMode}
                  venue={selectedVenue}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-[#0B0E14] flex items-center justify-center">
                  {selectedVenue === "polymarket" ? (
                    <iframe
                      src={`https://embed.polymarket.com/market?market=${pair.polymarket.marketId}&theme=dark&chart=true&buybuttons=false&volume=true`}
                      className="w-full h-full border-none"
                      title="Polymarket Embed Chart"
                    />
                  ) : (
                    <iframe
                      src={`https://widgets.kalshi.com/external-widgets/events/${pair.kalshi.ticker}?widget_size=large&period=all&utm_medium=widget`}
                      className="w-full h-full border-none"
                      title="Kalshi Embed Chart"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ORDER BOOK & DEPTH SECTION */}
          <div className="h-[280px]">
            <OrderBookLadder
              orderBook={currentVenueMarket.orderBook}
              currentYesPrice={effectiveYesPrice}
              currentNoPrice={effectiveNoPrice}
              oddsFormat={oddsFormat}
              venue={selectedVenue}
            />
          </div>

          {/* LOWER WORKSTATION TABS: Trades, Holders, Rules */}
          <div className="rounded-xl bg-[#121722] border border-[#1E2638] overflow-hidden shadow-lg shadow-black/20">
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E2638] bg-[#0F131C] font-mono text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLowerTab("TRADES")}
                  className={`px-3 py-1 rounded transition-all font-semibold ${
                    lowerTab === "TRADES"
                      ? "bg-white/15 text-white"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Market Trades
                </button>
                <button
                  type="button"
                  onClick={() => setLowerTab("HOLDERS")}
                  className={`px-3 py-1 rounded transition-all font-semibold ${
                    lowerTab === "HOLDERS"
                      ? "bg-white/15 text-white"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Top Holders
                </button>
                <button
                  type="button"
                  onClick={() => setLowerTab("RULES")}
                  className={`px-3 py-1 rounded transition-all font-semibold ${
                    lowerTab === "RULES"
                      ? "bg-white/15 text-white"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Resolution Rules
                </button>
              </div>
            </div>

            {/* Tab Panels */}
            <div>
              {lowerTab === "TRADES" && (
                <MarketActivityTape
                  currentYesPrice={effectiveYesPrice}
                  currentNoPrice={effectiveNoPrice}
                  oddsFormat={oddsFormat}
                  marketTitle={pair.canonicalTitle}
                />
              )}

              {lowerTab === "HOLDERS" && (
                <MarketHoldersView
                  currentYesPrice={effectiveYesPrice}
                  currentNoPrice={effectiveNoPrice}
                  oddsFormat={oddsFormat}
                />
              )}

              {lowerTab === "RULES" && (
                <div className="p-4 space-y-3 font-sans text-xs text-[#CBD5E1] leading-relaxed">
                  <h3 className="font-bold text-white uppercase font-mono text-xs tracking-wider">
                    Market Rules &amp; Settlement Specification
                  </h3>
                  <p>
                    This contract settles based on official published reports from the primary
                    reporting entity. Contracts settle definitively at $1.00 USD for the outcome
                    determined to have occurred and $0.00 USD for the counter outcome.
                  </p>
                  <div className="pt-2 flex items-center gap-2 font-mono text-[#94A3B8] text-[11px]">
                    <span>Settlement Basis: $1.00 Guaranteed Cash</span>
                    <span>•</span>
                    <a
                      href={currentVenueMarket.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#38BDF8] hover:underline flex items-center gap-1"
                    >
                      <span>Official Source Rulebook</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 300px Desktop Execution Order Slip (4 cols / ~33%) */}
        <div className="lg:col-span-4 sticky top-4">
          <MarketOrderSlip
            marketTitle={pair.canonicalTitle}
            submarketTitle={activeSubmarket?.title}
            currentYesPrice={effectiveYesPrice}
            currentNoPrice={effectiveNoPrice}
            oddsFormat={oddsFormat}
            venue={selectedVenue}
            userBalanceUsd={demoBalanceUsd}
            onExecuteTrade={handleExecuteTrade}
          />
        </div>
      </div>
    </div>
  );
}
