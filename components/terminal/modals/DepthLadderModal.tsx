"use client";

import React, { useEffect, useMemo } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { INITIAL_MARKET_PAIRS } from "@/lib/mock/market-data";
import { convertOdds } from "@/lib/market/normalization";
import { X, ExternalLink, ArrowRight, Zap, TrendingUp } from "lucide-react";

export function DepthLadderModal() {
  const { selectedPairId, setSelectedPairId, oddsFormat, openModal } = useTerminalStore();

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
    return INITIAL_MARKET_PAIRS.find((p) => p.id === selectedPairId) || null;
  }, [selectedPairId]);

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
      <div className="w-full max-w-4xl rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 1. Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-semibold uppercase">
              {pair.category}
            </span>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-white tracking-wide">
                {pair.canonicalTitle}
              </h3>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5 flex items-center gap-2">
                <span>EXPIRY: {pair.expiryDateFormatted}</span>
                <span className="text-zinc-600">•</span>
                <span>
                  CROSS SPREAD:{" "}
                  <span className="text-[#00FFA3] font-semibold">{pair.divergenceBps} BPS</span>
                </span>
                {pair.hasArbitrage && (
                  <>
                    <span className="text-zinc-600">•</span>
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
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Depth Ladder (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Split-Screen Dual Order Ladders */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1F232F] p-4 gap-4 overflow-y-auto flex-1">
          {/* LEFT PANEL: Polymarket CLOB */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                <span className="text-xs font-mono font-bold text-zinc-200">
                  POLYMARKET (Polygon CLOB)
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

            <div className="rounded border border-[#1F232F] bg-[#000000] p-2 text-xs font-mono">
              {/* Header row */}
              <div className="grid grid-cols-3 text-[10px] text-zinc-500 pb-1.5 border-b border-[#1F232F]">
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
                      className="relative grid grid-cols-3 text-rose-400 text-[11px] py-0.5 px-1 rounded overflow-hidden"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <span className="font-semibold z-10">
                        {convertOdds(ask.price, oddsFormat)}
                      </span>
                      <span className="text-right text-zinc-300 z-10">
                        {ask.size.toLocaleString()}
                      </span>
                      <span className="text-right text-zinc-500 z-10">
                        {ask.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mid-Market Spread Indicator */}
              <div className="py-1.5 px-3 my-1.5 bg-[#12141C] border border-[#1F232F] text-[10px] flex items-center justify-between text-zinc-400 rounded">
                <span className="text-zinc-500">POLYMARKET MID:</span>
                <span className="text-white font-bold">
                  {convertOdds(pair.polymarket.yesPrice, oddsFormat)}
                </span>
                <span className="text-zinc-400">SPREAD: {pmSpreadBps} bps</span>
              </div>

              {/* BIDS (Buy Orders) - Descending order */}
              <div className="space-y-1 py-1.5">
                {pmBids.map((bid, idx) => {
                  const depthPercent = Math.min(100, Math.round((bid.total / maxPmDepth) * 100));
                  return (
                    <div
                      key={`pm-bid-${idx}`}
                      className="relative grid grid-cols-3 text-[#00FFA3] text-[11px] py-0.5 px-1 rounded overflow-hidden"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <span className="font-semibold z-10">
                        {convertOdds(bid.price, oddsFormat)}
                      </span>
                      <span className="text-right text-zinc-300 z-10">
                        {bid.size.toLocaleString()}
                      </span>
                      <span className="text-right text-zinc-500 z-10">
                        {bid.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Kalshi CFTC v2 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="text-xs font-mono font-bold text-zinc-200">
                  KALSHI (CFTC Regulated v2)
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

            <div className="rounded border border-[#1F232F] bg-[#000000] p-2 text-xs font-mono">
              {/* Header row */}
              <div className="grid grid-cols-3 text-[10px] text-zinc-500 pb-1.5 border-b border-[#1F232F]">
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
                      className="relative grid grid-cols-3 text-rose-400 text-[11px] py-0.5 px-1 rounded overflow-hidden"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <span className="font-semibold z-10">
                        {convertOdds(ask.price, oddsFormat)}
                      </span>
                      <span className="text-right text-zinc-300 z-10">
                        {ask.size.toLocaleString()}
                      </span>
                      <span className="text-right text-zinc-500 z-10">
                        {ask.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mid-Market Spread Indicator */}
              <div className="py-1.5 px-3 my-1.5 bg-[#12141C] border border-[#1F232F] text-[10px] flex items-center justify-between text-zinc-400 rounded">
                <span className="text-zinc-500">KALSHI MID:</span>
                <span className="text-white font-bold">
                  {convertOdds(pair.kalshi.yesPrice, oddsFormat)}
                </span>
                <span className="text-zinc-400">SPREAD: {kalshiSpreadBps} bps</span>
              </div>

              {/* BIDS (Buy Orders) - Descending order */}
              <div className="space-y-1 py-1.5">
                {kalshiBids.map((bid, idx) => {
                  const depthPercent = Math.min(100, Math.round((bid.total / maxKalshiDepth) * 100));
                  return (
                    <div
                      key={`k-bid-${idx}`}
                      className="relative grid grid-cols-3 text-[#00FFA3] text-[11px] py-0.5 px-1 rounded overflow-hidden"
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${depthPercent}%` }}
                      />
                      <span className="font-semibold z-10">
                        {convertOdds(bid.price, oddsFormat)}
                      </span>
                      <span className="text-right text-zinc-300 z-10">
                        {bid.size.toLocaleString()}
                      </span>
                      <span className="text-right text-zinc-500 z-10">
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
        <div className="border-t border-[#1F232F] bg-[#0C0D12] p-4 text-xs font-mono space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Box 1: Polymarket Top-of-Book */}
            <div className="p-2.5 rounded border border-[#1F232F] bg-[#12141C]">
              <span className="text-[10px] text-zinc-500 block">POLYMARKET TOP-OF-BOOK</span>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-[#00FFA3]">Bid: {convertOdds(pmBestBid, oddsFormat)}</span>
                <span className="text-zinc-500">|</span>
                <span className="text-rose-400">Ask: {convertOdds(pmBestAsk, oddsFormat)}</span>
              </div>
            </div>

            {/* Box 2: Kalshi Top-of-Book */}
            <div className="p-2.5 rounded border border-[#1F232F] bg-[#12141C]">
              <span className="text-[10px] text-zinc-500 block">KALSHI TOP-OF-BOOK</span>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-[#00FFA3]">Bid: {convertOdds(kalshiBestBid, oddsFormat)}</span>
                <span className="text-zinc-500">|</span>
                <span className="text-rose-400">Ask: {convertOdds(kalshiBestAsk, oddsFormat)}</span>
              </div>
            </div>

            {/* Box 3: Cross Spread & Arb Route */}
            <div className="p-2.5 rounded border border-[#1F232F] bg-[#12141C] flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 block">NET CROSS-VENUE DIVERGENCE</span>
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
                  <span className="text-zinc-500">No Basis Arb</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
            <span>TELEMETRY: Yellowstone gRPC Ingestion & CFTC Order Auditing</span>
            <button
              type="button"
              onClick={() => setSelectedPairId(null)}
              className="px-3 py-1 rounded bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-zinc-300 hover:text-white transition-colors"
            >
              Close Ladder (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
