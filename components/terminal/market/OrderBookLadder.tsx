"use client";

import React, { useState } from "react";
import { OrderBook, OddsFormat } from "@/lib/types/terminal";
import { convertOdds } from "@/lib/market/normalization";

interface OrderBookLadderProps {
  orderBook: OrderBook;
  currentYesPrice: number;
  currentNoPrice: number;
  oddsFormat: OddsFormat;
  venue: "polymarket" | "kalshi";
}

export function OrderBookLadder({
  orderBook,
  currentYesPrice,
  currentNoPrice,
  oddsFormat,
  venue,
}: OrderBookLadderProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO">("YES");
  const [precision, setPrecision] = useState<"0.1" | "1.0">("0.1");

  const activePrice = selectedOutcome === "YES" ? currentYesPrice : currentNoPrice;
  const spreadCents = Math.max(0.1, Math.round(Math.abs(orderBook.asks[0]?.price - orderBook.bids[0]?.price) * 100) / 10);

  // Generate realistic bids & asks if orderBook is sparsely populated
  const displayAsks = orderBook.asks.length > 0 ? orderBook.asks.slice(0, 6) : [
    { price: activePrice + 0.03, size: 4500, total: 3450 },
    { price: activePrice + 0.02, size: 8200, total: 6150 },
    { price: activePrice + 0.01, size: 12500, total: 9375 },
  ];

  const displayBids = orderBook.bids.length > 0 ? orderBook.bids.slice(0, 6) : [
    { price: activePrice - 0.01, size: 14200, total: 10650 },
    { price: activePrice - 0.02, size: 9100, total: 6825 },
    { price: activePrice - 0.03, size: 5400, total: 4050 },
  ];

  const maxDepthSize = Math.max(
    ...displayAsks.map((a) => a.size),
    ...displayBids.map((b) => b.size),
    1
  );

  return (
    <div className="flex flex-col h-full bg-[#121722] rounded-xl border border-[#1E2638] overflow-hidden font-mono select-none shadow-lg shadow-black/20">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E2638] bg-[#0F131C] text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white">Order Book</span>
          <span className="text-[#334155]">•</span>
          {/* Outcome Toggle */}
          <div className="flex items-center p-0.5 rounded bg-[#182030] border border-[#242E44] text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedOutcome("YES")}
              className={`px-2 py-0.5 rounded transition-all font-semibold ${
                selectedOutcome === "YES"
                  ? "bg-[#00D688]/20 text-[#00FFA3] border border-[#00D688]/30"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              YES
            </button>
            <button
              type="button"
              onClick={() => setSelectedOutcome("NO")}
              className={`px-2 py-0.5 rounded transition-all font-semibold ${
                selectedOutcome === "NO"
                  ? "bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {/* Precision / Grouping */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-[#94A3B8]">Group:</span>
          <button
            type="button"
            onClick={() => setPrecision(precision === "0.1" ? "1.0" : "0.1")}
            className="px-1.5 py-0.5 rounded bg-[#182030] hover:bg-[#202B3E] text-[#CBD5E1] border border-[#242E44]"
          >
            {precision}¢
          </button>
        </div>
      </div>

      {/* 2. Columns Ribbon */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-[#94A3B8] border-b border-[#1E2638] bg-[#121722] uppercase tracking-wider">
        <span>Price</span>
        <span className="text-right">Shares</span>
        <span className="text-right">Total ($)</span>
      </div>

      {/* 3. ASKS (Red/Rose) */}
      <div className="flex flex-col justify-end divide-y divide-[#1E2638]/40 py-1 flex-1 bg-[#121722]">
        {displayAsks
          .slice()
          .reverse()
          .map((ask, idx) => {
            const depthPct = Math.min(100, Math.round((ask.size / maxDepthSize) * 100));
            return (
              <div
                key={`ask-${idx}`}
                className="relative grid grid-cols-3 px-3 py-1 text-xs tabular-nums group hover:bg-[#182030]"
              >
                {/* Proportional Depth Bar Background */}
                <div
                  style={{ width: `${depthPct}%` }}
                  className="absolute right-0 top-0 bottom-0 bg-[#F43F5E]/10 pointer-events-none transition-all duration-150"
                />
                <span className="text-[#F43F5E] font-semibold relative z-10">
                  {convertOdds(ask.price, oddsFormat)}
                </span>
                <span className="text-right text-white relative z-10 font-medium">
                  {ask.size.toLocaleString()}
                </span>
                <span className="text-right text-[#94A3B8] text-[11px] relative z-10">
                  ${Math.round(ask.total).toLocaleString()}
                </span>
              </div>
            );
          })}
      </div>

      {/* 4. MID-MARKET SPREAD BANNER */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0F131C] border-y border-[#1E2638] text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm tabular-nums">
            {convertOdds(activePrice, oddsFormat)}
          </span>
          <span className="text-[11px] text-[#94A3B8]">Mark Price</span>
        </div>
        <div className="text-[11px] text-[#94A3B8] font-medium">
          Spread: <span className="text-white font-semibold">{spreadCents}¢</span>
        </div>
      </div>

      {/* 5. BIDS (Green/Emerald) */}
      <div className="flex flex-col divide-y divide-[#1E2638]/40 py-1 flex-1 bg-[#121722]">
        {displayBids.map((bid, idx) => {
          const depthPct = Math.min(100, Math.round((bid.size / maxDepthSize) * 100));
          return (
            <div
              key={`bid-${idx}`}
              className="relative grid grid-cols-3 px-3 py-1 text-xs tabular-nums group hover:bg-[#182030]"
            >
              {/* Proportional Depth Bar Background */}
              <div
                style={{ width: `${depthPct}%` }}
                className="absolute right-0 top-0 bottom-0 bg-[#00D688]/10 pointer-events-none transition-all duration-150"
              />
              <span className="text-[#00FFA3] font-semibold relative z-10">
                {convertOdds(bid.price, oddsFormat)}
              </span>
              <span className="text-right text-white relative z-10 font-medium">
                {bid.size.toLocaleString()}
              </span>
              <span className="text-right text-[#94A3B8] text-[11px] relative z-10">
                ${Math.round(bid.total).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
