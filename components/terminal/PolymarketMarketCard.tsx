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
  Landmark,
  CloudLightning,
  Cpu,
  Coins,
  Vote,
  Sparkles,
  ExternalLink,
  Trophy,
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

  const initialYesPercent = Math.round(pair.polymarket.yesPrice * 100);

  return (
    <div className="group relative rounded-xl bg-[#121722] hover:bg-[#161D2A] border border-[#1E2638] hover:border-[#2E3A54] p-4 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      {/* LEFT: Star, Category Avatar, Market Title & Metadata Strip */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Watchlist Star Toggle */}
        <button
          type="button"
          onClick={() => onToggleWatchlist(pair.id)}
          aria-label={isStarred ? "Remove from Watchlist" : "Add to Watchlist"}
          className="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors duration-150 mt-0.5"
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
        <div className="relative size-10 rounded-lg bg-[#182030] border border-[#242E44] overflow-hidden flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
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

        {/* Market Title, Resolution Date & Live Metadata */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              href={`/terminal/market/${pair.id}?venue=polymarket`}
              className="text-left font-semibold text-sm text-slate-100 hover:text-[#00FFA3] transition-colors duration-150 leading-snug line-clamp-2 text-balance"
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

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#182030] border border-[#242E44] text-slate-300 font-medium">
              {pair.category}
            </span>

            <span className="text-slate-600">•</span>

            <span className="font-mono text-slate-400">
              Resolves {pair.expiryDateFormatted}
            </span>

            <span className="text-slate-600">•</span>

            <span className="font-mono text-slate-200 font-semibold tabular-nums">
              ${(pair.polymarket.volume24h / 1_000_000).toFixed(1)}M Vol
            </span>
          </div>

          {/* Submarket Multi-Outcome Strip (Candidate Portraits & Odds) */}
          {pair.submarkets && pair.submarkets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 w-full max-w-xl">
              {pair.submarkets.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 p-1 px-2.5 rounded-md bg-[#182030] border border-[#242E44] hover:border-[#2E3A54] transition-colors duration-150 text-xs"
                >
                  {sub.image || sub.icon ? (
                    <img
                      src={sub.image || sub.icon}
                      alt={sub.title}
                      className="size-5 rounded object-cover shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-slate-200 font-medium truncate">
                      {sub.title}
                    </div>
                    <div className="text-[10px] font-mono text-[#00FFA3] font-bold tabular-nums">
                      {Math.round(sub.yesPrice * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Micro Hardware-Accelerated Probability Distribution Depth Bar */}
          <div className="w-full max-w-xs h-1.5 rounded-full bg-[#242E44] overflow-hidden flex mt-1.5">
            <div
              ref={depthBarRef}
              style={{ width: `${initialYesPercent}%` }}
              className="h-full bg-[#00D688] transition-[width] duration-200 ease-out"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: Polymarket Interactive Action Buttons (Sub-millisecond Direct DOM updates) */}
      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1E2638]">
        {/* BUY YES BUTTON */}
        <button
          ref={yesBtnRef}
          type="button"
          onClick={() => onOpenOrderSlip(pair.id, "YES")}
          className="relative overflow-hidden h-8 flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-3.5 rounded-lg bg-[#00D688]/10 hover:bg-[#00D688]/20 border border-[#00D688]/35 hover:border-[#00D688]/60 transition-all duration-150 text-[#00FFA3] font-mono group/btn cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00FFA3]">
            Buy Yes
          </span>
          <span
            ref={yesPriceRef}
            className="text-xs font-bold text-white group-hover/btn:text-emerald-300 tabular-nums font-mono"
          >
            {convertOdds(pair.polymarket.yesPrice, oddsFormat)}
          </span>
        </button>

        {/* BUY NO BUTTON */}
        <button
          ref={noBtnRef}
          type="button"
          onClick={() => onOpenOrderSlip(pair.id, "NO")}
          className="relative overflow-hidden h-8 flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-3.5 rounded-lg bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 border border-[#F43F5E]/35 hover:border-[#F43F5E]/60 transition-all duration-150 text-[#FB7185] font-mono group/btn cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FB7185]">
            Buy No
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
  );
});
