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
  Zap,
  Landmark,
  CloudLightning,
  Cpu,
  Coins,
  Vote,
  Sparkles,
  ExternalLink,
  Layers,
} from "lucide-react";

interface PolymarketMarketCardProps {
  pair: NormalizedMarketPair;
  isStarred: boolean;
  onToggleWatchlist: (pairId: string) => void;
  onSelectPair: (pairId: string) => void;
  onOpenOrderSlip: (pairId: string, outcome: "YES" | "NO") => void;
  oddsFormat: OddsFormat;
}

export const PolymarketMarketCard = memo(function PolymarketMarketCard({
  pair,
  isStarred,
  onToggleWatchlist,
  onSelectPair,
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
  const spreadBadgeRef = useRef<HTMLSpanElement>(null);
  const depthBarRef = useRef<HTMLDivElement>(null);

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

      // Live depth ratio bar update
      if (depthBarRef.current) {
        const yesPercent = Math.round(newYes * 100);
        depthBarRef.current.style.width = `${yesPercent}%`;
      }

      // Dynamic spread update vs Kalshi
      if (spreadBadgeRef.current) {
        const diffPercent = (Math.abs(newYes - pair.kalshi.yesPrice) * 100).toFixed(1);
        spreadBadgeRef.current.textContent = `+${diffPercent}% vs Kalshi`;
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
    pair.kalshi.yesPrice,
    oddsFormat,
    updatePolymarketTick,
  ]);

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

  const initialSpreadPercent = (
    Math.abs(pair.polymarket.yesPrice - pair.kalshi.yesPrice) * 100
  ).toFixed(1);

  const initialYesPercent = Math.round(pair.polymarket.yesPrice * 100);

  return (
    <div className="group relative rounded-xl bg-[#0B0C10] hover:bg-[#10121A] border border-[#1A1D27] hover:border-[#272B3A] p-4 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      {/* LEFT: Star, Category Avatar, Market Title & Metadata Strip */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Watchlist Star Toggle */}
        <button
          type="button"
          onClick={() => onToggleWatchlist(pair.id)}
          className="p-1 rounded text-zinc-600 hover:text-amber-400 transition-colors mt-0.5"
          title={isStarred ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <Star
            className={`h-4 w-4 ${
              isStarred
                ? "fill-amber-400 text-amber-400"
                : "text-zinc-600 group-hover:text-zinc-400"
            }`}
          />
        </button>

        {/* Category / Official Image Avatar */}
        <div className="relative h-10 w-10 rounded-xl bg-[#12141C] border border-[#1F232F] overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
          {marketImage ? (
            <img
              src={marketImage}
              alt={pair.canonicalTitle}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderCategoryIcon(pair.category)
          )}
        </div>

        {/* Market Title, Resolution Date & Live Spread Badge */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              href={`/terminal/market/${pair.id}?venue=polymarket`}
              className="text-left font-semibold text-sm sm:text-[15px] text-white hover:text-[#00FFA3] transition-colors leading-snug line-clamp-2"
            >
              {pair.canonicalTitle}
            </Link>
            <a
              href={pair.polymarket.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              title="Open on Polymarket"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
            <span className="px-1.5 py-0.5 rounded font-mono bg-white/5 border border-white/10 text-zinc-300">
              {pair.category}
            </span>

            <span>•</span>

            <span className="font-mono text-zinc-400">
              Resolves {pair.expiryDateFormatted}
            </span>

            <span>•</span>

            <span className="font-mono text-zinc-300 font-semibold">
              ${(pair.polymarket.volume24h / 1_000_000).toFixed(1)}M Vol
            </span>

            {/* Live Arbitrage Spread vs Kalshi */}
            {pair.divergenceBps > 100 && (
              <button
                type="button"
                onClick={() => onSelectPair(pair.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
                title="Click to view cross-venue depth and arbitrage ladder"
              >
                <Zap className="h-3 w-3 text-blue-400 animate-pulse-subtle" />
                <span ref={spreadBadgeRef}>+{initialSpreadPercent}% vs Kalshi</span>
              </button>
            )}

            {/* Quick Order Book Depth Trigger */}
            <button
              type="button"
              onClick={() => onSelectPair(pair.id)}
              className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
            >
              <Layers className="h-3 w-3" />
              <span>Depth Ladder</span>
            </button>
          </div>

          {/* Submarket Multi-Outcome Strip (Candidate Portraits & Odds) */}
          {pair.submarkets && pair.submarkets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 w-full max-w-xl">
              {pair.submarkets.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-[#141620] border border-white/5 hover:border-white/15 transition-all text-xs"
                >
                  {sub.image || sub.icon ? (
                    <img
                      src={sub.image || sub.icon}
                      alt={sub.title}
                      className="h-6 w-6 rounded-md object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-zinc-200 font-medium truncate">
                      {sub.title}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                      {Math.round(sub.yesPrice * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Micro Hardware-Accelerated Probability Distribution Depth Bar */}
          <div className="w-full max-w-xs h-1 rounded-full bg-rose-500/30 overflow-hidden flex mt-1">
            <div
              ref={depthBarRef}
              style={{ width: `${initialYesPercent}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: Polymarket Interactive Action Buttons (Sub-millisecond Direct DOM updates) */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1A1D27]">
        {/* BUY YES BUTTON */}
        <button
          ref={yesBtnRef}
          type="button"
          onClick={() => onOpenOrderSlip(pair.id, "YES")}
          className="relative overflow-hidden flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-emerald-400 font-mono group/btn cursor-pointer"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Buy Yes
          </span>
          <span
            ref={yesPriceRef}
            className="text-sm font-bold text-white group-hover/btn:text-emerald-300 tabular-nums"
          >
            {convertOdds(pair.polymarket.yesPrice, oddsFormat)}
          </span>
        </button>

        {/* BUY NO BUTTON */}
        <button
          ref={noBtnRef}
          type="button"
          onClick={() => onOpenOrderSlip(pair.id, "NO")}
          className="relative overflow-hidden flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 transition-all text-rose-400 font-mono group/btn cursor-pointer"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
            Buy No
          </span>
          <span
            ref={noPriceRef}
            className="text-sm font-bold text-white group-hover/btn:text-rose-300 tabular-nums"
          >
            {convertOdds(pair.polymarket.noPrice, oddsFormat)}
          </span>
        </button>
      </div>
    </div>
  );
});
