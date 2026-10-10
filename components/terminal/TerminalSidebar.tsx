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
} from "lucide-react";

export function TerminalSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, watchlists, openModal } =
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
    },
    {
      href: "/terminal/arbitrage",
      label: "Arbitrage Radar",
      icon: Zap,
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
      className={`flex-shrink-0 border-r border-[#1E2638] bg-[#0F131C] flex flex-col justify-between py-3 select-none z-30 transition-all duration-200 ${
        isSidebarCollapsed ? "w-14" : "w-[210px]"
      }`}
    >
      {/* Navigation Sections */}
      <div className="space-y-3 px-2">
        {/* SECTION 1: TRADING */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Trading
            </div>
          )}
          <div className="space-y-0.5">
            {tradingItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    item.isActive
                      ? "bg-[#182030] text-[#00FFA3] border border-[#00FFA3]/35 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-[#182030] border border-transparent hover:border-[#242E44]"
                  } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`size-4 flex-shrink-0 ${
                      item.isActive ? "text-[#00FFA3]" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}

                  {/* Collapsed Tooltip */}
                  {isSidebarCollapsed && (
                    <div className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-[#182030] px-2.5 py-1 text-xs font-mono text-white border border-[#242E44] shadow-xl group-hover:flex items-center gap-1.5 z-50">
                      <span>{item.label}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* SECTION DIVIDER */}
        <div className="border-t border-[#1E2638] my-1" />

        {/* SECTION 2: QUANT & AUTOMATION */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Quant &amp; Bots
            </div>
          )}
          <div className="space-y-0.5">
            {quantItems.map((item, idx) => {
              const Icon = item.icon;
              const content = (
                <>
                  <Icon className="size-4 flex-shrink-0 text-slate-400 group-hover:text-white" />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}

                  {isSidebarCollapsed && (
                    <div className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-[#182030] px-2.5 py-1 text-xs font-mono text-white border border-[#242E44] shadow-xl group-hover:flex items-center gap-1.5 z-50">
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
                    className={`group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      item.isActive
                        ? "bg-[#182030] text-[#00FFA3] border border-[#00FFA3]/35 font-semibold shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-[#182030] border border-transparent hover:border-[#242E44]"
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
                  className={`w-full group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-[#182030] border border-transparent hover:border-[#242E44] transition-all text-left ${
                    isSidebarCollapsed ? "justify-center px-0" : ""
                  }`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION DIVIDER */}
        <div className="border-t border-[#1E2638] my-1" />

        {/* SECTION 3: DEVELOPER & DATA */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Developer
            </div>
          )}
          <div className="space-y-0.5">
            {devItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-[#182030] border border-transparent hover:border-[#242E44] transition-all text-left ${
                    isSidebarCollapsed ? "justify-center px-0" : ""
                  }`}
                >
                  <Icon className="size-4 flex-shrink-0 text-slate-400 group-hover:text-white" />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {isSidebarCollapsed && (
                    <div className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-[#182030] px-2.5 py-1 text-xs font-mono text-white border border-[#242E44] shadow-xl group-hover:flex items-center gap-1.5 z-50">
                      <span>{item.label}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
