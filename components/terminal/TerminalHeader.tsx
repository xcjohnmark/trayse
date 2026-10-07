"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { BlockchainRail } from "@/lib/types/terminal";
import { Activity, ShieldCheck, Key } from "lucide-react";

export function TerminalHeader() {
  const { activeRail, setActiveRail, sessionKey, openModal } = useTerminalStore();
  const [latency, setLatency] = useState(14);

  // Micro-jitter simulation for tape latency (12ms - 18ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(12 + Math.floor(Math.random() * 7));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const rails: { id: BlockchainRail; label: string; badge: string }[] = [
    { id: "DUAL", label: "DUAL RAIL", badge: "SVM + L2" },
    { id: "SOLANA", label: "SOLANA SVM", badge: "Yellowstone" },
    { id: "ROBINHOOD", label: "ROBINHOOD L2", badge: "Nitro" },
  ];

  return (
    <header className="h-12 w-full flex-shrink-0 border-b border-[#1F232F] bg-black/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between select-none z-40">
      {/* 1. LEFT: Brand Emblem, Terminal Badge & Live Latency */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:opacity-85 transition-opacity"
        >
          <div className="relative flex items-center justify-center h-6 w-6 rounded bg-[#12141C] border border-[#1F232F]">
            <span className="h-2 w-2 rounded-full bg-[#00D688] animate-pulse" />
          </div>
          <span className="font-display font-bold tracking-tight text-sm text-white">
            TRAYSE
          </span>
        </Link>

        <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-[#1F232F] text-zinc-400">
          TERMINAL v1.0
        </span>

        {/* Live Tape Latency Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#12141C] border border-[#1F232F] text-[11px] font-mono text-zinc-400">
          <Activity className="h-3 w-3 text-[#00D688]" />
          <span>TAPE:</span>
          <span className="text-zinc-200 tabular-nums font-semibold">
            {latency}ms
          </span>
        </div>
      </div>

      {/* 2. CENTER: Segmented Dual-Rail Switcher */}
      <div className="flex items-center bg-[#090A0E] p-0.5 rounded-lg border border-[#1F232F]">
        {rails.map((rail) => {
          const isActive = activeRail === rail.id;

          let activeStyle = "";
          if (isActive) {
            if (rail.id === "DUAL") {
              // Dual green/blue aura
              activeStyle =
                "bg-gradient-to-r from-[#00D688]/20 via-[#12141C] to-blue-500/20 text-white border border-[#00D688]/40 shadow-[0_0_14px_rgba(0,214,136,0.15)]";
            } else if (rail.id === "SOLANA") {
              // Electric mint aura
              activeStyle =
                "bg-[#00D688]/15 text-[#00FFA3] border border-[#00D688]/40 shadow-[0_0_12px_rgba(0,214,136,0.2)]";
            } else if (rail.id === "ROBINHOOD") {
              // Robinhood gold/blue aura
              activeStyle =
                "bg-gradient-to-r from-amber-500/15 to-blue-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
            }
          } else {
            activeStyle =
              "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent";
          }

          return (
            <button
              key={rail.id}
              type="button"
              onClick={() => setActiveRail(rail.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${activeStyle}`}
            >
              <span>{rail.label}</span>
              <span className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-white/10 text-zinc-300">
                {rail.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. RIGHT: Session Key Status & Multi-Chain Wallet */}
      <div className="flex items-center gap-2">
        {/* Swig Session Key Status Pill */}
        <button
          type="button"
          onClick={() => openModal("SESSION_KEYS")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
            sessionKey.isAuthorized
              ? "bg-[#00D688]/10 text-[#00D688] border-[#00D688]/30 hover:bg-[#00D688]/20 shadow-[0_0_8px_rgba(0,214,136,0.1)]"
              : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
          }`}
          title="Swig Delegated Session Key Guardrails"
        >
          {sessionKey.isAuthorized ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-[#00D688]" />
              <span className="hidden sm:inline font-semibold">KEY: ACTIVE (GUARDED)</span>
              <span className="sm:hidden font-semibold">GUARDED</span>
            </>
          ) : (
            <>
              <Key className="h-3.5 w-3.5 text-red-400" />
              <span className="hidden sm:inline font-semibold">KEY: NOT DELEGATED</span>
              <span className="sm:hidden font-semibold">UNGUARDED</span>
            </>
          )}
        </button>

        {/* Multi-Chain Connected Button with Network Badges */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#12141C] border border-[#1F232F] text-xs font-mono text-zinc-300 shadow-sm">
          {/* Solana Network Badge */}
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D688]" />
            <span className="text-[10px] text-zinc-400 font-bold">SOL:</span>
            <span className="text-zinc-200">sol...8F9</span>
          </div>

          <span className="text-zinc-700">|</span>

          {/* Robinhood L2 Badge */}
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-zinc-400 font-bold">RH:</span>
            <span className="text-zinc-200">0x7a...4D2</span>
          </div>
        </div>
      </div>
    </header>
  );
}
