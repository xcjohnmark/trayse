"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  INITIAL_MARKET_PAIRS,
  generateTickUpdate,
} from "@/lib/mock/market-data";
import { NormalizedMarketPair, MarketCategory } from "@/lib/types/terminal";
import { convertOdds } from "@/lib/market/normalization";
import {
  Star,
  Zap,
  TrendingUp,
  SlidersHorizontal,
  Landmark,
  CloudLightning,
  Cpu,
  Coins,
  Vote,
  Sparkles,
  ArrowUpDown,
  Search,
} from "lucide-react";

type SortOption = "VOLUME_DESC" | "SPREAD_DESC" | "EXPIRY_ASC";

export default function TerminalMarketStreamPage() {
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    oddsFormat,
    watchlists,
    toggleWatchlist,
    setSelectedPairId,
    openOrderSlip,
  } = useTerminalStore();

  const [pairs, setPairs] = useState<NormalizedMarketPair[]>(INITIAL_MARKET_PAIRS);
  const [sortBy, setSortBy] = useState<SortOption>("VOLUME_DESC");

  // Simulated live micro-ticks (every 3.5s) to make markets feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setPairs((prev) =>
        prev.map((p) => {
          // 40% probability of micro-tick per cycle
          if (Math.random() < 0.4) {
            return generateTickUpdate(p);
          }
          return p;
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const categories: { id: MarketCategory | "All"; label: string }[] = [
    { id: "All", label: "All Markets" },
    { id: "Macro", label: "Macro" },
    { id: "Politics", label: "Politics" },
    { id: "Crypto", label: "Crypto" },
    { id: "Tech & Equities", label: "Tech & Equities" },
    { id: "Physical & Weather", label: "Weather" },
  ];

  // Filtering
  const filteredPairs = useMemo(() => {
    return pairs.filter((p) => {
      // Category filter
      if (activeCategory !== "All" && p.category !== activeCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.canonicalTitle.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesTicker =
          p.polymarket.ticker.toLowerCase().includes(q) ||
          p.kalshi.ticker.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesTicker) return false;
      }
      return true;
    });
  }, [pairs, activeCategory, searchQuery]);

  // Sorting
  const sortedPairs = useMemo(() => {
    const list = [...filteredPairs];
    if (sortBy === "VOLUME_DESC") {
      list.sort((a, b) => b.polymarket.volume24h - a.polymarket.volume24h);
    } else if (sortBy === "SPREAD_DESC") {
      list.sort((a, b) => b.divergenceBps - a.divergenceBps);
    } else if (sortBy === "EXPIRY_ASC") {
      list.sort((a, b) => a.expiryTimestamp - b.expiryTimestamp);
    }
    return list;
  }, [filteredPairs, sortBy]);

  // Market Category Icon helper
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

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
      {/* 1. TOP CONTROLS: Category Pills & Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F232F] pb-4">
        {/* Horizontal Category Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-[#12141C] text-zinc-400 hover:text-white hover:bg-white/5 border border-[#1F232F]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Market Count & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-400">
          <span className="font-mono text-[11px] text-zinc-500">
            {sortedPairs.length} {sortedPairs.length === 1 ? "Market" : "Markets"}
          </span>

          <div className="flex items-center gap-1.5 bg-[#12141C] border border-[#1F232F] rounded-lg px-2.5 py-1 text-xs">
            <ArrowUpDown className="h-3 w-3 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="VOLUME_DESC" className="bg-[#12141C] text-white">
                Highest Volume
              </option>
              <option value="SPREAD_DESC" className="bg-[#12141C] text-white">
                Highest Kalshi Spread
              </option>
              <option value="EXPIRY_ASC" className="bg-[#12141C] text-white">
                Expiring Soonest
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. MAIN STREAM: Pure Polymarket Market Rows */}
      {sortedPairs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-[#0B0C10] border border-[#1F232F] p-6 space-y-3">
          <Search className="h-8 w-8 text-zinc-600" />
          <h3 className="text-base font-semibold text-white">
            No prediction markets found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedPairs.map((pair) => {
            const isStarred = watchlists.includes(pair.id);
            const yesOdds = convertOdds(pair.polymarket.yesPrice, oddsFormat);
            const noOdds = convertOdds(pair.polymarket.noPrice, oddsFormat);

            // Spread calculation vs Kalshi
            const spreadPercent = (
              Math.abs(pair.polymarket.yesPrice - pair.kalshi.yesPrice) * 100
            ).toFixed(1);

            return (
              <div
                key={pair.id}
                className="group relative rounded-xl bg-[#0B0C10] hover:bg-[#10121A] border border-[#1A1D27] hover:border-[#272B3A] p-4 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                {/* LEFT: Star, Icon, Title, and Metadata Badges */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Star Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleWatchlist(pair.id)}
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

                  {/* Category Thumbnail Avatar */}
                  <div className="h-9 w-9 rounded-xl bg-[#12141C] border border-[#1F232F] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {renderCategoryIcon(pair.category)}
                  </div>

                  {/* Market Title & Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPairId(pair.id)}
                      className="text-left font-semibold text-sm sm:text-[15px] text-white hover:text-[#00FFA3] transition-colors leading-snug line-clamp-2"
                    >
                      {pair.canonicalTitle}
                    </button>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                      <span className="px-1.5 py-0.2 rounded font-mono bg-white/5 border border-white/10 text-zinc-300">
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

                      {/* Subtle Trayse Spread Badge */}
                      {pair.divergenceBps > 100 && (
                        <button
                          type="button"
                          onClick={() => setSelectedPairId(pair.id)}
                          className="flex items-center gap-1 px-2 py-0.2 rounded font-mono text-[10px] bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
                          title="Click to view Kalshi order book depth and spread"
                        >
                          <Zap className="h-3 w-3 text-blue-400" />
                          <span>+{spreadPercent}% vs Kalshi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Polymarket Interactive Trade Buttons */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1A1D27]">
                  {/* BUY YES BUTTON */}
                  <button
                    type="button"
                    onClick={() => openOrderSlip(pair.id, "YES")}
                    className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-emerald-400 font-mono group/btn"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      Buy Yes
                    </span>
                    <span className="text-sm font-bold text-white group-hover/btn:text-emerald-300">
                      {yesOdds}
                    </span>
                  </button>

                  {/* BUY NO BUTTON */}
                  <button
                    type="button"
                    onClick={() => openOrderSlip(pair.id, "NO")}
                    className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 transition-all text-rose-400 font-mono group/btn"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                      Buy No
                    </span>
                    <span className="text-sm font-bold text-white group-hover/btn:text-rose-300">
                      {noOdds}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
