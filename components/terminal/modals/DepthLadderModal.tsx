"use client";

import React, { useEffect, useMemo } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { convertOdds } from "@/lib/market/normalization";
import { X, ExternalLink, ArrowRight, Zap, TrendingUp } from "lucide-react";

export function DepthLadderModal() {
  const { selectedPairId, setSelectedPairId, oddsFormat, openModal, marketPairs } = useTerminalStore();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPairId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedPairId]);

  const pair = useMemo(() => {
    if (!selectedPairId) return null;
    return marketPairs.find((p) => p.id === selectedPairId) || null;
  }, [selectedPairId, marketPairs]);

  if (!pair) return null;

  // Max cumulative totals for relative depth bar fills
  const pmAsks = pair.polymarket.orderBook.asks;
  const pmBids = pair.polymarket.orderBook.bids;
  const maxPmAsk = pmAsks.length > 0 ? pmAsks[pmAsks.length - 1].total : 1;
  const maxPmBid = pmBids.length > 0 ? pmBids[pmBids.length - 1].total : 1;
  const maxPmDepth = Math.max(maxPmAsk, maxPmBid, 1);

  const kalshiAsks = pair.kalshi.orderBook.asks;
  const kalshiBids = pair.kalshi.orderBook.bids;
  const maxKalshiAsk = kalshiAsks.length > 0 ? kalshiAsks[kalshiAsks.length - 1].total : 1;
  const maxKalshiBid = kalshiBids.length > 0 ? kalshiBids[kalshiBids.length - 1].total : 1;
  const maxKalshiDepth = Math.max(maxKalshiAsk, maxKalshiBid, 1);

  // Top of book spreads
  const pmBestBid = pmBids[0]?.price ?? pair.polymarket.bestBid;
  const pmBestAsk = pmAsks[0]?.price ?? pair.polymarket.bestAsk;
  const pmSpreadBps = Math.round(Math.abs(pmBestAsk - pmBestBid) * 10000);

  const kalshiBestBid = kalshiBids[0]?.price ?? pair.kalshi.bestBid;
  const kalshiBestAsk = kalshiAsks[0]?.price ?? pair.kalshi.bestAsk;
  const kalshiSpreadBps = Math.round(Math.abs(kalshiBestAsk - kalshiBestBid) * 10000);

  // Cross venue spread
  const crossSpreadBps = Math.round(Math.abs(kalshiBestAsk - pmBestAsk) * 10000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-xl border border-[#1E2638] bg-[#121722] text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 1. Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E2638] px-5 py-3.5 bg-[#0F131C]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182030] border border-[#242E44] text-[#CBD5E1] font-semibold uppercase">
              {pair.category}
            </span>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-white tracking-wide">
                {pair.canonicalTitle}
              </h3>
              <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5 flex items-center gap-2">
                <span>EXPIRY: {pair.expiryDateFormatted}</span>
                <span className="text-[#334155]">•</span>
                <span>
                  CROSS SPREAD:{" "}
                  <span className="text-[#00FFA3] font-semibold">{pair.divergenceBps} BPS</span>
                </span>
                {pair.hasArbitrage && (
                  <>
                    <span className="text-[#334155]">•</span>
                    <span className="text-[#00FFA3] font-bold flex items-center gap-0.5">
                      <Zap className="h-3 w-3" />
                      SYNTHETIC ARB ACTIVE
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPairId(null)}
            className="rounded-lg p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#182030] transition-colors"
            title="Close Depth Ladder (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Split-Screen Dual Order Ladders */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1E2638] p-4 gap-4 overflow-y-auto flex-1">
          {/* LEFT PANEL: Polymarket */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                <span className="text-xs font-mono font-bold text-white">
                  POLYMARKET
                </span>
              </div>
              <a
                href={pair.polymarket.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Tape URL</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-lg border border-[#1E2638] bg-[#0F131C] p-2.5 text-xs font-mono">
              {/* Header row */}
              <div className="grid grid-cols-3 text-[10px] text-[#94A3B8] pb-1.5 border-b border-[#1E2638]">
                <span>PRICE (ASK / BID)</span>
                <span className="text-right">SIZE (SHARES)</span>
                <span className="text-right">CUMULATIVE</span>
              </div>

              {/* ASKS (Sell Orders) - Descending order */}
              <div className="space-y-1 py-1.5">
                {[...pmAsks].reverse().map((ask, idx) => {
                  const depthPercent = Math.min(100, Math.round((ask.total / maxPmDepth) * 100));
                  return (
                    <div
                      key={`pm-ask-${idx}`}
                      className="relative grid grid-cols-3 text-[#F43F5E] text-[11px] py-0.5 px-1 rounded overflow-hidden hover:bg-[#182030]"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#F43F5E]/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <span className="font-semibold z-10">
                        {convertOdds(ask.price, oddsFormat)}
                      </span>
                      <span className="text-right text-white z-10 font-medium">
                        {ask.size.toLocaleString()}
                      </span>
                      <span className="text-right text-[#94A3B8] z-10">
                        {ask.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mid-Market Spread Indicator */}
              <div className="py-1.5 px-3 my-1.5 bg-[#182030] border border-[#242E44] text-[10px] flex items-center justify-between text-[#94A3B8] rounded">
                <span className="text-[#94A3B8]">POLYMARKET MID:</span>
                <span className="text-white font-bold">
                  {convertOdds(pair.polymarket.yesPrice, oddsFormat)}
                </span>
                <span className="text-[#CBD5E1]">SPREAD: {pmSpreadBps} bps</span>
              </div>

              {/* BIDS (Buy Orders) - Descending order */}
              <div className="space-y-1 py-1.5">
                {pmBids.map((bid, idx) => {
                  const depthPercent = Math.min(100, Math.round((bid.total / maxPmDepth) * 100));
                  return (
                    <div
                      key={`pm-bid-${idx}`}
                      className="relative grid grid-cols-3 text-[#00FFA3] text-[11px] py-0.5 px-1 rounded overflow-hidden hover:bg-[#182030]"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#00D688]/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <span className="font-semibold z-10">
                        {convertOdds(bid.price, oddsFormat)}
                      </span>
                      <span className="text-right text-white z-10 font-medium">
                        {bid.size.toLocaleString()}
                      </span>
                      <span className="text-right text-[#94A3B8] z-10">
                        {bid.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Kalshi */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="text-xs font-mono font-bold text-white">
                  KALSHI
                </span>
              </div>
              <a
                href={pair.kalshi.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Tape URL</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-lg border border-[#1E2638] bg-[#0F131C] p-2.5 text-xs font-mono">
              {/* Header row */}
              <div className="grid grid-cols-3 text-[10px] text-[#94A3B8] pb-1.5 border-b border-[#1E2638]">
                <span>PRICE (ASK / BID)</span>
                <span className="text-right">SIZE (CONTRACTS)</span>
                <span className="text-right">CUMULATIVE</span>
              </div>

              {/* ASKS (Sell Orders) - Descending order */}
              <div className="space-y-1 py-1.5">
                {[...kalshiAsks].reverse().map((ask, idx) => {
                  const depthPercent = Math.min(100, Math.round((ask.total / maxKalshiDepth) * 100));
                  return (
                    <div
                      key={`k-ask-${idx}`}
                      className="relative grid grid-cols-3 text-[#F43F5E] text-[11px] py-0.5 px-1 rounded overflow-hidden hover:bg-[#182030]"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#F43F5E]/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <span className="font-semibold z-10">
                        {convertOdds(ask.price, oddsFormat)}
                      </span>
                      <span className="text-right text-white z-10 font-medium">
                        {ask.size.toLocaleString()}
                      </span>
                      <span className="text-right text-[#94A3B8] z-10">
                        {ask.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mid-Market Spread Indicator */}
              <div className="py-1.5 px-3 my-1.5 bg-[#182030] border border-[#242E44] text-[10px] flex items-center justify-between text-[#94A3B8] rounded">
                <span className="text-[#94A3B8]">KALSHI MID:</span>
                <span className="text-white font-bold">
                  {convertOdds(pair.kalshi.yesPrice, oddsFormat)}
                </span>
                <span className="text-[#CBD5E1]">SPREAD: {kalshiSpreadBps} bps</span>
              </div>

              {/* BIDS (Buy Orders) - Descending order */}
              <div className="space-y-1 py-1.5">
                {kalshiBids.map((bid, idx) => {
                  const depthPercent = Math.min(100, Math.round((bid.total / maxKalshiDepth) * 100));
                  return (
                    <div
                      key={`k-bid-${idx}`}
                      className="relative grid grid-cols-3 text-[#00FFA3] text-[11px] py-0.5 px-1 rounded overflow-hidden hover:bg-[#182030]"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#00D688]/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <span className="font-semibold z-10">
                        {convertOdds(bid.price, oddsFormat)}
                      </span>
                      <span className="text-right text-white z-10 font-medium">
                        {bid.size.toLocaleString()}
                      </span>
                      <span className="text-right text-[#94A3B8] z-10">
                        {bid.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Summary: Top-of-Book Comparison */}
        <div className="border-t border-[#1E2638] bg-[#0F131C] p-4 text-xs font-mono space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Box 1: Polymarket Top-of-Book */}
            <div className="p-2.5 rounded-lg border border-[#242E44] bg-[#182030]">
              <span className="text-[10px] text-[#94A3B8] block">POLYMARKET TOP-OF-BOOK</span>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-[#00FFA3]">Bid: {convertOdds(pmBestBid, oddsFormat)}</span>
                <span className="text-[#334155]">|</span>
                <span className="text-[#F43F5E]">Ask: {convertOdds(pmBestAsk, oddsFormat)}</span>
              </div>
            </div>

            {/* Box 2: Kalshi Top-of-Book */}
            <div className="p-2.5 rounded-lg border border-[#242E44] bg-[#182030]">
              <span className="text-[10px] text-[#94A3B8] block">KALSHI TOP-OF-BOOK</span>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-[#00FFA3]">Bid: {convertOdds(kalshiBestBid, oddsFormat)}</span>
                <span className="text-[#334155]">|</span>
                <span className="text-[#F43F5E]">Ask: {convertOdds(kalshiBestAsk, oddsFormat)}</span>
              </div>
            </div>

            {/* Box 3: Cross Spread & Arb Route */}
            <div className="p-2.5 rounded-lg border border-[#242E44] bg-[#182030] flex flex-col justify-between">
              <span className="text-[10px] text-[#94A3B8] block">NET CROSS-VENUE DIVERGENCE</span>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-amber-300 font-bold">{crossSpreadBps} bps</span>
                {pair.hasArbitrage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPairId(null);
                      openModal("DIALECT_BLINK", pair.id);
                    }}
                    className="text-[#00FFA3] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Route Arb</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="text-[#64748B]">No Basis Arb</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={() => setSelectedPairId(null)}
              className="px-3.5 py-1.5 rounded-lg bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-xs text-[#CBD5E1] hover:text-white transition-colors"
            >
              Close Ladder (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
