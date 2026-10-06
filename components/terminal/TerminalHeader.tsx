"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Wallet,
  Activity,
  Zap,
  Globe,
  Bell,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Kbd } from "@/components/ui/kbd";

export interface TerminalHeaderProps {
  onOpenSearch?: () => void;
}

export function TerminalHeader({ onOpenSearch }: TerminalHeaderProps) {
  // Live micro-latency simulation (fluctuates between 11ms and 14ms)
  const [latency, setLatency] = React.useState(12);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLatency(11 + Math.floor(Math.random() * 4));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#1F232F] bg-surface/95 px-3 sm:px-4 backdrop-blur-md select-none">
      {/* LEFT SECTION: Logo Lockup & Workspace Indicator */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          {/* Logo logotype from /trayse-logotype.svg */}
          <div className="relative h-6 w-24 sm:w-28 flex items-center">
            <Image
              src="/trayse-logotype.svg"
              alt="Trayse"
              width={112}
              height={26}
              priority
              className="object-contain filter invert-0"
            />
          </div>
        </Link>

        {/* Vertical divider */}
        <div className="h-4 w-px bg-[#1F232F]" />

        {/* Terminal Badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold hidden sm:inline-block">
            TERMINAL v1
          </span>
          <Badge variant="glow" size="sm" className="hidden md:inline-flex">
            PRO
          </Badge>
        </div>
      </div>

      {/* CENTER SECTION: Command Search Dock & Live Pulse */}
      <div className="flex items-center gap-3 max-w-md w-full justify-center px-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="group flex w-full max-w-sm items-center justify-between rounded-md border border-[#1F232F] bg-surface-elevated/70 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-zinc-700 hover:bg-surface-elevated hover:text-zinc-200 cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300" />
            <span className="truncate">Search markets, contracts, odds...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
        </button>
      </div>

      {/* RIGHT SECTION: Market Pulse, Latency Ticker, and Wallet Dock */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Real-time micro-latency ticker */}
        <StatusIndicator
          status="live"
          latency={latency}
          label="CLOB EDGE"
          className="hidden sm:inline-flex"
        />

        {/* Arbitrage Radar Quick Pill */}
        <Link
          href="/terminal/arbitrage"
          className="hidden lg:flex items-center gap-1.5 rounded border border-[#00D688]/30 bg-[#00D688]/10 px-2 py-1 text-[11px] font-mono text-[#00D688] transition-colors hover:bg-[#00D688]/20"
        >
          <Zap className="h-3 w-3 fill-current" />
          <span className="font-semibold tabular-nums">+3.6% ARB</span>
        </Link>

        {/* Market Feeds Health */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded border border-[#1F232F] bg-surface text-[11px] font-mono text-zinc-400">
          <Globe className="h-3 w-3 text-zinc-500" />
          <span>POLY + KALSHI</span>
        </div>

        {/* Wallet Dock Placeholder */}
        <div className="flex items-center gap-2">
          <Button
            variant="surface"
            size="sm"
            className="hidden md:inline-flex text-xs font-mono gap-1.5 text-zinc-300 border-[#1F232F]"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#00D688]" />
            <span>Read-Only Feed</span>
          </Button>

          <Button
            variant="mint"
            size="sm"
            className="text-xs font-mono font-medium gap-1.5"
            onClick={() => {
              // Simulated wallet connection dialog or status
              alert("Trayse Terminal runs in instant non-custodial read-only mode with live normalized feeds. Wallet execution connectivity will activate in Phase 6.");
            }}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Connect Desk</span>
            <span className="sm:hidden">Desk</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
