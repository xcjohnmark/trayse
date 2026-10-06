"use client";

import * as React from "react";
import { TrendingUp, Zap, Radio, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TerminalPulseTicker() {
  return (
    <div className="flex h-8 w-full items-center justify-between border-b border-[#1F232F] bg-[#06070A] px-4 text-[11px] font-mono text-zinc-400 select-none overflow-x-auto terminal-scroll">
      <div className="flex items-center gap-5 shrink-0">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D688]" />
          <span className="text-zinc-500">24H VOL:</span>
          <span className="font-semibold text-white tabular-nums">$61.2M</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-zinc-500">POLY:</span>
          <span className="text-zinc-300 tabular-nums">$42.8M</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-zinc-500">KALSHI:</span>
          <span className="text-zinc-300 tabular-nums">$18.4M</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">PAIRS LINKED:</span>
          <span className="text-[#00FFA3] font-medium tabular-nums">284</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#00D688]">
          <Zap className="h-3 w-3 fill-current" />
          <span className="text-zinc-500">TOP SPREAD:</span>
          <span className="font-semibold tabular-nums">+4.18% (FED CUT)</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 shrink-0 text-zinc-500 text-[10px]">
        <span>INGESTION SWR: 10s</span>
        <span>LATENCY: 12ms</span>
        <span className="text-[#00D688]">CFTC + ERC-1155 LINKED</span>
      </div>
    </div>
  );
}
