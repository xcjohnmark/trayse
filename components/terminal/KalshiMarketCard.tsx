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
  Landmark,
  CloudLightning,
  Cpu,
  Coins,
  Vote,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Trophy,
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
      case "Sports":
        return <Trophy className="h-4 w-4 text-orange-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-400" />;
    }
  };

  const yesOdds = convertOdds(pair.kalshi.yesPrice, oddsFormat);
  const noOdds = convertOdds(pair.kalshi.noPrice, oddsFormat);
  const yesPercent = Math.round(pair.kalshi.yesPrice * 100);

  const [imageError, setImageError] = useState(false);
  const kalshiImage = !imageError && (pair.image || pair.icon || pair.kalshi.image || pair.kalshi.icon);

  return (
    <div className="group relative rounded-xl bg-[#121722] hover:bg-[#161D2A] border border-[#1E2638] hover:border-[#2E3A54] p-4 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      {/* LEFT: Star, Category Avatar, Kalshi Ticker, Title & Metadata Strip */}
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

        {/* Category / Visual Avatar */}
        <div className="relative size-10 rounded-lg bg-[#182030] border border-[#242E44] overflow-hidden flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
          {kalshiImage ? (
            <img
              src={kalshiImage}
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
              href={`/terminal/market/${pair.id}?venue=kalshi`}
              className="text-left font-semibold text-sm text-slate-100 hover:text-sky-300 transition-colors duration-150 leading-snug line-clamp-2 text-balance"
            >
              {pair.canonicalTitle}
            </Link>
            <a
              href={pair.kalshi.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open on Kalshi"
              className="text-slate-500 hover:text-slate-300 transition-colors duration-150 shrink-0 opacity-0 group-hover:opacity-100"
              title="Open on Kalshi"
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
              Closes {pair.expiryDateFormatted}
            </span>

            <span className="text-slate-600">•</span>

            <span className="font-mono text-slate-200 font-semibold tabular-nums">
              ${(pair.kalshi.volume24h / 1_000_000).toFixed(2)}M Vol
            </span>
          </div>

          {/* Submarket Multi-Outcome Strip (Candidate Outcomes & Odds) */}
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
                    <div className="text-[10px] font-mono text-sky-400 font-bold tabular-nums">
                      {Math.round(sub.yesPrice * 100)}¢
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Probability / Cents Depth Distribution Bar */}
          <div className="w-full max-w-xs h-1.5 rounded-full bg-[#242E44] overflow-hidden flex mt-1.5">
            <div
              style={{ width: `${yesPercent}%` }}
              className="h-full bg-sky-400 transition-[width] duration-200 ease-out"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: Kalshi Cents/Contract Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1E2638]">
        {/* BUY YES */}
        <button
          type="button"
          onClick={() => onOpenOrderSlip(pair.id, "YES")}
          className="h-8 flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-3.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/35 hover:border-sky-500/60 transition-all duration-150 text-sky-400 font-mono group/btn cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
            Yes
          </span>
          <span className="text-xs font-bold text-white group-hover/btn:text-sky-300 tabular-nums font-mono">
            {yesOdds}
          </span>
        </button>

        {/* BUY NO */}
        <button
          type="button"
          onClick={() => onOpenOrderSlip(pair.id, "NO")}
          className="h-8 flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-3.5 rounded-lg bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 border border-[#F43F5E]/35 hover:border-[#F43F5E]/60 transition-all duration-150 text-[#FB7185] font-mono group/btn cursor-pointer shadow-sm"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FB7185]">
            No
          </span>
          <span className="text-xs font-bold text-white group-hover/btn:text-rose-300 tabular-nums font-mono">
            {noOdds}
          </span>
        </button>
      </div>
    </div>
  );
});
