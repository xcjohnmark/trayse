"use client";

import React, { memo, useState } from "react";
import Link from "next/link";
import {
  NormalizedMarketPair,
  OddsFormat,
  MarketCategory,
} from "@/lib/types/terminal";
import { convertOdds } from "@/lib/market/normalization";
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
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface KalshiMarketCardProps {
  pair: NormalizedMarketPair;
  isStarred: boolean;
  onToggleWatchlist: (pairId: string) => void;
  onOpenOrderSlip: (pairId: string, outcome: "YES" | "NO") => void;
  oddsFormat: OddsFormat;
}

export const KalshiMarketCard = memo(function KalshiMarketCard({
  pair,
  isStarred,
  onToggleWatchlist,
  onOpenOrderSlip,
  oddsFormat,
}: KalshiMarketCardProps) {
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

  const yesOdds = convertOdds(pair.kalshi.yesPrice, oddsFormat);
  const noOdds = convertOdds(pair.kalshi.noPrice, oddsFormat);

  const spreadPercent = (
    Math.abs(pair.kalshi.yesPrice - pair.polymarket.yesPrice) * 100
  ).toFixed(1);

  const yesPercent = Math.round(pair.kalshi.yesPrice * 100);

  const [imageError, setImageError] = useState(false);
  const kalshiImage = !imageError && (pair.image || pair.icon || pair.kalshi.image || pair.kalshi.icon);

  return (
    <div className="group relative rounded-xl bg-[#090B10] hover:bg-[#0E1118] border border-[#161A26] hover:border-[#242A3E] p-4 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      {/* LEFT: Star, Category Avatar, Kalshi Ticker, Title & Metadata Strip */}
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

        {/* Category / Visual Avatar */}
        <div className="relative h-10 w-10 rounded-xl bg-[#121622] border border-[#1E2538] overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
          {kalshiImage ? (
            <img
              src={kalshiImage}
              alt={pair.canonicalTitle}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            renderCategoryIcon(pair.category)
          )}
        </div>

        {/* Title & Metadata Strip */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-400 border border-sky-800/40 font-semibold tracking-wider">
              {pair.kalshi.ticker}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="h-3 w-3" />
              CFTC
            </span>
            <a
              href={pair.kalshi.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              title="Open on Kalshi.com"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Standalone Page Link (Opens dedicated market detail page) */}
          <Link
            href={`/terminal/market/${pair.id}?venue=kalshi`}
            className="block text-left font-semibold text-sm sm:text-[15px] text-white hover:text-sky-300 transition-colors leading-snug line-clamp-2"
          >
            {pair.canonicalTitle}
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
            <span className="px-1.5 py-0.5 rounded font-mono bg-white/5 border border-white/10 text-zinc-300">
              {pair.category}
            </span>

            <span>•</span>

            <span className="font-mono text-zinc-400">
              Closes {pair.expiryDateFormatted}
            </span>

            <span>•</span>

            <span className="font-mono text-zinc-300 font-semibold">
              ${(pair.kalshi.volume24h / 1_000_000).toFixed(2)}M Vol
            </span>

            {/* Kalshi vs Polymarket Divergence Spread Badge */}
            {pair.divergenceBps > 100 && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] bg-purple-500/15 border border-purple-500/30 text-purple-300"
                title="Spread vs Polymarket odds"
              >
                <Zap className="h-3 w-3 text-purple-400" />
                <span>+{spreadPercent}% vs Polymarket</span>
              </span>
            )}
          </div>

          {/* Submarket Multi-Outcome Strip (Candidate Outcomes & Odds) */}
          {pair.submarkets && pair.submarkets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 w-full max-w-xl">
              {pair.submarkets.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-[#11141E] border border-white/5 hover:border-white/15 transition-all text-xs"
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
                    <div className="text-[10px] font-mono text-sky-400 font-semibold">
                      {Math.round(sub.yesPrice * 100)}¢
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Probability / Cents Depth Distribution Bar */}
          <div className="w-full max-w-xs h-1 rounded-full bg-rose-500/30 overflow-hidden flex mt-1">
            <div
              style={{ width: `${yesPercent}%` }}
              className="h-full bg-sky-400 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: Kalshi Cents/Contract Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#161A26]">
        {/* BUY YES (Kalshi Style) */}
        <button
          type="button"
          onClick={() => onOpenOrderSlip(pair.id, "YES")}
          className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-500/60 transition-all text-sky-400 font-mono group/btn cursor-pointer"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
            Yes
          </span>
          <span className="text-sm font-bold text-white group-hover/btn:text-sky-300 tabular-nums">
            {yesOdds}
          </span>
        </button>

        {/* BUY NO (Kalshi Style) */}
        <button
          type="button"
          onClick={() => onOpenOrderSlip(pair.id, "NO")}
          className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 transition-all text-rose-400 font-mono group/btn cursor-pointer"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
            No
          </span>
          <span className="text-sm font-bold text-white group-hover/btn:text-rose-300 tabular-nums">
            {noOdds}
          </span>
        </button>
      </div>
    </div>
  );
});
