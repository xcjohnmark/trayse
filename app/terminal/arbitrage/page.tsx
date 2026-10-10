"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { scanForArbitrage, calculateArbPositionPayoff } from "@/lib/market/arbitrage-engine";
import { convertOdds } from "@/lib/market/normalization";
import { NormalizedMarketPair, ArbitrageOpportunity } from "@/lib/types/terminal";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Share2,
  Clock,
  Layers,
  Sparkles,
  Calculator,
  CheckCircle2,
  Coins,
  Bot,
  TrendingUp,
} from "lucide-react";

export default function ArbitrageScannerPage() {
  const {
    openModal,
    setSelectedPairId,
    sessionKey,
    addJournalEntry,
    oddsFormat,
    marketPairs,
    loadLiveMarkets,
  } = useTerminalStore();

  const [selectedCapital, setSelectedCapital] = useState<{ [pairId: string]: number }>({});
  const [executedOrders, setExecutedOrders] = useState<{ [pairId: string]: boolean }>({});

  useEffect(() => {
    if (marketPairs.length === 0) {
      loadLiveMarkets("ALL");
    }
  }, [marketPairs.length, loadLiveMarkets]);

  // Compute live arbitrage opportunities via the mathematical engine from genuine pairs
  const opportunities = useMemo(() => {
    return scanForArbitrage(marketPairs);
  }, [marketPairs]);

  // Aggregate Metrics for Top Banner
  const totalArbCount = opportunities.length;
  const maxRoi = opportunities.length > 0 ? Math.max(...opportunities.map((o) => o.roiPercent)) : 0;
  const totalLiquidityUsd = opportunities.reduce((acc, o) => acc + o.maxCapitalCapacityUsd, 0);

  const [renderTimestamp] = useState(() => Date.now());

  const avgDaysToExpiry = useMemo(() => {
    if (opportunities.length === 0) return 0;
    const totalDays = opportunities.reduce((acc, o) => {
      const days = Math.max(1, Math.round((o.expiryTimestamp - renderTimestamp) / (1000 * 3600 * 24)));
      return acc + days;
    }, 0);
    return Math.round(totalDays / opportunities.length);
  }, [opportunities, renderTimestamp]);

  const handleExecuteSessionKey = (opp: ArbitrageOpportunity, pair: NormalizedMarketPair) => {
    if (!sessionKey.isAuthorized) {
      openModal("SESSION_KEYS", opp.pairId);
      return;
    }

    const capital = selectedCapital[opp.pairId] || 250;
    const payoff = calculateArbPositionPayoff(opp, capital);

    // Log the trade directly to the non-custodial persistent trade journal
    addJournalEntry({
      pairId: opp.pairId,
      marketTitle: opp.canonicalTitle,
      venue: "Dual-Arb",
      position: "SYNTHETIC_ARB",
      entryPrice: opp.effectiveCost,
      sizeUsd: capital,
      status: "OPEN",
      pnlUsd: payoff.netProfitUsd,
      thesis: `Executed via Swig Session Key (${sessionKey.publicKey}): Buy YES on ${opp.buyVenueYes} ($${opp.buyPriceYes}) + Buy NO on ${opp.buyVenueNo} ($${opp.buyPriceNo}). Effective cost $${opp.effectiveCost} locks in guaranteed +${opp.roiPercent}% net yield.`,
    });

    setExecutedOrders((prev) => ({ ...prev, [opp.pairId]: true }));
    setTimeout(() => {
      setExecutedOrders((prev) => ({ ...prev, [opp.pairId]: false }));
    }, 3500);
  };

  return (
    <div className="flex flex-col h-full space-y-4 font-sans select-none overflow-y-auto pr-1">
      {/* 1. Top Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Active Arbitrage Pairs */}
        <div className="rounded-xl border border-[#1E2638] bg-[#121722] p-3.5 shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>ACTIVE ARBITRAGE PAIRS</span>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 flex items-baseline gap-1.5">
            {totalArbCount} Pairs
            <span className="text-[10px] font-normal text-slate-400">Guaranteed</span>
          </div>
        </div>

        {/* Maximum Live Net ROI */}
        <div className="rounded-xl border border-[#1E2638] bg-[#121722] p-3.5 shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>MAXIMUM LIVE NET ROI</span>
            <Sparkles className="h-3.5 w-3.5 text-[#00FFA3]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#00FFA3] mt-1">
            +{maxRoi.toFixed(2)}% Net
          </div>
        </div>

        {/* Available Arbitrage Liquidity */}
        <div className="rounded-xl border border-[#1E2638] bg-[#121722] p-3.5 shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>AVAILABLE ARB LIQUIDITY</span>
            <Coins className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ${totalLiquidityUsd.toLocaleString()} USD
          </div>
        </div>

        {/* Average Expiry Horizon */}
        <div className="rounded-xl border border-[#1E2638] bg-[#121722] p-3.5 shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>AVERAGE EXPIRY HORIZON</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {avgDaysToExpiry} Days
          </div>
        </div>
      </div>

      {/* 2. Radar Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121722] border border-[#1E2638] p-4 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              CROSS-PLATFORM SYNTHETIC ARBITRAGE RADAR
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/40 font-semibold">
              REAL-TIME SPREAD ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Holding YES on Venue A + NO on Venue B guarantees a $1.00 payout at market resolution.
            Net profits locked in immediately after taker fees.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="h-2 w-2 rounded-full bg-[#00D688] animate-pulse" />
          <span>FEE MODEL: $0.01 / CONTRACT NORMALIZED</span>
        </div>
      </div>

      {/* 3. Opportunity Card / High-Density Grid */}
      {opportunities.length === 0 ? (
        <div className="rounded-xl border border-[#1E2638] bg-[#121722] p-12 text-center text-slate-400 font-mono">
          Scanning live order books... No synthetic arbitrage currently exceeds the fee threshold.
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const pair = marketPairs.find((p) => p.id === opp.pairId);
            if (!pair) return null;

            const capital = selectedCapital[opp.pairId] || 250;
            const payoff = calculateArbPositionPayoff(opp, capital);
            const isExecuted = executedOrders[opp.pairId];

            const venueYesLabel = opp.buyVenueYes === "polymarket" ? "Polymarket" : "Kalshi";
            const venueNoLabel = opp.buyVenueNo === "polymarket" ? "Polymarket" : "Kalshi";

            return (
              <div
                key={opp.pairId}
                className="rounded-xl border border-[#1E2638] hover:border-[#2E3C57] bg-[#121722] hover:bg-[#151B27] transition-all p-4 space-y-4 shadow-xl shadow-black/30"
              >
                {/* 3a. Event Title & Category */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-[#1E2638]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182030] border border-[#242E44] text-[#94A3B8] font-semibold uppercase">
                        {pair.category}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-white">
                        {opp.canonicalTitle}
                      </h3>
                    </div>
                    <p className="text-[11px] font-mono text-[#94A3B8] mt-1 flex items-center gap-2">
                      <span>EXPIRY: {pair.expiryDateFormatted}</span>
                      <span className="text-[#334155]">•</span>
                      <span>VENUE SPREAD: {opp.netSpreadBps} BPS</span>
                      <span className="text-[#334155]">•</span>
                      <span>MAX CAPACITY: ${opp.maxCapitalCapacityUsd.toLocaleString()} USD</span>
                    </p>
                  </div>

                  {/* Net ROI Pill */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-[#00D688]/10 border border-[#00D688]/30 text-right">
                      <span className="text-[9px] font-mono text-[#94A3B8] block uppercase">
                        Net Guaranteed ROI
                      </span>
                      <span className="text-base font-mono font-bold text-[#00FFA3]">
                        +{opp.roiPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3b. Execution Route Box */}
                <div className="rounded-lg border border-[#1E2638] bg-[#0B0E14] p-3 space-y-2">
                  <div className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
                    <span>EXECUTION ROUTE SPECIFICATION</span>
                    <span className="text-[#00FFA3] font-semibold">100% OUTCOME COVERAGE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    {/* Leg 1 */}
                    <div className="rounded-md border border-[#00D688]/30 bg-[#00D688]/10 p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#00FFA3]" />
                        <span className="font-bold text-white">
                          Leg 1: BUY YES on {venueYesLabel} @ ${opp.buyPriceYes.toFixed(3)}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">
                        {convertOdds(opp.buyPriceYes, oddsFormat)}
                      </span>
                    </div>

                    {/* Leg 2 */}
                    <div className="rounded-md border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#F43F5E]" />
                        <span className="font-bold text-white">
                          Leg 2: BUY NO on {venueNoLabel} @ ${opp.buyPriceNo.toFixed(3)}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">
                        {convertOdds(opp.buyPriceNo, oddsFormat)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3c. Financial Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  {/* Effective Cost */}
                  <div className="rounded-lg border border-[#242E44] bg-[#182030] p-2.5">
                    <span className="text-[10px] text-[#94A3B8] block">EFFECTIVE COST</span>
                    <div className="font-bold text-[#F59E0B] text-sm mt-0.5">
                      ${opp.effectiveCost.toFixed(3)}
                    </div>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      pays ${opp.effectiveCost.toFixed(3)} for guaranteed $1.00
                    </span>
                  </div>

                  {/* Net ROI % */}
                  <div className="rounded-lg border border-[#242E44] bg-[#182030] p-2.5">
                    <span className="text-[10px] text-[#94A3B8] block">NET ROI %</span>
                    <div className="font-bold text-[#00FFA3] text-sm mt-0.5">
                      +{opp.roiPercent.toFixed(2)}%
                    </div>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      risk-free basis yield
                    </span>
                  </div>

                  {/* Spread */}
                  <div className="rounded-lg border border-[#242E44] bg-[#182030] p-2.5">
                    <span className="text-[10px] text-[#94A3B8] block">NET SPREAD</span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {opp.netSpreadBps} bps
                    </div>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      gross: {opp.grossSpreadBps} bps
                    </span>
                  </div>

                  {/* Available Size */}
                  <div className="rounded-lg border border-[#242E44] bg-[#182030] p-2.5">
                    <span className="text-[10px] text-[#94A3B8] block">AVAILABLE SIZE</span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      ${opp.maxCapitalCapacityUsd.toLocaleString()} Max
                    </div>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">
                      top-of-book depth
                    </span>
                  </div>
                </div>

                {/* Sizing & Profit Calculator Strip */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F131C] border border-[#1E2638] p-3 rounded-lg font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-4 w-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8]">ALLOCATE CAPITAL:</span>
                    <div className="flex items-center gap-1.5">
                      {[100, 250, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() =>
                            setSelectedCapital((prev) => ({ ...prev, [opp.pairId]: amt }))
                          }
                          className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                            capital === amt
                              ? "bg-white text-black font-bold border-white"
                              : "bg-[#182030] text-[#94A3B8] border-[#242E44] hover:text-white hover:bg-[#202B3E]"
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Payoff */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-[#94A3B8] block">CONTRACTS ACQUIRED</span>
                      <span className="font-bold text-white">{payoff.sharesAcquired} Pairs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#94A3B8] block">NET PROFIT AT RESOLUTION</span>
                      <span className="font-bold text-[#00FFA3]">
                        +${payoff.netProfitUsd.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3d. Execution Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E2638]">
                  <div className="flex items-center gap-2">
                    {/* Button 1: Execute via Session Key */}
                    <button
                      type="button"
                      onClick={() => handleExecuteSessionKey(opp, pair)}
                      disabled={isExecuted}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        isExecuted
                          ? "bg-[#00D688] text-black"
                          : "bg-[#00FFA3] hover:bg-[#00D688] text-black shadow-lg shadow-[#00FFA3]/15 active:scale-[0.98]"
                      }`}
                    >
                      {isExecuted ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Logged to Trade Journal!</span>
                        </>
                      ) : (
                        <>
                          <Bot className="h-3.5 w-3.5" />
                          <span>
                            {sessionKey.isAuthorized
                              ? `Execute via Session Key ($${capital})`
                              : "Execute via Session Key"}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Button 2: Share Solana Blink */}
                    <button
                      type="button"
                      onClick={() => openModal("DIALECT_BLINK", opp.pairId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-[#00FFA3] text-xs font-mono transition-colors"
                      title="Generate Solana Dialect Action Blink card"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share Solana Blink</span>
                    </button>

                    {/* Button 3: Robinhood Delta Hedge (if linked equity) */}
                    {pair.correlatedEquityTicker && (
                      <button
                        type="button"
                        onClick={() => openModal("ROBINHOOD_HEDGE", opp.pairId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-mono transition-colors"
                        title="Delta-neutral basis hedge on Robinhood Chain L2"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-[#F59E0B]" />
                        <span>Robinhood Delta Hedge ({pair.correlatedEquityTicker})</span>
                      </button>
                    )}
                  </div>

                  {/* Secondary Inspect Depth Action */}
                  <button
                    type="button"
                    onClick={() => setSelectedPairId(opp.pairId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-[#CBD5E1] hover:text-white text-xs font-mono transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5 text-[#A78BFA]" />
                    <span>Inspect Depth</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
