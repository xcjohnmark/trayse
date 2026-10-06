"use client";

import * as React from "react";
import { Zap, ShieldCheck, ArrowUpRight, Filter, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ArbitrageScannerPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#00D688]/30 bg-surface relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="mint" size="sm">
              MODULE 02
            </Badge>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Synthetic Risk-Free Engine
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#00D688] fill-current" />
            Cross-Venue Arbitrage Scanner
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Detects discrepancies where P(Polymarket, Yes) + P(Kalshi, No) &lt; $1.00 net of platform taker fees. Every pair guarantees a $1.00 payout at resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="glow" size="md">
            4 SPREADS DETECTED
          </Badge>
        </div>
      </div>

      {/* Structural Placeholders for Phase 5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">Top Gross Spread</div>
          <div className="text-2xl font-bold text-[#00FFA3] font-mono tabular-nums">+4.18%</div>
          <p className="text-[11px] text-zinc-400">Fed Rate Cut Nov 2026</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">Estimated Depth Capacity</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">$48,250</div>
          <p className="text-[11px] text-zinc-400">Top-of-book executable size</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="text-[11px] font-mono text-zinc-500 uppercase">Detection Speed</div>
          <div className="text-2xl font-bold text-blue-400 font-mono tabular-nums">Sub-15ms</div>
          <p className="text-[11px] text-zinc-400">Edge SWR WebSocket tape</p>
        </Card>
      </div>

      {/* Empty State / Standby Dock */}
      <Card className="p-8 text-center border-dashed border-[#1F232F] bg-surface/50">
        <div className="max-w-md mx-auto space-y-3">
          <div className="h-10 w-10 mx-auto rounded-full bg-[#00D688]/10 border border-[#00D688]/30 flex items-center justify-center text-[#00D688]">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <h3 className="text-sm font-semibold text-white">Arbitrage Feed Standby</h3>
          <p className="text-xs text-zinc-400">
            The core layout dock and route are initialized. Full live calculation engine with order book depth and 1-click execution links will be wired in Phase 5.
          </p>
        </div>
      </Card>
    </div>
  );
}
