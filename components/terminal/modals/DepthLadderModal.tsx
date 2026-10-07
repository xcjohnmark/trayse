"use client";

import React from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { INITIAL_MARKET_PAIRS } from "@/lib/mock/market-data";
import { X, ExternalLink } from "lucide-react";

export function DepthLadderModal() {
  const { selectedPairId, setSelectedPairId } = useTerminalStore();

  if (!selectedPairId) return null;

  const pair = INITIAL_MARKET_PAIRS.find((p) => p.id === selectedPairId);
  if (!pair) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                {pair.category}
              </span>
              <h3 className="font-semibold text-sm text-white">
                {pair.canonicalTitle}
              </h3>
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
              Resolution Horizon: {pair.expiryDateFormatted} • Spread:{" "}
              <span className="text-[#00FFA3] font-semibold">
                {pair.divergenceBps} bps
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPairId(null)}
            className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dual Depth Ladders */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1F232F] p-4 gap-4">
          {/* Polymarket Depth */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span className="text-xs font-mono font-bold">
                  POLYMARKET (Polygon CLOB)
                </span>
              </div>
              <a
                href={pair.polymarket.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <span>View</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded border border-[#1F232F] bg-[#000000] p-2 text-xs font-mono">
              <div className="grid grid-cols-3 text-[10px] text-zinc-500 pb-1 border-b border-[#1F232F]">
                <span>PRICE</span>
                <span className="text-right">SIZE</span>
                <span className="text-right">TOTAL</span>
              </div>

              {/* Asks (Sell) */}
              <div className="space-y-1 py-1.5">
                {pair.polymarket.orderBook.asks.slice(0, 4).reverse().map((ask, i) => (
                  <div key={`pm-ask-${i}`} className="grid grid-cols-3 text-red-400 text-[11px] relative">
                    <span>${ask.price.toFixed(2)}</span>
                    <span className="text-right text-zinc-300">{ask.size.toLocaleString()}</span>
                    <span className="text-right text-zinc-500">{ask.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Mid Spread */}
              <div className="py-1 px-2 my-1 bg-[#12141C] text-[10px] text-center text-zinc-400 rounded">
                MID PROBABILITY: {(pair.polymarket.yesPrice * 100).toFixed(1)}%
              </div>

              {/* Bids (Buy) */}
              <div className="space-y-1 py-1.5">
                {pair.polymarket.orderBook.bids.slice(0, 4).map((bid, i) => (
                  <div key={`pm-bid-${i}`} className="grid grid-cols-3 text-[#00D688] text-[11px]">
                    <span>${bid.price.toFixed(2)}</span>
                    <span className="text-right text-zinc-300">{bid.size.toLocaleString()}</span>
                    <span className="text-right text-zinc-500">{bid.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kalshi Depth */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-xs font-mono font-bold">
                  KALSHI (CFTC Regulated v2)
                </span>
              </div>
              <a
                href={pair.kalshi.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <span>View</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded border border-[#1F232F] bg-[#000000] p-2 text-xs font-mono">
              <div className="grid grid-cols-3 text-[10px] text-zinc-500 pb-1 border-b border-[#1F232F]">
                <span>PRICE</span>
                <span className="text-right">SIZE</span>
                <span className="text-right">TOTAL</span>
              </div>

              {/* Asks (Sell) */}
              <div className="space-y-1 py-1.5">
                {pair.kalshi.orderBook.asks.slice(0, 4).reverse().map((ask, i) => (
                  <div key={`k-ask-${i}`} className="grid grid-cols-3 text-red-400 text-[11px]">
                    <span>{Math.round(ask.price * 100)}¢</span>
                    <span className="text-right text-zinc-300">{ask.size.toLocaleString()}</span>
                    <span className="text-right text-zinc-500">{ask.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Mid Spread */}
              <div className="py-1 px-2 my-1 bg-[#12141C] text-[10px] text-center text-zinc-400 rounded">
                MID PROBABILITY: {(pair.kalshi.yesPrice * 100).toFixed(1)}%
              </div>

              {/* Bids (Buy) */}
              <div className="space-y-1 py-1.5">
                {pair.kalshi.orderBook.bids.slice(0, 4).map((bid, i) => (
                  <div key={`k-bid-${i}`} className="grid grid-cols-3 text-[#00D688] text-[11px]">
                    <span>{Math.round(bid.price * 100)}¢</span>
                    <span className="text-right text-zinc-300">{bid.size.toLocaleString()}</span>
                    <span className="text-right text-zinc-500">{bid.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1F232F] px-5 py-3 bg-[#090A0E] text-xs font-mono">
          <div className="text-zinc-500 text-[11px]">
            TAPE SYNC: Ingested via Yellowstone gRPC & CFTC WebSocket v2
          </div>
          <button
            type="button"
            onClick={() => setSelectedPairId(null)}
            className="px-3 py-1 rounded bg-[#12141C] border border-[#1F232F] text-zinc-300 hover:text-white"
          >
            Close Ladder (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
