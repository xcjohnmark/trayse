"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import Link from "next/link";
import {
  NormalizedMarketPair,
  OddsFormat,
  MarketCategory,
} from "@/lib/types/terminal";
import { convertOdds } from "@/lib/market/normalization";
import { polymarketFeed } from "@/lib/market/polymarket-feed";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  Star,
  CloudLightning,
  Cpu,
  Coins,
  Vote,
  Sparkles,
  ExternalLink,
  Trophy,
  TrendingUp,
  Gamepad2,
  ShieldAlert,
  LineChart,
  Globe,
  Film,
  DollarSign,
  MessageSquareQuote,
} from "lucide-react";

interface PolymarketMarketCardProps {
  pair: NormalizedMarketPair;
  isStarred: boolean;
  onToggleWatchlist: (pairId: string) => void;
  onSelectPair: (pairId: string) => void;
  onOpenOrderSlip: (pairId: string, outcome: "YES" | "NO") => void;
  oddsFormat: OddsFormat;
}

function formatCurrency(val?: number): string {
  if (!val || val === 0) return "$0";
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${Math.round(val)}`;
}

export const PolymarketMarketCard = memo(function PolymarketMarketCard({
  pair,
  isStarred,
  onToggleWatchlist,
  onOpenOrderSlip,
  oddsFormat,
}: PolymarketMarketCardProps) {
  const updatePolymarketTick = useTerminalStore((s) => s.updatePolymarketTick);
  const [imageError, setImageError] = useState(false);
  const marketImage = !imageError && (pair.image || pair.icon || pair.polymarket.image || pair.polymarket.icon);

  // Direct DOM Refs for Bloomberg-grade sub-millisecond updates (bypasses React re-renders)
  const yesPriceRef = useRef<HTMLSpanElement>(null);
  const noPriceRef = useRef<HTMLSpanElement>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  // Keep a local price tracker for tick delta flash calculations
  const localPrices = useRef({
    yes: pair.polymarket.yesPrice,
    no: pair.polymarket.noPrice,
  });

  const assetId = pair.polymarket.assetId;

  useEffect(() => {
    // Subscribe directly to the high-frequency feed hub off-thread stream
    const unsubscribe = polymarketFeed.onTick((tick) => {
      const isMatch =
        (assetId && tick.assetId === assetId) ||
        tick.pairId === pair.id ||
        tick.pairId === pair.polymarket.marketId;

      if (!isMatch) return;

      const prevYes = localPrices.current.yes;
      const newYes = tick.yesPrice;
      const newNo = tick.noPrice;

      localPrices.current = { yes: newYes, no: newNo };

      // Sub-millisecond direct DOM text content update
      if (yesPriceRef.current) {
        yesPriceRef.current.textContent = convertOdds(newYes, oddsFormat);
      }
      if (noPriceRef.current) {
        noPriceRef.current.textContent = convertOdds(newNo, oddsFormat);
      }

      // Bloomberg-grade visual tick flashes
      const isUp = newYes > prevYes;
      const isDown = newYes < prevYes;

      if (isUp && yesBtnRef.current) {
        yesBtnRef.current.classList.remove("tick-flash-green", "tick-flash-red");
        void yesBtnRef.current.offsetWidth; // Force reflow
        yesBtnRef.current.classList.add("tick-flash-green");
      } else if (isDown && yesBtnRef.current) {
        yesBtnRef.current.classList.remove("tick-flash-green", "tick-flash-red");
        void yesBtnRef.current.offsetWidth;
        yesBtnRef.current.classList.add("tick-flash-red");
      }

      // Propagate into global Zustand store (batched) for Arbitrage & Ladder modals
      updatePolymarketTick(tick);
    });

    return () => {
      unsubscribe();
    };
  }, [
    assetId,
    pair.id,
    pair.polymarket.marketId,
    oddsFormat,
    updatePolymarketTick,
  ]);

  const renderCategoryIcon = (category: MarketCategory) => {
    switch (category) {
      case "Trending":
        return <TrendingUp className="h-4 w-4 text-sky-400" />;
      case "Politics":
        return <Vote className="h-4 w-4 text-rose-400" />;
      case "Sports":
        return <Trophy className="h-4 w-4 text-orange-400" />;
      case "Crypto":
        return <Coins className="h-4 w-4 text-emerald-400" />;
      case "Esports":
        return <Gamepad2 className="h-4 w-4 text-violet-400" />;
      case "Iran":
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case "Finance":
        return <LineChart className="h-4 w-4 text-cyan-400" />;
      case "Geopolitics":
        return <Globe className="h-4 w-4 text-blue-400" />;
      case "Tech":
      case "Tech & Equities":
        return <Cpu className="h-4 w-4 text-purple-400" />;
      case "Culture":
        return <Film className="h-4 w-4 text-pink-400" />;
      case "Economy":
      case "Macro":
        return <DollarSign className="h-4 w-4 text-emerald-400" />;
      case "Weather":
      case "Physical & Weather":
        return <CloudLightning className="h-4 w-4 text-amber-400" />;
      case "Elections":
        return <Vote className="h-4 w-4 text-indigo-400" />;
      case "Mentions":
        return <MessageSquareQuote className="h-4 w-4 text-teal-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-400" />;
    }
  };

  const chg = pair.oneDayPriceChange;
  const spreadCents = pair.spreadCents ?? pair.polymarket.spreadCents ?? 0.01;
  const totalVol = pair.totalVolumeUsd ?? pair.polymarket.totalVolumeUsd ?? Math.round(pair.polymarket.volume24h * 3.5);

  return (
    <div className="group relative rounded-xl bg-[#121722] hover:bg-[#161D2A] border border-[#1E2638] hover:border-[#2E3A54] p-3.5 transition-all duration-150 flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-4 shadow-sm">
      {/* 1. LEFT: Star, Category Avatar, Market Title & Resolution Countdown */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Watchlist Star Toggle */}
        <button
          type="button"
          onClick={() => onToggleWatchlist(pair.id)}
          aria-label={isStarred ? "Remove from Watchlist" : "Add to Watchlist"}
          className="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors duration-150 mt-0.5 shrink-0"
          title={isStarred ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <Star
            className={`size-3.5 ${
              isStarred
                ? "fill-amber-400 text-amber-400"
                : "text-slate-500 group-hover:text-slate-300"
            }`}
          />
        </button>

        {/* Category / Official Image Avatar */}
        <div className="relative size-9 rounded-md bg-[#182030] border border-[#242E44] overflow-hidden flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
          {marketImage ? (
            <img
              src={marketImage}
              alt={pair.canonicalTitle}
              className="size-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderCategoryIcon(pair.category)
          )}
        </div>

        {/* Title & Resolution Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/terminal/market/${pair.id}?venue=polymarket`}
              className="text-left font-semibold text-sm text-slate-100 hover:text-[#00FFA3] transition-colors duration-150 leading-snug line-clamp-1 text-balance"
              title={pair.canonicalTitle}
            >
              {pair.canonicalTitle}
            </Link>
            <a
              href={pair.polymarket.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open on Polymarket"
              className="text-slate-500 hover:text-slate-300 transition-colors duration-150 shrink-0 opacity-0 group-hover:opacity-100"
              title="Open on Polymarket"
            >
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Ends In countdown */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">Ends in:</span>
            <span
              className={`tabular-nums ${
                pair.isUrgentResolution
                  ? "text-amber-300 font-medium"
                  : "text-slate-300"
              }`}
            >
              {pair.timeToResolution
                ? `${pair.timeToResolution} · ${pair.expiryDateFormatted}`
                : pair.expiryDateFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* 2. RIGHT: Future.news & Bullpen.fi 7 Key Columns (Probability, 24h Chg, Spread, 24h Vol, Total Vol, Liq, Actions) */}
      <div className="flex flex-wrap xl:flex-nowrap items-center justify-between xl:justify-end gap-3 xl:gap-5 pt-2 xl:pt-0 border-t xl:border-t-0 border-[#1E2638] text-right">
        {/* Column 1: Probability */}
        <div className="flex flex-col items-end min-w-[68px]">
          <span
            ref={yesPriceRef}
            className="font-mono text-sm xl:text-base font-bold text-white tabular-nums tracking-tight"
          >
            {convertOdds(pair.polymarket.yesPrice, oddsFormat)}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase">
            Yes
          </span>
        </div>

        {/* Column 2: 24h Change */}
        <div className="flex flex-col items-end min-w-[62px]">
          {chg !== undefined && chg !== null && Math.abs(chg) > 0.0001 ? (
            <span
              className={`font-mono text-xs xl:text-sm font-semibold tabular-nums ${
                chg >= 0 ? "text-[#00D688]" : "text-rose-400"
              }`}
            >
              {chg >= 0 ? "+" : ""}
              {(chg * 100).toFixed(1)}%
            </span>
          ) : (
            <span className="font-mono text-xs xl:text-sm text-slate-500 tabular-nums">—</span>
          )}
          <span className="text-[10px] text-slate-500 font-mono">24h Chg</span>
        </div>

        {/* Column 3: Spread */}
        <div className="flex flex-col items-end min-w-[50px]">
          <span className="font-mono text-xs xl:text-sm text-slate-300 tabular-nums">
            {spreadCents.toFixed(1)}¢
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Spread</span>
        </div>

        {/* Column 4: 24h Volume */}
        <div className="flex flex-col items-end min-w-[65px]">
          <span className="font-mono text-xs xl:text-sm text-slate-200 font-medium tabular-nums">
            {formatCurrency(pair.polymarket.volume24h)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">24h Vol</span>
        </div>

        {/* Column 5: Total Volume */}
        <div className="flex flex-col items-end min-w-[65px]">
          <span className="font-mono text-xs xl:text-sm text-slate-400 tabular-nums">
            {formatCurrency(totalVol)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Total Vol</span>
        </div>

        {/* Column 6: Liquidity */}
        <div className="flex flex-col items-end min-w-[60px]">
          <span className="font-mono text-xs xl:text-sm text-slate-300 tabular-nums">
            {formatCurrency(pair.polymarket.liquidityUsd)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Liq</span>
        </div>

        {/* Column 7: Actions (Institutional Buy Yes / Buy No Buttons) */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          {/* BUY YES BUTTON */}
          <button
            ref={yesBtnRef}
            type="button"
            onClick={() => onOpenOrderSlip(pair.id, "YES")}
            className="h-8 min-w-[60px] px-2.5 rounded-md bg-[#00D688]/10 hover:bg-[#00D688]/20 border border-[#00D688]/30 hover:border-[#00D688]/60 transition-all duration-150 text-[#00FFA3] font-mono group/btn cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00FFA3]">
              Yes
            </span>
            <span className="text-xs font-bold text-white group-hover/btn:text-emerald-300 tabular-nums font-mono">
              {convertOdds(pair.polymarket.yesPrice, oddsFormat)}
            </span>
          </button>

          {/* BUY NO BUTTON */}
          <button
            ref={noBtnRef}
            type="button"
            onClick={() => onOpenOrderSlip(pair.id, "NO")}
            className="h-8 min-w-[60px] px-2.5 rounded-md bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 border border-[#F43F5E]/30 hover:border-[#F43F5E]/60 transition-all duration-150 text-[#FB7185] font-mono group/btn cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FB7185]">
              No
            </span>
            <span
              ref={noPriceRef}
              className="text-xs font-bold text-white group-hover/btn:text-rose-300 tabular-nums font-mono"
            >
              {convertOdds(pair.polymarket.noPrice, oddsFormat)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});
