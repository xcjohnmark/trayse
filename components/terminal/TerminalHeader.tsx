"use client";

import React from "react";
import Link from "next/link";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  User,
} from "lucide-react";

export function TerminalHeader() {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
  } = useTerminalStore();

  return (
    <header className="h-12 w-full border-b border-[#1E2638] bg-[#0F131C] text-white flex items-center justify-between px-3 sm:px-4 select-none shrink-0 z-30">
      {/* 1. LEFT: Sidebar Toggle & Official Trayse Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#182030] border border-transparent hover:border-[#242E44] transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>

        <Link
          href="/terminal"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          {/* Official Trayse Logo */}
          <svg
            className="w-5 h-4 text-white shrink-0 group-hover:text-[#00D688] transition-colors"
            viewBox="0 0 60 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Column 1 (Left) */}
            <rect x="0" y="0" width="20" height="10" fill="currentColor" />
            <rect x="0" y="20" width="20" height="10" fill="currentColor" />
            <rect x="0" y="40" width="20" height="10" fill="currentColor" />

            {/* Column 2 (Center) */}
            <rect x="20" y="10" width="20" height="10" fill="currentColor" />
            <rect x="20" y="30" width="20" height="10" fill="currentColor" />

            {/* Column 3 (Right) */}
            <rect x="40" y="0" width="20" height="10" fill="currentColor" />
            <rect x="40" y="20" width="20" height="10" fill="currentColor" />
            <rect x="40" y="40" width="20" height="10" fill="currentColor" />
          </svg>

          {/* Trayse Wordmark with NewBlack font */}
          <span
            className="font-display font-['NewBlack'] font-bold text-base tracking-wider text-white select-none"
            style={{ fontFamily: "'NewBlack', var(--font-newblack), sans-serif" }}
          >
            TRAYSE
          </span>
        </Link>
      </div>

      {/* 2. CENTER: Global Market Search Input */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prediction markets, events, tickers..."
            className="w-full bg-[#141A26] border border-[#242E44] hover:border-[#354363] focus:border-[#00D688] rounded-md pl-9 pr-12 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 bg-[#0B0E14] px-1 py-0.5 rounded border border-[#242E44]">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* 3. RIGHT: Notifications & Profile */}
      <div className="flex items-center gap-2">
        {/* Notification Button */}
        <button
          type="button"
          className="relative p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#182030] transition-colors border border-transparent hover:border-[#242E44]"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[#00D688]" />
        </button>

        {/* Profile Button */}
        <button
          type="button"
          className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-md text-slate-300 hover:text-white hover:bg-[#182030] border border-transparent hover:border-[#242E44] transition-all"
          title="User Profile"
          aria-label="User Profile"
        >
          <div className="size-6 rounded-full bg-[#182030] border border-[#242E44] flex items-center justify-center text-[11px] font-medium text-white shadow-inner">
            <User className="size-3.5 text-slate-300" />
          </div>
        </button>
      </div>
    </header>
  );
}
