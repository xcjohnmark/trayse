"use client";

import * as React from "react";
import { Star, Plus, FolderPlus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function WatchlistsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#1F232F] bg-surface relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="surface" size="sm">
              MODULE 03
            </Badge>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Client Desk
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400/20" />
            Unified Watchlists &amp; Monitoring Desks
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Custom institutional monitoring desks organized by Macro Volatility, Crypto, Tech Earnings, and Politics with instant LocalStorage sync.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="surface" size="sm" className="font-mono text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Watchlist</span>
          </Button>
        </div>
      </div>

      {/* Standby Dock */}
      <Card className="p-8 text-center border-dashed border-[#1F232F] bg-surface/50">
        <div className="max-w-md mx-auto space-y-3">
          <div className="h-10 w-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Star className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">Watchlists Dock Standby</h3>
          <p className="text-xs text-zinc-400">
            Layout structure initialized. Zustand persistent watchlist store and custom category desks will be wired in Phase 4.
          </p>
        </div>
      </Card>
    </div>
  );
}
