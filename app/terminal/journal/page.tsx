"use client";

import * as React from "react";
import { BookOpen, Download, Plus, FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TradeJournalPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#1F232F] bg-surface relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="surface" size="sm">
              MODULE 04
            </Badge>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Non-Custodial Audit
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Trade Journal &amp; Rationale Notes
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Private, local position tracker with rationale logging, live PnL calculations, and 1-click CSV audit export for reporting.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="surface" size="sm" className="font-mono text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Log Position</span>
          </Button>
        </div>
      </div>

      {/* Standby Dock */}
      <Card className="p-8 text-center border-dashed border-[#1F232F] bg-surface/50">
        <div className="max-w-md mx-auto space-y-3">
          <div className="h-10 w-10 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">Journal Dock Standby</h3>
          <p className="text-xs text-zinc-400">
            Layout structure initialized. Non-custodial trade store, PnL tracking, and CSV audit generation will be wired in Phase 6.
          </p>
        </div>
      </Card>
    </div>
  );
}
