"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { INITIAL_MARKET_PAIRS, generateTickUpdate } from "@/lib/mock/market-data";
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
  } = useTerminalStore();

  const [pairs, setPairs] = useState<NormalizedMarketPair[]>(INITIAL_MARKET_PAIRS);
  const [selectedCapital, setSelectedCapital] = useState<{ [pairId: string]: number }>({});
  const [executedOrders, setExecutedOrders] = useState<{ [pairId: string]: boolean }>({});

  // Live order flow tick simulation (every 4s)
  useEffect(() => {
    const interval = setInterval(() => {
      setPairs((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const targetPair = prev[randomIndex];
        const updated = generateTickUpdate(targetPair);
        const next = [...prev];
        next[randomIndex] = updated;
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Compute live arbitrage opportunities via the mathematical engine
  const opportunities = useMemo(() => {
    return scanForArbitrage(pairs);
  }, [pairs]);

  // Aggregate Metrics for Top Banner
  const totalArbCount = opportunities.length;
  const maxRoi = opportunities.length > 0 ? Math.max(...opportunities.map((o) => o.roiPercent)) : 0;
  const totalLiquidityUsd = opportunities.reduce((acc, o) => acc + o.maxCapitalCapacityUsd, 0);

  const avgDaysToExpiry = useMemo(() => {
    if (opportunities.length === 0) return 0;
    const now = Date.now();
    const totalDays = opportunities.reduce((acc, o) => {
      const days = Math.max(1, Math.round((o.expiryTimestamp - now) / (1000 * 3600 * 24)));
      return acc + days;
    }, 0);
    return Math.round(totalDays / opportunities.length);
  }, [opportunities]);

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
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>ACTIVE ARBITRAGE PAIRS</span>
            <Zap className="h-3 w-3 text-[#00FFA3]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#00FFA3] mt-1 flex items-baseline gap-1.5">
            {totalArbCount} Pairs
            <span className="text-[10px] font-normal text-zinc-400">Guaranteed</span>
          </div>
        </div>

        {/* Maximum Live Net ROI */}
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>MAXIMUM LIVE NET ROI</span>
            <Sparkles className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            +{maxRoi.toFixed(2)}% Net
          </div>
        </div>

        {/* Available Arbitrage Liquidity */}
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>AVAILABLE ARB LIQUIDITY</span>
            <Coins className="h-3 w-3 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ${totalLiquidityUsd.toLocaleString()} USD
          </div>
        </div>

        {/* Average Expiry Horizon */}
        <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3">
          <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>AVERAGE EXPIRY HORIZON</span>
            <Clock className="h-3 w-3 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {avgDaysToExpiry} Days
          </div>
        </div>
      </div>

      {/* 2. Radar Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0C0D12] border border-[#1F232F] p-3 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              CROSS-PLATFORM SYNTHETIC ARBITRAGE RADAR
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 font-semibold">
              REAL-TIME SPREAD ENGINE
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Holding YES on Venue A + NO on Venue B guarantees a $1.00 payout at market resolution.
            Net profits locked in immediately after taker fees.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
          <span>FEE MODEL: $0.01 / CONTRACT NORMALIZED</span>
        </div>
      </div>

      {/* 3. Opportunity Card / High-Density Grid */}
      {opportunities.length === 0 ? (
        <div className="rounded-lg border border-[#1F232F] bg-[#090A0E] p-12 text-center text-zinc-500 font-mono">
          Scanning cross-venue CLOB tapes... No synthetic arbitrage currently exceeds the fee threshold.
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const pair = pairs.find((p) => p.id === opp.pairId);
            if (!pair) return null;

            const capital = selectedCapital[opp.pairId] || 250;
            const payoff = calculateArbPositionPayoff(opp, capital);
            const isExecuted = executedOrders[opp.pairId];

            const venueYesLabel = opp.buyVenueYes === "polymarket" ? "Polymarket" : "Kalshi";
            const venueNoLabel = opp.buyVenueNo === "polymarket" ? "Polymarket" : "Kalshi";

            return (
              <div
                key={opp.pairId}
                className="rounded-xl border border-[#1F232F] bg-[#090A0E] hover:border-[#2D3345] transition-all p-4 space-y-4 shadow-xl"
              >
                {/* 3a. Event Title & Category */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-[#1F232F]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-semibold uppercase">
                        {pair.category}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                        {opp.canonicalTitle}
                      </h3>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 mt-1 flex items-center gap-2">
                      <span>EXPIRY: {pair.expiryDateFormatted}</span>
                      <span className="text-zinc-600">•</span>
                      <span>VENUE SPREAD: {opp.netSpreadBps} BPS</span>
                      <span className="text-zinc-600">•</span>
                      <span>MAX CAPACITY: ${opp.maxCapitalCapacityUsd.toLocaleString()} USD</span>
                    </p>
                  </div>

                  {/* Net ROI Pill */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-right">
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase">
                        Net Guaranteed ROI
                      </span>
                      <span className="text-base font-mono font-bold text-[#00FFA3]">
                        +{opp.roiPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3b. Execution Route Box */}
                <div className="rounded-lg border border-[#1F232F] bg-[#0C0D12] p-3 space-y-2">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                    <span>EXECUTION ROUTE SPECIFICATION</span>
                    <span className="text-[#00FFA3] font-semibold">100% OUTCOME COVERAGE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    {/* Leg 1 */}
                    <div className="rounded-md border border-purple-500/20 bg-[#12141C] p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            opp.buyVenueYes === "polymarket" ? "bg-purple-400" : "bg-blue-400"
                          }`}
                        />
                        <span className="font-bold text-zinc-100">
                          Leg 1: BUY YES on {venueYesLabel} @ ${opp.buyPriceYes.toFixed(3)}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {convertOdds(opp.buyPriceYes, oddsFormat)}
                      </span>
                    </div>

                    {/* Leg 2 */}
                    <div className="rounded-md border border-blue-500/20 bg-[#12141C] p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            opp.buyVenueNo === "polymarket" ? "bg-purple-400" : "bg-blue-400"
                          }`}
                        />
                        <span className="font-bold text-zinc-100">
                          Leg 2: BUY NO on {venueNoLabel} @ ${opp.buyPriceNo.toFixed(3)}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {convertOdds(opp.buyPriceNo, oddsFormat)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3c. Financial Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  {/* Effective Cost */}
                  <div className="rounded-lg border border-[#1F232F] bg-[#12141C] p-2.5">
                    <span className="text-[10px] text-zinc-500 block">EFFECTIVE COST</span>
                    <div className="font-bold text-amber-300 text-sm mt-0.5">
                      ${opp.effectiveCost.toFixed(3)}
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      pays ${opp.effectiveCost.toFixed(3)} for guaranteed $1.00
                    </span>
                  </div>

                  {/* Net ROI % */}
                  <div className="rounded-lg border border-[#1F232F] bg-[#12141C] p-2.5">
                    <span className="text-[10px] text-zinc-500 block">NET ROI %</span>
                    <div className="font-bold text-[#00FFA3] text-sm mt-0.5">
                      +{opp.roiPercent.toFixed(2)}%
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      risk-free basis yield
                    </span>
                  </div>

                  {/* Spread */}
                  <div className="rounded-lg border border-[#1F232F] bg-[#12141C] p-2.5">
                    <span className="text-[10px] text-zinc-500 block">NET SPREAD</span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {opp.netSpreadBps} bps
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      gross: {opp.grossSpreadBps} bps
                    </span>
                  </div>

                  {/* Available Size */}
                  <div className="rounded-lg border border-[#1F232F] bg-[#12141C] p-2.5">
                    <span className="text-[10px] text-zinc-500 block">AVAILABLE SIZE</span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      ${opp.maxCapitalCapacityUsd.toLocaleString()} Max
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      top-of-book depth
                    </span>
                  </div>
                </div>

                {/* Sizing & Profit Calculator Strip */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0C0D12] border border-[#1F232F] p-3 rounded-lg font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-400">ALLOCATE CAPITAL:</span>
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
                              : "bg-[#12141C] text-zinc-300 border-[#1F232F] hover:text-white"
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
                      <span className="text-[10px] text-zinc-500 block">CONTRACTS ACQUIRED</span>
                      <span className="font-bold text-white">{payoff.sharesAcquired} Pairs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">NET PROFIT AT RESOLUTION</span>
                      <span className="font-bold text-[#00FFA3]">
                        +${payoff.netProfitUsd.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3d. Execution Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1F232F]">
                  <div className="flex items-center gap-2">
                    {/* Button 1: Execute via Session Key */}
                    <button
                      type="button"
                      onClick={() => handleExecuteSessionKey(opp, pair)}
                      disabled={isExecuted}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        isExecuted
                          ? "bg-emerald-500 text-black"
                          : "bg-[#00FFA3] hover:bg-[#00D688] text-black shadow-lg shadow-[#00FFA3]/10"
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-[#00FFA3] text-xs font-mono transition-colors"
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono transition-colors"
                        title="Delta-neutral basis hedge on Robinhood Chain L2"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                        <span>Robinhood Delta Hedge ({pair.correlatedEquityTicker})</span>
                      </button>
                    )}
                  </div>

                  {/* Secondary Inspect Depth Action */}
                  <button
                    type="button"
                    onClick={() => setSelectedPairId(opp.pairId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-zinc-300 hover:text-white text-xs font-mono transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5 text-purple-400" />
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
