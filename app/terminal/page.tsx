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
  Radio,
  Layers,
  ShieldCheck,
  Globe2,
  RotateCw,
  Loader2,
} from "lucide-react";

type SortOption = "VOLUME_DESC" | "SPREAD_DESC" | "EXPIRY_ASC";

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
  const { status: liveStatus } = usePolymarketStream(assetIds);

  const categories: { id: MarketCategory | "All"; label: string }[] = [
    { id: "All", label: "All Categories" },
    { id: "Macro", label: "Macro" },
    { id: "Politics", label: "Politics" },
    { id: "Crypto", label: "Crypto" },
    { id: "Tech & Equities", label: "Tech & Equities" },
    { id: "Physical & Weather", label: "Weather" },
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
    } else if (sortBy === "SPREAD_DESC") {
      list.sort((a, b) => b.divergenceBps - a.divergenceBps);
    } else if (sortBy === "EXPIRY_ASC") {
      list.sort((a, b) => a.expiryTimestamp - b.expiryTimestamp);
    }
    return list;
  }, [filteredPairs, sortBy, activeVenueTab]);

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
      {/* 1. TOP VENUE TABS: ALL | POLYMARKET | KALSHI */}
      <div className="flex items-center justify-between border-b border-[#1A1D27] pb-3">
        <div className="flex items-center gap-2">
          {/* ALL MARKETS TAB */}
          <button
            type="button"
            onClick={() => setActiveVenueTab("ALL")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeVenueTab === "ALL"
                ? "bg-white text-black shadow-md shadow-white/5"
                : "bg-[#10121A] text-zinc-400 hover:text-white hover:bg-white/5 border border-[#1A1D27]"
            }`}
          >
            <Globe2 className="h-4 w-4" />
            <span>All Markets</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeVenueTab === "ALL"
                  ? "bg-black/10 text-black font-bold"
                  : "bg-white/10 text-zinc-400"
              }`}
            >
              {marketPairs.length}
            </span>
          </button>

          {/* POLYMARKET MIRROR TAB */}
          <button
            type="button"
            onClick={() => setActiveVenueTab("POLYMARKET")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeVenueTab === "POLYMARKET"
                ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20"
                : "bg-[#10121A] text-zinc-400 hover:text-white hover:bg-white/5 border border-[#1A1D27]"
            }`}
          >
            <div className="h-2 w-2 rounded-full bg-emerald-300" />
            <span>Polymarket</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeVenueTab === "POLYMARKET"
                  ? "bg-black/20 text-black font-bold"
                  : "bg-white/10 text-zinc-400"
              }`}
            >
              {marketPairs.length}
            </span>
          </button>

          {/* KALSHI MIRROR TAB */}
          <button
            type="button"
            onClick={() => setActiveVenueTab("KALSHI")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeVenueTab === "KALSHI"
                ? "bg-sky-500 text-black font-bold shadow-md shadow-sky-500/20"
                : "bg-[#10121A] text-zinc-400 hover:text-white hover:bg-white/5 border border-[#1A1D27]"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Kalshi</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeVenueTab === "KALSHI"
                  ? "bg-black/20 text-black font-bold"
                  : "bg-white/10 text-zinc-400"
              }`}
            >
              {marketPairs.length}
            </span>
          </button>
        </div>

        {/* Live Stream Pulse Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12141C] border border-[#1F232F] font-mono text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-semibold flex items-center gap-1">
            <Radio className="h-2.5 w-2.5" />
            {liveStatus === "CONNECTED"
              ? "LIVE CLOB STREAM (16ms)"
              : "STREAM ACTIVE (16ms)"}
          </span>
        </div>
      </div>

      {/* 2. CATEGORY PILLS & SORTING BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1D27] pb-3">
        {/* Horizontal Category Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white/20 text-white font-semibold border border-white/20"
                    : "bg-[#10121A] text-zinc-400 hover:text-white hover:bg-white/5 border border-[#1A1D27]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Market Count, Sync Feeds & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-400">
          <button
            type="button"
            onClick={() => loadLiveMarkets(activeVenueTab)}
            disabled={isLoadingMarkets}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10121A] hover:bg-[#161924] border border-[#1A1D27] text-zinc-300 transition-colors disabled:opacity-60 text-xs"
            title="Refresh live catalog from Polymarket & Kalshi"
          >
            <RotateCw className={`h-3 w-3 text-zinc-400 ${isLoadingMarkets ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">{isLoadingMarkets ? "Syncing..." : "Sync Feeds"}</span>
          </button>

          <span className="font-mono text-[11px] text-zinc-500">
            {sortedPairs.length} {sortedPairs.length === 1 ? "Market" : "Markets"}
          </span>

          <div className="flex items-center gap-1.5 bg-[#10121A] border border-[#1A1D27] rounded-lg px-2.5 py-1 text-xs">
            <ArrowUpDown className="h-3 w-3 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer pr-1"
            >
              <option value="VOLUME_DESC" className="bg-[#10121A] text-white">
                Highest Volume
              </option>
              <option value="SPREAD_DESC" className="bg-[#10121A] text-white">
                Highest Spread Divergence
              </option>
              <option value="EXPIRY_ASC" className="bg-[#10121A] text-white">
                Expiring Soonest
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAIN MARKET STREAM GRID */}
      {isLoadingMarkets && sortedPairs.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-[#0B0C10] border border-[#1A1D27] p-4 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <div className="space-y-2">
                  <div className="h-4 w-64 bg-white/10 rounded" />
                  <div className="h-3 w-32 bg-white/5 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-20 bg-white/5 rounded-lg" />
                <div className="h-9 w-20 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedPairs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-[#090A0E] border border-[#1A1D27] p-6 space-y-3">
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

            // Kalshi Mirror Desk View
            if (activeVenueTab === "KALSHI") {
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
