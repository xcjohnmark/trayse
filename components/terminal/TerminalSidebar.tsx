"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  LayoutGrid,
  Zap,
  Star,
  BookOpen,
  Code2,
  Brain,
  Bot,
  Activity,
  ChevronRight,
} from "lucide-react";

export function TerminalSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, watchlists, openModal, isDemoMode, polymarketConnected, kalshiConnected } =
    useTerminalStore();

  const tradingItems = [
    {
      href: "/terminal",
      label: "Markets",
      icon: LayoutGrid,
      isActive: pathname === "/terminal",
    },
    {
      href: "/terminal/watchlists",
      label: "Watchlists",
      icon: Star,
      badge: watchlists.length > 0 ? String(watchlists.length) : undefined,
      isActive: pathname.startsWith("/terminal/watchlists"),
    },
    {
      href: "/terminal/journal",
      label: "Trade Journal",
      icon: BookOpen,
      isActive: pathname.startsWith("/terminal/journal"),
    },
  ];

  const quantItems = [
    {
      action: () => openModal("QUANT_STUDIO"),
      label: "Quant Models",
      icon: Brain,
      badge: "4",
      highlight: true,
    },
    {
      href: "/terminal/arbitrage",
      label: "Arbitrage Radar",
      icon: Zap,
      badge: "LIVE",
      isActive: pathname.startsWith("/terminal/arbitrage"),
    },
    {
      action: () => openModal("SESSION_KEYS"),
      label: "Trading Bot Setup",
      icon: Bot,
    },
  ];

  const devItems = [
    {
      action: () => openModal("DEV_SDK"),
      label: "Data Feeds & SDK",
      icon: Code2,
    },
  ];

  return (
    <aside
      className={`flex-shrink-0 border-r border-[#1F232F] bg-[#090A0E] flex flex-col justify-between py-3 select-none z-30 transition-all duration-200 ${
        isSidebarCollapsed ? "w-14" : "w-[220px]"
      }`}
    >
      {/* Navigation Sections */}
      <div className="space-y-4 px-2">
        {/* SECTION 1: TRADING */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Trading
            </div>
          )}
          <div className="space-y-1">
            {tradingItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    item.isActive
                      ? "bg-[#12141C] text-[#00FFA3] border border-[#00D688]/30 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 ${
                      item.isActive ? "text-[#00FFA3]" : "text-zinc-400 group-hover:text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}

                  {!isSidebarCollapsed && item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#00D688]/15 border border-[#00D688]/30 text-[#00FFA3]">
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed Tooltip */}
                  {isSidebarCollapsed && (
                    <div className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-[#12141C] px-2.5 py-1 text-xs font-mono text-zinc-200 border border-[#1F232F] shadow-xl group-hover:flex items-center gap-1.5 z-50">
                      <span>{item.label}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: QUANT & AUTOMATION */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Quant &amp; Bots
            </div>
          )}
          <div className="space-y-1">
            {quantItems.map((item, idx) => {
              const Icon = item.icon;
              const content = (
                <>
                  <Icon className="h-4 w-4 flex-shrink-0 text-zinc-400 group-hover:text-white" />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/20 border border-purple-500/40 text-purple-300">
                      {item.badge}
                    </span>
                  )}

                  {isSidebarCollapsed && (
                    <div className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-[#12141C] px-2.5 py-1 text-xs font-mono text-zinc-200 border border-[#1F232F] shadow-xl group-hover:flex items-center gap-1.5 z-50">
                      <span>{item.label}</span>
                    </div>
                  )}
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      item.isActive
                        ? "bg-[#12141C] text-[#00FFA3] border border-[#00D688]/30 font-semibold"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left ${
                    isSidebarCollapsed ? "justify-center px-0" : ""
                  }`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: DEVELOPER & DATA */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Developer
            </div>
          )}
          <div className="space-y-1">
            {devItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left ${
                    isSidebarCollapsed ? "justify-center px-0" : ""
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-zinc-400 group-hover:text-white" />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {isSidebarCollapsed && (
                    <div className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-[#12141C] px-2.5 py-1 text-xs font-mono text-zinc-200 border border-[#1F232F] shadow-xl group-hover:flex items-center gap-1.5 z-50">
                      <span>{item.label}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER: Exchange Status Badge */}
      <div className="border-t border-[#1F232F] pt-2 px-2">
        <button
          type="button"
          onClick={() => openModal("CONNECT_ACCOUNTS")}
          className={`w-full flex items-center gap-2 p-2 rounded-lg text-[11px] font-mono transition-colors ${
            isDemoMode
              ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : polymarketConnected || kalshiConnected
              ? "bg-[#00D688]/10 text-[#00FFA3] hover:bg-[#00D688]/20"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          } ${isSidebarCollapsed ? "justify-center p-2" : ""}`}
        >
          <span
            className={`h-2 w-2 rounded-full flex-shrink-0 ${
              isDemoMode
                ? "bg-amber-400"
                : polymarketConnected || kalshiConnected
                ? "bg-[#00D688]"
                : "bg-zinc-600"
            }`}
          />
          {!isSidebarCollapsed && (
            <span className="truncate flex-1 text-left font-semibold">
              {isDemoMode
                ? "Demo Mode Active"
                : polymarketConnected && kalshiConnected
                ? "Poly + Kalshi Live"
                : polymarketConnected
                ? "Polymarket Live"
                : kalshiConnected
                ? "Kalshi Live"
                : "Connect Accounts"}
            </span>
          )}
          {!isSidebarCollapsed && (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
          )}
        </button>
      </div>
    </aside>
  );
}
