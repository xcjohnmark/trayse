"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  LayoutGrid,
  Zap,
  Star,
  BookOpen,
  Code2,
  Volume2,
  VolumeX,
} from "lucide-react";

export function TerminalSidebar() {
  const pathname = usePathname();
  const { watchlists, openModal } = useTerminalStore();
  const [isMuted, setIsMuted] = useState(false);

  const navItems = [
    {
      href: "/terminal",
      label: "Markets",
      tooltipTitle: "Market Browser (Alt+1)",
      shortcut: "Alt+1",
      icon: LayoutGrid,
      isActive: pathname === "/terminal",
    },
    {
      href: "/terminal/arbitrage",
      label: "Arb Radar",
      tooltipTitle: "Arbitrage Scanner (Alt+2)",
      shortcut: "Alt+2",
      icon: Zap,
      badge: "2",
      isActive: pathname.startsWith("/terminal/arbitrage"),
    },
    {
      href: "/terminal/watchlists",
      label: "Watchlists",
      tooltipTitle: "Watchlists (Alt+3)",
      shortcut: "Alt+3",
      icon: Star,
      badge: watchlists.length > 0 ? String(watchlists.length) : undefined,
      isActive: pathname.startsWith("/terminal/watchlists"),
    },
    {
      href: "/terminal/journal",
      label: "Journal",
      tooltipTitle: "Trade Journal (Alt+4)",
      shortcut: "Alt+4",
      icon: BookOpen,
      isActive: pathname.startsWith("/terminal/journal"),
    },
  ];

  return (
    <aside className="w-14 flex-shrink-0 border-r border-[#1F232F] bg-black flex flex-col justify-between py-3 select-none z-30">
      {/* 1. TOP: Primary Activity Navigation */}
      <nav className="flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.tooltipTitle}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                item.isActive
                  ? "bg-[#12141C] text-white border-l-2 border-[#00D688] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 transition-transform group-hover:scale-105" />

              {/* Dynamic Counter Badge */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#00D688]/20 border border-[#00D688]/40 px-1 text-[9px] font-mono font-bold text-[#00FFA3]">
                  {item.badge}
                </span>
              )}

              {/* Hover Tooltip */}
              <div className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-[#12141C] px-2.5 py-1 text-xs font-mono text-zinc-200 border border-[#1F232F] shadow-xl group-hover:flex items-center gap-1.5 z-50">
                <span>{item.tooltipTitle}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 2. BOTTOM: Developer SDK & Utility Toggles */}
      <div className="flex flex-col items-center gap-2 border-t border-[#1F232F] pt-3">
        {/* Python Developer SDK Trigger */}
        <button
          type="button"
          onClick={() => openModal("DEV_SDK")}
          title="Developer SDK & x402 Micropayments (Ctrl+K)"
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 hover:text-[#00D688] hover:bg-[#00D688]/10 transition-colors"
        >
          <Code2 className="h-4 w-4" />
          <div className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-[#12141C] px-2.5 py-1 text-xs font-mono text-zinc-200 border border-[#1F232F] shadow-xl group-hover:flex items-center gap-1.5 z-50">
            <span>Developer SDK (Ctrl+K)</span>
          </div>
        </button>

        {/* Audio FX Toggle */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Sound: Muted" : "Sound: Active"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-zinc-600" />
          ) : (
            <Volume2 className="h-4 w-4 text-zinc-400" />
          )}
        </button>
      </div>
    </aside>
  );
}
