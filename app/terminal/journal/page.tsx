"use client";

import React, { useState, useMemo } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { JournalEntry } from "@/lib/types/terminal";
import {
  BookOpen,
  Plus,
  Download,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  X,
  Layers,
} from "lucide-react";

export default function JournalPage() {
  const { journalEntries, addJournalEntry, updateJournalEntryStatus } = useTerminalStore();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Form State
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState<JournalEntry["venue"]>("Dual-Arb");
  const [position, setPosition] = useState<JournalEntry["position"]>("SYNTHETIC_ARB");
  const [sizeUsd, setSizeUsd] = useState(500);
  const [entryPrice, setEntryPrice] = useState(0.95);
  const [thesis, setThesis] = useState("");

  // Aggregate Metrics
  const totalInvested = useMemo(
    () => journalEntries.reduce((acc, e) => acc + e.sizeUsd, 0),
    [journalEntries]
  );

  const totalPnl = useMemo(
    () => journalEntries.reduce((acc, e) => acc + e.pnlUsd, 0),
    [journalEntries]
  );

  const openCount = useMemo(
    () => journalEntries.filter((e) => e.status === "OPEN").length,
    [journalEntries]
  );

  const winRate = useMemo(() => {
    const resolved = journalEntries.filter((e) => e.status !== "OPEN");
    if (resolved.length === 0) return 0;
    const wins = resolved.filter((e) => e.status === "WON" || e.pnlUsd > 0);
    return Math.round((wins.length / resolved.length) * 100);
  }, [journalEntries]);

  // Handle Log Trade
  const handleLogTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addJournalEntry({
      pairId: `manual-${Date.now()}`,
      marketTitle: title,
      venue,
      position,
      sizeUsd: Number(sizeUsd),
      entryPrice: Number(entryPrice),
      status: "OPEN",
      pnlUsd: 0,
      thesis: thesis.trim() || "Manual trade position logged from Trading Journal.",
    });

    setTitle("");
    setThesis("");
    setIsLogModalOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["ID,Date,Market,Venue,Position,Size_USD,Entry_Price,Status,PnL_USD,Thesis"];
    const rows = journalEntries.map((e) => {
      const dateStr = new Date(e.timestamp).toISOString();
      const safeTitle = `"${e.marketTitle.replace(/"/g, '""')}"`;
      const safeThesis = `"${e.thesis.replace(/"/g, '""')}"`;
      return `${e.id},${dateStr},${safeTitle},${e.venue},${e.position},${e.sizeUsd},${e.entryPrice},${e.status},${e.pnlUsd},${safeThesis}`;
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trayse-journal-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonContent = JSON.stringify(journalEntries, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trayse-journal-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredEntries = journalEntries.filter((e) => {
    if (filterStatus === "ALL") return true;
    return e.status === filterStatus;
  });

  return (
    <div className="flex flex-col h-full space-y-4 font-sans select-none overflow-y-auto pr-1">
      {/* 1. Top Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>TOTAL CAPITAL LOGGED</span>
            <DollarSign className="h-3 w-3 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ${totalInvested.toLocaleString()} USD
          </div>
        </div>

        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>REALIZED / ACCRUED PNL</span>
            <TrendingUp className="h-3 w-3 text-[#00FFA3]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#00FFA3] mt-1">
            +${totalPnl.toFixed(2)} USD
          </div>
        </div>

        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>RESOLVED WIN RATE</span>
            <Award className="h-3 w-3 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">
            {winRate}%
          </div>
        </div>

        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>ACTIVE POSITIONS</span>
            <Clock className="h-3 w-3 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {openCount} Open Trades
          </div>
        </div>
      </div>

      {/* 2. Control & Export Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0C0D12] border border-[#1F232F] p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[#00FFA3]">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              NON-CUSTODIAL TRADE AUDIT JOURNAL
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              100% Client-Side Local Storage • Deterministic Performance Record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#12141C] border border-[#1F232F] p-1 rounded-lg text-xs font-mono">
            {["ALL", "OPEN", "WON", "LOST"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  filterStatus === st
                    ? "bg-[#00D688]/20 text-[#00FFA3] font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-zinc-300 hover:text-white text-xs font-mono transition-colors"
            title="Download CSV audit log"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-zinc-300 hover:text-white text-xs font-mono transition-colors"
            title="Download JSON audit log"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>JSON</span>
          </button>

          {/* Manual Log Trade Trigger */}
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D688] hover:bg-[#00FFA3] text-black font-mono font-bold text-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>

      {/* 3. Trade History Table */}
      <div className="rounded-lg border border-[#1F232F] bg-[#090A0E] overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1F232F] bg-[#0E1017] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3 min-w-[220px]">Market Event</th>
                <th className="py-2.5 px-3">Venue</th>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3 text-right">Size USD</th>
                <th className="py-2.5 px-3 text-right">Entry</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">PnL</th>
                <th className="py-2.5 px-3 min-w-[200px]">Thesis / Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F232F] text-xs font-mono">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-zinc-500 font-mono">
                    No journal trade records found for filter &quot;{filterStatus}&quot;.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const dateStr = new Date(entry.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={entry.id} className="hover:bg-[#12141C]/60 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-3 text-zinc-400 whitespace-nowrap text-[11px]">
                        {dateStr}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-zinc-200 line-clamp-1">
                          {entry.marketTitle}
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                          {entry.venue}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            entry.position === "SYNTHETIC_ARB"
                              ? "bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30"
                              : entry.position === "YES"
                              ? "bg-purple-500/15 text-purple-300"
                              : "bg-blue-500/15 text-blue-300"
                          }`}
                        >
                          {entry.position}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-3 text-right font-bold text-white">
                        ${entry.sizeUsd.toLocaleString()}
                      </td>

                      {/* Entry Price */}
                      <td className="py-3 px-3 text-right text-zinc-300">
                        ${entry.entryPrice.toFixed(3)}
                      </td>

                      {/* Status Toggle Selector */}
                      <td className="py-3 px-3 text-center">
                        <select
                          aria-label="Trade Status"
                          value={entry.status}
                          onChange={(e) =>
                            updateJournalEntryStatus(
                              entry.id,
                              e.target.value as JournalEntry["status"]
                            )
                          }
                          className={`text-[10px] px-2 py-1 rounded font-bold border appearance-none cursor-pointer text-center bg-[#0C0D12] ${
                            entry.status === "OPEN"
                              ? "text-amber-400 border-amber-500/30"
                              : entry.status === "WON"
                              ? "text-[#00FFA3] border-[#00FFA3]/30"
                              : entry.status === "LOST"
                              ? "text-rose-400 border-rose-500/30"
                              : "text-zinc-400 border-zinc-700"
                          }`}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="WON">WON</option>
                          <option value="LOST">LOST</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>

                      {/* PnL */}
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          entry.pnlUsd > 0
                            ? "text-[#00FFA3]"
                            : entry.pnlUsd < 0
                            ? "text-rose-400"
                            : "text-zinc-400"
                        }`}
                      >
                        {entry.pnlUsd > 0 ? `+$${entry.pnlUsd.toFixed(2)}` : `$${entry.pnlUsd.toFixed(2)}`}
                      </td>

                      {/* Thesis */}
                      <td className="py-3 px-3 text-zinc-400 text-[11px] line-clamp-2">
                        {entry.thesis}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Log Trade Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#00FFA3]" />
                <h3 className="font-semibold text-sm">Log Position to Journal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLogTrade} className="p-5 space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-zinc-400 block mb-1">Market Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US Federal Reserve Rate Cut Nov 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Venue</label>
                  <select
                    value={venue}
                    onChange={(e) => setVenue(e.target.value as JournalEntry["venue"])}
                    className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                  >
                    <option value="Dual-Arb">Dual-Arb</option>
                    <option value="Polymarket">Polymarket</option>
                    <option value="Kalshi">Kalshi</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Position Type</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as JournalEntry["position"])}
                    className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                  >
                    <option value="SYNTHETIC_ARB">SYNTHETIC_ARB</option>
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Size (USD)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sizeUsd}
                    onChange={(e) => setSizeUsd(Number(e.target.value))}
                    className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Entry Price ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.01"
                    max="0.99"
                    required
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Trade Rationale / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Statistical edge detected on inflation nowcast model..."
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F232F]">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-[#161922] text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#00D688] hover:bg-[#00FFA3] text-black font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
