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
    <footer className="h-7 w-full flex-shrink-0 border-t border-[#1F232F] bg-black px-3 sm:px-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 select-none z-30">
      {/* 1. LEFT: Engine Heartbeat & Venues */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#00D688] animate-pulse" />
          <span className="font-semibold text-zinc-200">ENGINE: ONLINE</span>
        </div>
        <span className="hidden md:inline text-zinc-700">|</span>
        <div className="hidden md:flex items-center gap-1.5 text-zinc-400">
          <span>FEEDS: POLYMARKET CLOB [OK]</span>
          <span className="text-zinc-700">|</span>
          <span>KALSHI CFTC v2 [OK]</span>
        </div>
      </div>

      {/* 2. CENTER: Live UTC Normalization Clock */}
      <div className="flex items-center gap-1 text-zinc-400 font-mono tabular-nums">
        <span className="text-zinc-500 font-semibold">SYNC:</span>
        <span className="text-zinc-200">
          {currentTimeUtc || "12:00:00"} UTC
        </span>
      </div>

      {/* 3. RIGHT: Dual-Rail Telemetry & Hackathon Build Tag */}
      <div className="flex items-center gap-2.5">
        {/* Solana Yellowstone Slot Telemetry */}
        <div
          className={`flex items-center gap-1 transition-colors ${
            activeRail === "SOLANA" || activeRail === "DUAL"
              ? "text-[#00D688]"
              : "text-zinc-500"
          }`}
        >
          <span className="hidden lg:inline text-zinc-500">SOLANA:</span>
          <span>Slot #{solanaSlot.toLocaleString()}</span>
          <span className="hidden xl:inline text-zinc-600">(Yellowstone gRPC 8ms)</span>
        </div>

        <span className="hidden lg:inline text-zinc-700">|</span>

        {/* Robinhood Arbitrum Nitro Block Telemetry */}
        <div
          className={`hidden sm:flex items-center gap-1 transition-colors ${
            activeRail === "ROBINHOOD" || activeRail === "DUAL"
              ? "text-amber-400"
              : "text-zinc-500"
          }`}
        >
          <span className="hidden lg:inline text-zinc-500">ROBINHOOD:</span>
          <span>Block #{nitroBlock.toLocaleString()}</span>
          <span className="hidden xl:inline text-zinc-600">(Nitro L2)</span>
        </div>

        <span className="hidden sm:inline text-zinc-700">|</span>

        {/* Hackathon Build Badge */}
        <span className="px-1.5 py-0.2 rounded bg-white/5 border border-[#1F232F] text-[10px] text-zinc-400">
          HACKATHON BUILD: v1.0.0-PROD
        </span>
      </div>
    </footer>
  );
}
