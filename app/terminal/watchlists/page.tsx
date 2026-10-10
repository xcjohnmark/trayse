"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { convertOdds } from "@/lib/market/normalization";
import { NormalizedMarketPair } from "@/lib/types/terminal";
import {
  Star,
  Layers,
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  LayoutGrid,
  Activity,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function WatchlistsPage() {
  const {
    watchlists,
    toggleWatchlist,
    setSelectedPairId,
    openModal,
    oddsFormat,
    marketPairs,
    loadLiveMarkets,
  } = useTerminalStore();

  useEffect(() => {
    if (marketPairs.length === 0) {
      loadLiveMarkets("ALL");
    }
  }, [marketPairs.length, loadLiveMarkets]);

  const starredPairs = marketPairs.filter((p) => watchlists.includes(p.id));

  return (
    <div className="flex flex-col h-full space-y-4 font-sans select-none overflow-y-auto pr-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121722] border border-[#1E2638] p-3.5 rounded-xl shadow-lg shadow-black/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Star className="h-4 w-4 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
              WATCHLIST MONITORING DESK
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                {starredPairs.length} PINNED
              </span>
            </h2>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              Dedicated high-frequency desk for your starred prediction markets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            href="/terminal"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-[#CBD5E1] hover:text-white transition-colors"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Market Browser</span>
          </Link>
          <Link
            href="/terminal/arbitrage"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D688]/15 hover:bg-[#00D688]/25 border border-[#00D688]/40 text-[#00FFA3] transition-colors font-bold"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Arb Radar</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {starredPairs.length === 0 ? (
        <div className="rounded-xl border border-[#1E2638] bg-[#121722] p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-lg shadow-black/20">
          <div className="h-12 w-12 rounded-full bg-[#182030] border border-[#242E44] flex items-center justify-center text-[#94A3B8]">
            <Star className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Markets in Watchlist</h3>
            <p className="text-xs text-[#94A3B8] font-mono max-w-sm">
              Click the star icon (★) next to any event in the Market Browser to pin it to this live desk.
            </p>
          </div>
          <Link
            href="/terminal"
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FFA3] hover:bg-[#00D688] text-black text-xs font-mono font-bold transition-all shadow-md shadow-[#00FFA3]/15 active:scale-[0.98]"
          >
            <span>Browse Markets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {starredPairs.map((pair) => {
            const aggregateVol = pair.polymarket.volume24h + pair.kalshi.volume24h;

            return (
              <div
                key={pair.id}
                className="rounded-xl border border-[#1E2638] bg-[#121722] hover:border-[#2E3C57] transition-all p-4 space-y-3 shadow-lg shadow-black/20"
              >
                {/* Header Row with 1-Click Unstar Action */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#1E2638]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#182030] border border-[#242E44] text-[#CBD5E1] font-semibold uppercase">
                        {pair.category}
                      </span>
                      {pair.hasArbitrage && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 font-bold flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5" />
                          ARB ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-white mt-1 line-clamp-1">
                      {pair.canonicalTitle}
                    </h3>
                    <p className="text-[10px] font-mono text-[#94A3B8] mt-0.5 flex items-center gap-2">
                      <span>EXP: {pair.expiryDateFormatted}</span>
                      <span className="text-[#334155]">•</span>
                      <span>
                        CURRENT SPREAD:{" "}
                        <span className="text-amber-300 font-bold">{pair.divergenceBps} BPS</span>
                      </span>
                    </p>
                  </div>

                  {/* 1-Click Star / Unstar Action */}
                  <button
                    type="button"
                    onClick={() => toggleWatchlist(pair.id)}
                    className="p-1.5 rounded-lg bg-[#182030] border border-[#242E44] text-amber-400 hover:text-[#94A3B8] hover:border-[#3B82F6] transition-colors flex items-center gap-1"
                    title="Click to remove from Watchlist"
                  >
                    <Star className="h-4 w-4 fill-amber-400" />
                  </button>
                </div>

                {/* Live Odds Grid: Polymarket & Kalshi */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  {/* Polymarket Card */}
                  <div className="bg-[#0F131C] border border-purple-500/20 p-2.5 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                      <span className="flex items-center gap-1 font-bold text-purple-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                        POLYMARKET
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      <div className="bg-[#182030] border border-[#242E44] p-1 rounded">
                        <span className="text-[9px] text-[#94A3B8] block">YES</span>
                        <span className="font-bold text-[#00FFA3]">
                          {convertOdds(pair.polymarket.yesPrice, oddsFormat)}
                        </span>
                      </div>
                      <div className="bg-[#182030] border border-[#242E44] p-1 rounded">
                        <span className="text-[9px] text-[#94A3B8] block">NO</span>
                        <span className="text-[#F43F5E]">
                          {convertOdds(pair.polymarket.noPrice, oddsFormat)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kalshi Card */}
                  <div className="bg-[#0F131C] border border-blue-500/20 p-2.5 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                      <span className="flex items-center gap-1 font-bold text-blue-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        KALSHI
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      <div className="bg-[#182030] border border-[#242E44] p-1 rounded">
                        <span className="text-[9px] text-[#94A3B8] block">YES</span>
                        <span className="font-bold text-[#00FFA3]">
                          {convertOdds(pair.kalshi.yesPrice, oddsFormat)}
                        </span>
                      </div>
                      <div className="bg-[#182030] border border-[#242E44] p-1 rounded">
                        <span className="text-[9px] text-[#94A3B8] block">NO</span>
                        <span className="text-[#F43F5E]">
                          {convertOdds(pair.kalshi.noPrice, oddsFormat)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Row: Depth Ladder & Arbitrage Radar */}
                <div className="flex items-center justify-between pt-1 border-t border-[#1E2638] text-xs font-mono">
                  <div className="text-[11px] text-[#94A3B8]">
                    24h Vol: ${(aggregateVol / 1000).toFixed(0)}k
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Action: Open Depth Ladder */}
                    <button
                      type="button"
                      onClick={() => setSelectedPairId(pair.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-[#CBD5E1] hover:text-white text-[11px] transition-colors"
                      title="Open Side-by-Side Depth Ladder"
                    >
                      <Layers className="h-3 w-3 text-[#A78BFA]" />
                      <span>Depth Ladder</span>
                    </button>

                    {/* Quick Action: Open Arbitrage Radar */}
                    <Link
                      href="/terminal/arbitrage"
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00D688]/15 hover:bg-[#00D688]/25 border border-[#00D688]/40 text-[#00FFA3] text-[11px] font-bold transition-colors"
                      title="View on Arbitrage Radar"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Arb Radar</span>
                    </Link>

                    {/* Optional Correlated Equity Hedge Button */}
                    {pair.correlatedEquityTicker && (
                      <button
                        type="button"
                        onClick={() => openModal("ROBINHOOD_HEDGE", pair.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] transition-colors"
                        title="Delta hedge on Robinhood Chain L2"
                      >
                        <ShieldCheck className="h-3 w-3 text-amber-400" />
                        <span>{pair.correlatedEquityTicker}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
