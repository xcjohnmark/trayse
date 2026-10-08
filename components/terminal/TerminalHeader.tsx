"use client";

import React from "react";
import Link from "next/link";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  KeyRound,
  Percent,
  Settings,
  Zap,
  Sparkles,
} from "lucide-react";

export function TerminalHeader() {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
    oddsFormat,
    setOddsFormat,
    polymarketConnected,
    kalshiConnected,
    isDemoMode,
    demoBalanceUsd,
    openModal,
  } = useTerminalStore();

  return (
    <header className="h-12 w-full border-b border-[#1F232F] bg-[#090A0E] text-white flex items-center justify-between px-3 sm:px-4 select-none shrink-0 z-30">
      {/* 1. LEFT: Sidebar Toggle & Brand Wordmark */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>

        <Link
          href="/terminal"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
        >
          <div className="w-6 h-6 rounded-lg bg-[#12141C] border border-[#1F232F] flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#00D688] animate-pulse" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            TRAYSE
            <span className="font-mono text-[9px] font-normal px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400">
              TERMINAL
            </span>
          </span>
        </Link>
      </div>

      {/* 2. CENTER: Global Market Search Input */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prediction markets, events, tickers..."
            className="w-full bg-[#12141C] border border-[#1F232F] rounded-lg pl-9 pr-12 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00D688] transition-colors"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-500 bg-black/40 px-1 py-0.5 rounded border border-white/5">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* 3. RIGHT: Odds Format & Exchange Connection Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Odds Format Selector (Percentage % vs Cents ¢) */}
        <div className="flex items-center bg-[#12141C] rounded-lg border border-[#1F232F] p-0.5 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setOddsFormat("PROBABILITY")}
            className={`px-2 py-0.5 rounded transition-all ${
              oddsFormat === "PROBABILITY"
                ? "bg-[#00D688] text-black font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => setOddsFormat("CENTS")}
            className={`px-2 py-0.5 rounded transition-all ${
              oddsFormat === "CENTS"
                ? "bg-[#00D688] text-black font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ¢
          </button>
        </div>

        {/* Exchange Accounts Connection Pill */}
        <button
          type="button"
          onClick={() => openModal("CONNECT_ACCOUNTS")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all shadow-sm ${
            polymarketConnected && kalshiConnected
              ? "bg-[#00D688]/15 border-[#00D688]/40 text-[#00FFA3] hover:bg-[#00D688]/25"
              : polymarketConnected
              ? "bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25"
              : kalshiConnected
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
              : isDemoMode
              ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
              : "bg-[#00D688] hover:bg-[#00FFA3] text-black font-semibold border-[#00D688]"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>
            {polymarketConnected && kalshiConnected
              ? "Poly + Kalshi Live"
              : polymarketConnected
              ? "Polymarket Live"
              : kalshiConnected
              ? "Kalshi Live"
              : isDemoMode
              ? `Demo: $${demoBalanceUsd.toLocaleString()}`
              : "Connect Accounts"}
          </span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => openModal("SESSION_KEYS")}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-[#1F232F]"
          title="Automated Trading Guardrails & Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Quick Onboarding & Tour Launcher */}
        <button
          type="button"
          onClick={() => openModal("ONBOARDING")}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-[#00D688] hover:bg-white/5 transition-colors border border-transparent hover:border-[#1F232F]"
          title="Launch First-Time Setup & Onboarding Wizard"
        >
          <Sparkles className="h-4 w-4 text-[#00D688]" />
        </button>
      </div>
    </header>
  );
}
