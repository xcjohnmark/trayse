"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { MarketCategory } from "@/lib/types/terminal";
import { PolymarketMarketCard } from "@/components/terminal/PolymarketMarketCard";
import { KalshiMarketCard } from "@/components/terminal/KalshiMarketCard";
import { usePolymarketStream } from "@/lib/hooks/usePolymarketStream";
import {
  ArrowUpDown,
  Search,
  Globe2,
  RotateCw,
  Loader2,
} from "lucide-react";

type SortOption = "VOLUME_DESC" | "EXPIRY_ASC";

export default function TerminalMarketStreamPage() {
  const {
    activeCategory,
    setActiveCategory,
    activeVenueTab,
    setActiveVenueTab,
    searchQuery,
    setSearchQuery,
    oddsFormat,
    watchlists,
    toggleWatchlist,
    setSelectedPairId,
    openOrderSlip,
    marketPairs,
    isLoadingMarkets,
    loadLiveMarkets,
  } = useTerminalStore();

  const [sortBy, setSortBy] = useState<SortOption>("VOLUME_DESC");

  // Load live markets dynamically on mount and when venue tab switches
  useEffect(() => {
    loadLiveMarkets(activeVenueTab);
  }, [activeVenueTab, loadLiveMarkets]);

  // Extract all active Polymarket CLOB asset IDs (primary + submarkets) to stream via Web Worker
  const assetIds = useMemo(() => {
    const ids: string[] = [];
    for (const p of marketPairs) {
      if (p.polymarket?.assetId) ids.push(p.polymarket.assetId);
      if (p.submarkets) {
        for (const sub of p.submarkets) {
          if (sub.assetId) ids.push(sub.assetId);
        }
      }
    }
    return ids;
  }, [marketPairs]);

  // Mount dedicated off-thread WebSocket stream and 16.6ms conflation worker
  usePolymarketStream(assetIds);

  const categories: { id: MarketCategory | "All"; label: string }[] = [
    { id: "All", label: "All Categories" },
    { id: "Physical & Weather", label: "Weather" },
    { id: "Crypto", label: "Crypto" },
    { id: "Politics", label: "Politics" },
    { id: "Tech & Equities", label: "Tech & Science" },
    { id: "Macro", label: "Macro & Finance" },
    { id: "Sports", label: "Sports" },
  ];

  // Filtering by Category, Venue & Search
  const filteredPairs = useMemo(() => {
    return marketPairs.filter((p) => {
      // Venue tab filter
      if (activeVenueTab === "POLYMARKET") {
        if (p.id.startsWith("kalshi-")) return false;
      } else if (activeVenueTab === "KALSHI") {
        if (p.id.startsWith("pm-")) return false;
      }

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
  }, [marketPairs, activeCategory, activeVenueTab, searchQuery]);

  // Sorting
  const sortedPairs = useMemo(() => {
    const list = [...filteredPairs];
    if (sortBy === "VOLUME_DESC") {
      list.sort((a, b) => {
        const volA =
          activeVenueTab === "KALSHI"
            ? a.kalshi.volume24h
            : a.polymarket.volume24h;
        const volB =
          activeVenueTab === "KALSHI"
            ? b.kalshi.volume24h
            : b.polymarket.volume24h;
        return volB - volA;
      });
    } else if (sortBy === "EXPIRY_ASC") {
      list.sort((a, b) => a.expiryTimestamp - b.expiryTimestamp);
    }
    return list;
  }, [filteredPairs, sortBy, activeVenueTab]);

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3.5">
      {/* 1. TOP VENUE TABS: ALL | POLYMARKET | KALSHI */}
      <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
        <div className="flex items-center gap-2">
          {/* ALL MARKETS TAB */}
          <button
            type="button"
            onClick={() => setActiveVenueTab("ALL")}
            className={`flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
              activeVenueTab === "ALL"
                ? "bg-white text-black shadow-sm font-bold"
                : "bg-[#121722] text-slate-400 hover:text-white hover:bg-[#182030] border border-[#1E2638] hover:border-[#2E3A54]"
            }`}
          >
            <Globe2 className="size-3.5" />
            <span>All Markets</span>
          </button>

          {/* POLYMARKET MIRROR TAB */}
          <button
            type="button"
            onClick={() => setActiveVenueTab("POLYMARKET")}
            className={`flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
              activeVenueTab === "POLYMARKET"
                ? "bg-[#00D688]/15 text-[#00FFA3] border border-[#00D688]/50 font-bold shadow-sm shadow-[#00D688]/10"
                : "bg-[#121722] text-slate-400 hover:text-white hover:bg-[#182030] border border-[#1E2638] hover:border-[#2E3A54]"
            }`}
          >
            <div className="size-1.5 rounded-full bg-[#00D688]" />
            <span>Polymarket</span>
          </button>

          {/* KALSHI MIRROR TAB */}
          <button
            type="button"
            onClick={() => setActiveVenueTab("KALSHI")}
            className={`flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
              activeVenueTab === "KALSHI"
                ? "bg-sky-500/15 text-sky-400 border border-sky-500/50 font-bold shadow-sm shadow-sky-500/10"
                : "bg-[#121722] text-slate-400 hover:text-white hover:bg-[#182030] border border-[#1E2638] hover:border-[#2E3A54]"
            }`}
          >
            <div className="size-1.5 rounded-full bg-sky-400" />
            <span>Kalshi</span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY PILLS & SORTING BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2638] pb-3">
        {/* Horizontal Category Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap h-7 px-3 rounded-md text-xs font-medium transition-colors duration-150 flex items-center ${
                  isActive
                    ? "bg-[#1E273A] text-white font-semibold border border-white/25 shadow-sm"
                    : "bg-[#121722] text-slate-400 hover:text-white hover:bg-[#182030] border border-[#1E2638] hover:border-[#2E3A54]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Market Count, Sync Feeds & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => loadLiveMarkets(activeVenueTab)}
            disabled={isLoadingMarkets}
            aria-label="Sync live market feeds from Polymarket and Kalshi"
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[#121722] hover:bg-[#182030] border border-[#1E2638] hover:border-[#2E3A54] text-slate-300 transition-colors duration-150 disabled:opacity-60 text-xs"
            title="Refresh live catalog from Polymarket & Kalshi"
          >
            <RotateCw className={`size-3 text-slate-400 ${isLoadingMarkets ? "animate-spin text-[#00D688]" : ""}`} />
            <span className="hidden sm:inline">{isLoadingMarkets ? "Syncing..." : "Sync Feeds"}</span>
          </button>

          <span className="font-mono text-[11px] text-slate-400">
            <strong className="text-white tabular-nums font-semibold">{sortedPairs.length}</strong>{" "}
            {sortedPairs.length === 1 ? "Market" : "Markets"}
          </span>

          <div className="flex items-center gap-1.5 h-7 bg-[#121722] border border-[#1E2638] hover:border-[#2E3A54] rounded-md px-2.5 text-xs transition-colors">
            <ArrowUpDown className="size-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort prediction markets"
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="VOLUME_DESC" className="bg-[#121722] text-white">
                Highest Volume
              </option>
              <option value="EXPIRY_ASC" className="bg-[#121722] text-white">
                Expiring Soonest
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAIN MARKET STREAM GRID */}
      {isLoadingMarkets && sortedPairs.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-[#121722] border border-[#1E2638] p-3.5 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-[#182030] border border-[#242E44]" />
                <div className="space-y-2">
                  <div className="h-4 w-64 bg-white/10 rounded" />
                  <div className="h-3 w-32 bg-white/5 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-white/5 rounded-lg border border-white/5" />
                <div className="h-8 w-20 bg-white/5 rounded-lg border border-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedPairs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl bg-[#121722] border border-[#1E2638] p-6 space-y-3">
          <Search className="size-8 text-zinc-500" />
          <h3 className="text-sm font-semibold text-white text-balance">
            No prediction markets found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm text-pretty">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white border border-white/10 transition-colors duration-150"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedPairs.map((pair) => {
            const isStarred = watchlists.includes(pair.id);

            // Kalshi Market Card (Kalshi desk or Kalshi pair in All Markets)
            if (activeVenueTab === "KALSHI" || pair.id.startsWith("kalshi-")) {
              return (
                <KalshiMarketCard
                  key={pair.id}
                  pair={pair}
                  isStarred={isStarred}
                  onToggleWatchlist={toggleWatchlist}
                  onOpenOrderSlip={openOrderSlip}
                  oddsFormat={oddsFormat}
                />
              );
            }

            // Polymarket Mirror Desk View or All Markets View
            return (
              <PolymarketMarketCard
                key={pair.id}
                pair={pair}
                isStarred={isStarred}
                onToggleWatchlist={toggleWatchlist}
                onSelectPair={setSelectedPairId}
                onOpenOrderSlip={openOrderSlip}
                oddsFormat={oddsFormat}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
