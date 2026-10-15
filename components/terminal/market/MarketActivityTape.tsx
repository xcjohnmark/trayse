"use client";

import React, { useState, useMemo } from "react";
import { OddsFormat } from "@/lib/types/terminal";
import { convertOdds } from "@/lib/market/normalization";

interface TradeItem {
  id: string;
  timeAgo: string;
  timestamp: number;
  side: "BUY" | "SELL";
  outcome: "YES" | "NO";
  price: number;
  shares: number;
  amountUsd: number;
  trader: string;
  isWhale?: boolean;
}

interface MarketActivityTapeProps {
  currentYesPrice: number;
  currentNoPrice: number;
  oddsFormat: OddsFormat;
  marketTitle: string;
}

export function MarketActivityTape({
  currentYesPrice,
  currentNoPrice,
  oddsFormat,
  marketTitle,
}: MarketActivityTapeProps) {
  const [filter, setFilter] = useState<"ALL" | "WHALES" | "MY_FILLS">("ALL");

  // Deterministic trade tape seed aligned with current prices (pure render compliant)
  const trades = useMemo<TradeItem[]>(() => {
    const baseTimestamp = 1728630000000;
    const raw: TradeItem[] = [
      {
        id: "t-1",
        timeAgo: "1m ago",
        timestamp: baseTimestamp - 60000,
        side: "BUY",
        outcome: "YES",
        price: currentYesPrice,
        shares: 1250,
        amountUsd: Math.round(1250 * currentYesPrice),
        trader: "0x8f21...c81a",
        isWhale: 1250 * currentYesPrice >= 500,
      },
      {
        id: "t-2",
        timeAgo: "4m ago",
        timestamp: baseTimestamp - 240000,
        side: "BUY",
        outcome: "YES",
        price: Math.max(0.01, currentYesPrice - 0.005),
        shares: 5000,
        amountUsd: Math.round(5000 * currentYesPrice),
        trader: "0x1d44...99ea",
        isWhale: true,
      },
      {
        id: "t-3",
        timeAgo: "9m ago",
        timestamp: baseTimestamp - 540000,
        side: "SELL",
        outcome: "YES",
        price: currentYesPrice,
        shares: 800,
        amountUsd: Math.round(800 * currentYesPrice),
        trader: "0x7bb3...402f",
      },
      {
        id: "t-4",
        timeAgo: "14m ago",
        timestamp: baseTimestamp - 840000,
        side: "BUY",
        outcome: "NO",
        price: currentNoPrice,
        shares: 3400,
        amountUsd: Math.round(3400 * currentNoPrice),
        trader: "0xaa90...11bc",
        isWhale: 3400 * currentNoPrice >= 500,
      },
      {
        id: "t-5",
        timeAgo: "22m ago",
        timestamp: baseTimestamp - 1320000,
        side: "BUY",
        outcome: "YES",
        price: Math.max(0.01, currentYesPrice - 0.01),
        shares: 12000,
        amountUsd: Math.round(12000 * currentYesPrice),
        trader: "0x33e8...5f91",
        isWhale: true,
      },
      {
        id: "t-6",
        timeAgo: "35m ago",
        timestamp: baseTimestamp - 2100000,
        side: "SELL",
        outcome: "NO",
        price: currentNoPrice,
        shares: 450,
        amountUsd: Math.round(450 * currentNoPrice),
        trader: "0x289a...bb03",
      },
      {
        id: "t-7",
        timeAgo: "48m ago",
        timestamp: baseTimestamp - 2880000,
        side: "BUY",
        outcome: "YES",
        price: Math.max(0.01, currentYesPrice - 0.015),
        shares: 6200,
        amountUsd: Math.round(6200 * currentYesPrice),
        trader: "0x6f19...d4d2",
        isWhale: true,
      },
    ];
    return raw;
  }, [currentYesPrice, currentNoPrice]);

  const filteredTrades = trades.filter((t) => {
    if (filter === "WHALES") return t.isWhale;
    if (filter === "MY_FILLS") return false; // empty if no fills in active session
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#121722] rounded-xl border border-[#1E2638] overflow-hidden font-mono select-none shadow-lg shadow-black/20">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E2638] bg-[#0F131C] text-xs">
        <span className="font-semibold text-white">Market Trades</span>

        {/* Filter Tabs */}
        <div className="flex items-center p-0.5 rounded bg-[#182030] border border-[#242E44] text-[11px]">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-2 py-0.5 rounded transition-all ${
              filter === "ALL"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            All Trades
          </button>
          <button
            type="button"
            onClick={() => setFilter("WHALES")}
            className={`px-2 py-0.5 rounded transition-all ${
              filter === "WHALES"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Whales ($500+)
          </button>
          <button
            type="button"
            onClick={() => setFilter("MY_FILLS")}
            className={`px-2 py-0.5 rounded transition-all ${
              filter === "MY_FILLS"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            My Fills
          </button>
        </div>
      </div>

      {/* 2. Columns Header */}
      <div className="grid grid-cols-6 px-3 py-1.5 text-[10px] text-[#94A3B8] border-b border-[#1E2638] bg-[#121722] uppercase tracking-wider">
        <span>Time</span>
        <span>Side</span>
        <span>Outcome</span>
        <span className="text-right">Price</span>
        <span className="text-right">Shares</span>
        <span className="text-right">Total</span>
      </div>

      {/* 3. Trades List */}
      <div className="flex flex-col divide-y divide-[#1E2638]/40 overflow-y-auto max-h-[320px] bg-[#121722]">
        {filteredTrades.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No trades match the selected filter.
          </div>
        ) : (
          filteredTrades.map((trade) => {
            const isBuy = trade.side === "BUY";
            return (
              <div
                key={trade.id}
                className="grid grid-cols-6 px-3 py-2 text-xs tabular-nums hover:bg-[#182030] transition-colors items-center"
              >
                <span className="text-[#64748B] text-[11px]">{trade.timeAgo}</span>
                <span
                  className={`font-bold text-[11px] ${
                    isBuy ? "text-[#00FFA3]" : "text-[#F43F5E]"
                  }`}
                >
                  {trade.side}
                </span>
                <span
                  className={`font-semibold ${
                    trade.outcome === "YES" ? "text-[#00FFA3]" : "text-[#F43F5E]"
                  }`}
                >
                  {trade.outcome}
                </span>
                <span className="text-right text-white font-semibold">
                  {convertOdds(trade.price, oddsFormat)}
                </span>
                <span className="text-right text-white font-medium">
                  {trade.shares.toLocaleString()}
                </span>
                <span className="text-right text-[#CBD5E1] font-medium">
                  ${trade.amountUsd.toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
