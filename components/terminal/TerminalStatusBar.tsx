"use client";

import React, { useEffect, useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";

export function TerminalStatusBar() {
  const { activeRail } = useTerminalStore();
  const [solanaSlot, setSolanaSlot] = useState(312481902);
  const [nitroBlock, setNitroBlock] = useState(268140211);
  const [currentTimeUtc, setCurrentTimeUtc] = useState("");

  // Live ticking clock in UTC (updates every second)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeUtc(now.toTimeString().split(" ")[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Solana slot increments every 400ms (SVM target block time)
  useEffect(() => {
    const interval = setInterval(() => {
      setSolanaSlot((prev) => prev + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Nitro L2 block increments every 2000ms
  useEffect(() => {
    const interval = setInterval(() => {
      setNitroBlock((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-7 w-full flex-shrink-0 border-t border-[#1E2638] bg-[#0A0D13] px-3 sm:px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-30">
      {/* 1. LEFT: Venues */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D688] animate-pulse" />
          <span className="font-semibold text-slate-200">SYSTEM NORMAL</span>
        </div>
        <span className="hidden md:inline text-slate-600">|</span>
        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <span>POLYMARKET CLOB</span>
          <span className="text-slate-600">·</span>
          <span>KALSHI CFTC</span>
        </div>
      </div>

      {/* 2. CENTER: Live UTC Clock */}
      <div className="flex items-center gap-1 text-slate-400 font-mono tabular-nums">
        <span className="text-slate-500 font-semibold">UTC:</span>
        <span className="text-slate-200 font-medium">
          {currentTimeUtc || "12:00:00"}
        </span>
      </div>

      {/* 3. RIGHT: Version */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] text-slate-500 font-mono">v1.0.0-PROD</span>
      </div>
    </footer>
  );
}
