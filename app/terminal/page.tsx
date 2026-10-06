"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  Zap,
  Star,
  BookOpen,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TerminalPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Dock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#1F232F] bg-surface relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#00D688]/5 to-transparent pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Trayse Terminal
            </span>
            <span className="text-zinc-600">/</span>
            <Badge variant="mint" size="sm">
              PHASE 1 ACTIVE
            </Badge>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
            Institutional Prediction Intelligence Engine
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Normalized micro-latency order books, synthetic cross-venue arbitrage detection, and non-custodial trade audit trails across Polymarket and Kalshi.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <Link href="/terminal/arbitrage">
            <Button variant="mint" size="sm" className="font-mono text-xs gap-1.5">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Launch Arb Radar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Structural Docks: 4 Core Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Market Browser Dock */}
        <Card className="hover:border-zinc-700 transition-all group flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-md bg-surface-elevated border border-[#1F232F] text-[#00D688]">
                <BarChart3 className="h-4 w-4" />
              </div>
              <Badge variant="surface" size="sm">
                Module 01
              </Badge>
            </div>
            <CardTitle className="mt-3 text-sm">Market Browser</CardTitle>
            <CardDescription>
              Normalized YES/NO probability ladders and order books across venues.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-3 border-t border-[#1F232F]/60 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-zinc-500">1,248 Contracts</span>
            <span className="text-white group-hover:text-[#00D688] flex items-center gap-1 transition-colors">
              Explore <ArrowRight className="h-3 w-3" />
            </span>
          </CardContent>
        </Card>

        {/* Module 2: Arbitrage Scanner Dock */}
        <Card className="hover:border-zinc-700 transition-all group flex flex-col justify-between border-[#00D688]/30 bg-gradient-to-b from-surface to-surface-elevated/40">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-md bg-[#00D688]/10 border border-[#00D688]/30 text-[#00D688]">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <Badge variant="mint" size="sm">
                +EV RADAR
              </Badge>
            </div>
            <CardTitle className="mt-3 text-sm">Arbitrage Scanner</CardTitle>
            <CardDescription>
              Automatic synthetic risk-free spread calculation: P(A,yes) + P(B,no) &lt; $1.00.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-3 border-t border-[#1F232F]/60 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-[#00FFA3] font-medium">+3.62% Top Spread</span>
            <Link href="/terminal/arbitrage" className="text-white group-hover:text-[#00D688] flex items-center gap-1 transition-colors">
              Scan <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Module 3: Unified Watchlists Dock */}
        <Card className="hover:border-zinc-700 transition-all group flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-md bg-surface-elevated border border-[#1F232F] text-amber-400">
                <Star className="h-4 w-4" />
              </div>
              <Badge variant="surface" size="sm">
                Module 03
              </Badge>
            </div>
            <CardTitle className="mt-3 text-sm">Unified Watchlists</CardTitle>
            <CardDescription>
              Custom institutional desks categorized by Macro, Crypto, Tech, and Politics.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-3 border-t border-[#1F232F]/60 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-zinc-500">Local Persistence</span>
            <Link href="/terminal/watchlists" className="text-white group-hover:text-[#00D688] flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Module 4: Trade Journal Dock */}
        <Card className="hover:border-zinc-700 transition-all group flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-md bg-surface-elevated border border-[#1F232F] text-blue-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <Badge variant="surface" size="sm">
                Module 04
              </Badge>
            </div>
            <CardTitle className="mt-3 text-sm">Trade Journal</CardTitle>
            <CardDescription>
              Private non-custodial rationale logger with 1-click CSV audit export.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-3 border-t border-[#1F232F]/60 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-zinc-500">Zero Leakage</span>
            <Link href="/terminal/journal" className="text-white group-hover:text-[#00D688] flex items-center gap-1 transition-colors">
              Log <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Market Infrastructure Docks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dock 1: Polymarket Ingestion Node */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00D688]" />
              <span className="text-xs font-semibold text-white font-mono">POLYMARKET CLOB</span>
            </div>
            <Badge variant="mint" size="sm">
              ONLINE
            </Badge>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-500">Protocol:</span>
              <span className="text-zinc-300">ERC-1155 / Polygon L2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Edge Gateway:</span>
              <span className="text-zinc-300">Gamma &amp; CLOB SWR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Latency:</span>
              <span className="text-[#00D688] font-semibold tabular-nums">9ms</span>
            </div>
          </div>
        </Card>

        {/* Dock 2: Kalshi Ingestion Node */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-xs font-semibold text-white font-mono">KALSHI CFTC v2</span>
            </div>
            <Badge variant="surface" size="sm">
              ONLINE
            </Badge>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-500">Regulatory:</span>
              <span className="text-zinc-300">CFTC DCM Regulated</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Odds Normalization:</span>
              <span className="text-zinc-300">Cents &rarr; Prob (0.00-1.00)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Latency:</span>
              <span className="text-blue-400 font-semibold tabular-nums">14ms</span>
            </div>
          </div>
        </Card>

        {/* Dock 3: Normalization & Fuzzy Match Engine */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-white font-mono">LINK &amp; ARB ENGINE</span>
            </div>
            <Badge variant="glow" size="sm">
              READY
            </Badge>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-500">Entity Matching:</span>
              <span className="text-zinc-300">Fuzzy Keyword &amp; Expiry</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Resolution Tolerance:</span>
              <span className="text-zinc-300">&plusmn;24 Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Net Fee Deduction:</span>
              <span className="text-[#00D688] font-semibold">Automated</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
