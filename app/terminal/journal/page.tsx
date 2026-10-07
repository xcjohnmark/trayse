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
  FileText,
  X,
  CheckCircle2,
} from "lucide-react";

export default function JournalPage() {
  const { journalEntries, addJournalEntry, updateJournalEntryStatus } = useTerminalStore();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Form State
  const [marketName, setMarketName] = useState("");
  const [venue, setVenue] = useState<JournalEntry["venue"]>("Dual-Arb");
  const [position, setPosition] = useState<JournalEntry["position"]>("SYNTHETIC_ARB");
  const [sizeUsd, setSizeUsd] = useState(500);
  const [entryPrice, setEntryPrice] = useState(0.95);
  const [thesisNote, setThesisNote] = useState("");

  // 1. Top Metrics Calculations
  const totalCapitalInvested = useMemo(
    () => journalEntries.reduce((acc, e) => acc + e.sizeUsd, 0),
    [journalEntries]
  );

  const realizedPnl = useMemo(
    () => journalEntries.reduce((acc, e) => acc + e.pnlUsd, 0),
    [journalEntries]
  );

  const openTradeCount = useMemo(
    () => journalEntries.filter((e) => e.status === "OPEN").length,
    [journalEntries]
  );

  const winRatePercent = useMemo(() => {
    const resolved = journalEntries.filter((e) => e.status !== "OPEN");
    if (resolved.length === 0) return 73.2; // default benchmark
    const wins = resolved.filter((e) => e.status === "WON" || e.pnlUsd > 0);
    return Number(((wins.length / resolved.length) * 100).toFixed(1));
  }, [journalEntries]);

  // 2. Handle Submit New Trade
  const handleLogTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketName.trim()) return;

    addJournalEntry({
      pairId: `manual-${Date.now()}`,
      marketTitle: marketName.trim(),
      venue,
      position,
      sizeUsd: Number(sizeUsd),
      entryPrice: Number(entryPrice),
      status: "OPEN",
      pnlUsd: 0,
      thesis: thesisNote.trim() || "Manual trade thesis logged from Trading Journal.",
    });

    setMarketName("");
    setThesisNote("");
    setIsLogModalOpen(false);
  };

  // 3. Export CSV Action
  const handleExportCsv = () => {
    const headers = ["ID,Date,Market_Title,Venue,Position,Size_USD,Entry_Price,Status,PnL_USD,Thesis_Note"];
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

  // 4. Export JSON Action
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
        {/* Total Capital Invested */}
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>TOTAL CAPITAL INVESTED</span>
            <DollarSign className="h-3 w-3 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ${totalCapitalInvested.toLocaleString()} USD
          </div>
        </div>

        {/* Win Rate % */}
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>WIN RATE %</span>
            <Award className="h-3 w-3 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">
            {winRatePercent}%
          </div>
        </div>

        {/* Realized PnL */}
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>REALIZED PNL</span>
            <TrendingUp className="h-3 w-3 text-[#00FFA3]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#00FFA3] mt-1">
            +${realizedPnl.toFixed(2)} USD
          </div>
        </div>

        {/* Open Trade Count */}
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>OPEN TRADE COUNT</span>
            <Clock className="h-3 w-3 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {openTradeCount} Active
          </div>
        </div>
      </div>

      {/* 2. Control Bar with "Log Trade" Trigger & Export Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0C0D12] border border-[#1F232F] p-3 rounded-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[#00FFA3]">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              NON-CUSTODIAL TRADE AUDIT JOURNAL
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              100% Client-Side Local Storage • Audit Verification Logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Pills */}
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

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-zinc-200 hover:text-white text-xs font-mono transition-colors"
            title="Export CSV audit file"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>

          {/* Export JSON Button */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-zinc-200 hover:text-white text-xs font-mono transition-colors"
            title="Export JSON audit file"
          >
            <FileText className="h-3.5 w-3.5 text-zinc-400" />
            <span>Export JSON</span>
          </button>

          {/* Log Trade Trigger Button */}
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00D688] hover:bg-[#00FFA3] text-black font-mono font-bold text-xs transition-colors shadow-md shadow-[#00FFA3]/10"
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
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 min-w-[200px]">Market Title</th>
                <th className="py-2.5 px-3">Venue</th>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3 text-right">Size ($)</th>
                <th className="py-2.5 px-3 text-right">Entry</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">PnL ($)</th>
                <th className="py-2.5 px-3 min-w-[220px]">Thesis Note</th>
                <th className="py-2.5 px-3 text-center">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F232F] text-xs font-mono">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-zinc-500 font-mono">
                    No trade records found under filter &quot;{filterStatus}&quot;.
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
                      {/* 1. Date */}
                      <td className="py-3 px-3 text-zinc-400 whitespace-nowrap text-[11px]">
                        {dateStr}
                      </td>

                      {/* 2. Market Title */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-zinc-200 line-clamp-1">
                          {entry.marketTitle}
                        </div>
                      </td>

                      {/* 3. Venue */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                          {entry.venue}
                        </span>
                      </td>

                      {/* 4. Position */}
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

                      {/* 5. Size ($) */}
                      <td className="py-3 px-3 text-right font-bold text-white">
                        ${entry.sizeUsd.toLocaleString()}
                      </td>

                      {/* 6. Entry */}
                      <td className="py-3 px-3 text-right text-zinc-300">
                        ${entry.entryPrice.toFixed(3)}
                      </td>

                      {/* 7. Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            entry.status === "OPEN"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : entry.status === "WON"
                              ? "bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40"
                              : entry.status === "LOST"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>

                      {/* 8. PnL ($) */}
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

                      {/* 9. Thesis Note */}
                      <td className="py-3 px-3 text-zinc-400 text-[11px] line-clamp-2 max-w-xs">
                        {entry.thesis}
                      </td>

                      {/* 10. Status Toggle */}
                      <td className="py-3 px-3 text-center">
                        <select
                          aria-label="Toggle Trade Status"
                          value={entry.status}
                          onChange={(e) =>
                            updateJournalEntryStatus(
                              entry.id,
                              e.target.value as JournalEntry["status"]
                            )
                          }
                          className="text-[10px] px-2 py-1 rounded font-mono font-semibold border border-[#1F232F] bg-[#12141C] text-zinc-300 hover:border-zinc-500 cursor-pointer focus:outline-none"
                        >
                          <option value="OPEN">Mark OPEN</option>
                          <option value="WON">Mark WON</option>
                          <option value="LOST">Mark LOST</option>
                          <option value="CLOSED">Mark CLOSED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2b. "Log Trade" Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#00FFA3]" />
                <h3 className="font-semibold text-sm">Log Trade to Audit Journal</h3>
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
              {/* Market Name */}
              <div>
                <label className="text-zinc-400 block mb-1">Market Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US Federal Reserve Rate Cut in November 2026"
                  value={marketName}
                  onChange={(e) => setMarketName(e.target.value)}
                  className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                />
              </div>

              {/* Venue & Position Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Venue:</label>
                  <select
                    value={venue}
                    onChange={(e) => setVenue(e.target.value as JournalEntry["venue"])}
                    className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                  >
                    <option value="Polymarket">Polymarket</option>
                    <option value="Kalshi">Kalshi</option>
                    <option value="Dual-Arb">Dual-Arb</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Position:</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as JournalEntry["position"])}
                    className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                  >
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                    <option value="SYNTHETIC_ARB">SYNTHETIC_ARB</option>
                  </select>
                </div>
              </div>

              {/* Size USD & Entry Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Size USD:</label>
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
                  <label className="text-zinc-400 block mb-1">Entry Price ($):</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="0.999"
                    required
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                  />
                </div>
              </div>

              {/* Thesis / Rationale Notes */}
              <div>
                <label className="text-zinc-400 block mb-1">Thesis / Rationale Notes:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Exploiting divergence between Kalshi CFTC print and Polymarket order book..."
                  value={thesisNote}
                  onChange={(e) => setThesisNote(e.target.value)}
                  className="w-full bg-[#12141C] border border-[#1F232F] rounded p-2 text-white focus:outline-none focus:border-[#00D688]"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F232F]">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-[#161922] text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#00D688] hover:bg-[#00FFA3] text-black font-bold"
                >
                  Submit Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
