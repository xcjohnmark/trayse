"use client";

import React from "react";
import { OddsFormat } from "@/lib/types/terminal";

interface HolderItem {
  rank: number;
  address: string;
  shares: number;
  avgEntry: number; // in cents e.g. 54.2
  currentValueUsd: number;
  pnlUsd: number;
}

interface MarketHoldersViewProps {
  currentYesPrice: number;
  currentNoPrice: number;
  oddsFormat: OddsFormat;
}

export function MarketHoldersView({
  currentYesPrice,
  currentNoPrice,
  oddsFormat,
}: MarketHoldersViewProps) {
  const yesHoldersCount = 1420;
  const noHoldersCount = 890;
  const yesPct = Math.round(currentYesPrice * 100);
  const noPct = 100 - yesPct;

  const topYesHolders: HolderItem[] = [
    {
      rank: 1,
      address: "0x892a...4b12",
      shares: 142000,
      avgEntry: Math.round((currentYesPrice - 0.08) * 1000) / 10,
      currentValueUsd: Math.round(142000 * currentYesPrice),
      pnlUsd: Math.round(142000 * 0.08),
    },
    {
      rank: 2,
      address: "0x33dc...99f0",
      shares: 98500,
      avgEntry: Math.round((currentYesPrice - 0.04) * 1000) / 10,
      currentValueUsd: Math.round(98500 * currentYesPrice),
      pnlUsd: Math.round(98500 * 0.04),
    },
    {
      rank: 3,
      address: "0x11ab...7821",
      shares: 64200,
      avgEntry: Math.round((currentYesPrice + 0.02) * 1000) / 10,
      currentValueUsd: Math.round(64200 * currentYesPrice),
      pnlUsd: Math.round(64200 * -0.02),
    },
    {
      rank: 4,
      address: "0x77ee...02da",
      shares: 41000,
      avgEntry: Math.round((currentYesPrice - 0.05) * 1000) / 10,
      currentValueUsd: Math.round(41000 * currentYesPrice),
      pnlUsd: Math.round(41000 * 0.05),
    },
  ];

  const topNoHolders: HolderItem[] = [
    {
      rank: 1,
      address: "0x90f1...1122",
      shares: 110000,
      avgEntry: Math.round((currentNoPrice - 0.05) * 1000) / 10,
      currentValueUsd: Math.round(110000 * currentNoPrice),
      pnlUsd: Math.round(110000 * 0.05),
    },
    {
      rank: 2,
      address: "0x55aa...66bb",
      shares: 72000,
      avgEntry: Math.round((currentNoPrice + 0.03) * 1000) / 10,
      currentValueUsd: Math.round(72000 * currentNoPrice),
      pnlUsd: Math.round(72000 * -0.03),
    },
    {
      rank: 3,
      address: "0x44cc...88dd",
      shares: 38500,
      avgEntry: Math.round((currentNoPrice - 0.02) * 1000) / 10,
      currentValueUsd: Math.round(38500 * currentNoPrice),
      pnlUsd: Math.round(38500 * 0.02),
    },
    {
      rank: 4,
      address: "0x12bb...33ee",
      shares: 25400,
      avgEntry: Math.round((currentNoPrice - 0.01) * 1000) / 10,
      currentValueUsd: Math.round(25400 * currentNoPrice),
      pnlUsd: Math.round(25400 * 0.01),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#121722] rounded-xl border border-[#1E2638] overflow-hidden font-mono select-none p-3 space-y-3.5 shadow-lg shadow-black/20">
      {/* 1. Distribution Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#00FFA3] font-bold">
            YES Holders: {yesHoldersCount.toLocaleString()} ({yesPct}%)
          </span>
          <span className="text-[#F43F5E] font-bold">
            NO Holders: {noHoldersCount.toLocaleString()} ({noPct}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#0F131C] border border-[#1E2638]">
          <div
            style={{ width: `${yesPct}%` }}
            className="h-full bg-[#00FFA3] transition-all duration-300"
          />
          <div
            style={{ width: `${noPct}%` }}
            className="h-full bg-[#F43F5E] transition-all duration-300"
          />
        </div>
      </div>

      {/* 2. Side-by-Side Dual Holders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* LEFT: Top YES Holders */}
        <div className="rounded-lg bg-[#0F131C] border border-[#00D688]/30 p-2.5 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1E2638]">
            <span className="font-bold text-[#00FFA3]">Top YES Holders</span>
            <span className="text-[10px] text-[#94A3B8]">Sorted by shares</span>
          </div>
          <div className="divide-y divide-[#1E2638]/40">
            {topYesHolders.map((h) => (
              <div
                key={`yes-${h.rank}`}
                className="py-1.5 flex items-center justify-between text-[11px] tabular-nums"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748B] text-[10px] w-3">#{h.rank}</span>
                  <span className="text-[#CBD5E1] font-medium">{h.address}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-white font-semibold">
                    ${h.currentValueUsd.toLocaleString()}
                  </div>
                  <div
                    className={`text-[10px] ${
                      h.pnlUsd >= 0 ? "text-[#00FFA3]" : "text-[#F43F5E]"
                    }`}
                  >
                    {h.pnlUsd >= 0 ? "+" : ""}${h.pnlUsd.toLocaleString()} PnL
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Top NO Holders */}
        <div className="rounded-lg bg-[#0F131C] border border-[#F43F5E]/30 p-2.5 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1E2638]">
            <span className="font-bold text-[#F43F5E]">Top NO Holders</span>
            <span className="text-[10px] text-[#94A3B8]">Sorted by shares</span>
          </div>
          <div className="divide-y divide-[#1E2638]/40">
            {topNoHolders.map((h) => (
              <div
                key={`no-${h.rank}`}
                className="py-1.5 flex items-center justify-between text-[11px] tabular-nums"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748B] text-[10px] w-3">#{h.rank}</span>
                  <span className="text-[#CBD5E1] font-medium">{h.address}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-white font-semibold">
                    ${h.currentValueUsd.toLocaleString()}
                  </div>
                  <div
                    className={`text-[10px] ${
                      h.pnlUsd >= 0 ? "text-[#00FFA3]" : "text-[#F43F5E]"
                    }`}
                  >
                    {h.pnlUsd >= 0 ? "+" : ""}${h.pnlUsd.toLocaleString()} PnL
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
