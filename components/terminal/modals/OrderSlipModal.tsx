"use client";

import React, { useState, useMemo } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { INITIAL_MARKET_PAIRS } from "@/lib/mock/market-data";
import {
  X,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

export function OrderSlipModal() {
  const {
    activeModal,
    orderSlipContext,
    closeModal,
    openModal,
    setSelectedPairId,
    isDemoMode,
    demoBalanceUsd,
    adjustDemoBalance,
    addJournalEntry,
    polymarketConnected,
  } = useTerminalStore();

  const [activeTab, setActiveTab] = useState<"ORDER" | "CROSS_VENUE">("ORDER");
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmountStr, setCustomAmountStr] = useState<string>("50");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Find target market pair
  const pair = useMemo(() => {
    if (!orderSlipContext) return null;
    return INITIAL_MARKET_PAIRS.find((p) => p.id === orderSlipContext.pairId) || null;
  }, [orderSlipContext]);

  if (activeModal !== "ORDER_SLIP" || !orderSlipContext || !pair) return null;

  const outcome = orderSlipContext.outcome;
  const isYes = outcome === "YES";

  // Price calculation
  const sharePrice = isYes ? pair.polymarket.yesPrice : pair.polymarket.noPrice;
  const kalshiSharePrice = isYes ? pair.kalshi.yesPrice : pair.kalshi.noPrice;

  const tradeAmount = Number(customAmountStr) > 0 ? Number(customAmountStr) : selectedAmount;
  const sharesReceived = sharePrice > 0 ? Math.floor(tradeAmount / sharePrice) : 0;
  const maxPayout = sharesReceived * 1.0;
  const potentialProfit = Math.max(0, maxPayout - tradeAmount);
  const potentialRoiPercent = tradeAmount > 0 ? (potentialProfit / tradeAmount) * 100 : 0;

  // Cross-market spread
  const priceDifference = Math.abs(sharePrice - kalshiSharePrice);
  const spreadBps = Math.round(priceDifference * 10000);

  const handleAmountPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmountStr(amt.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmountStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setSelectedAmount(num);
    }
  };

  const handleExecuteTrade = () => {
    if (tradeAmount <= 0) return;

    if (isDemoMode && tradeAmount > demoBalanceUsd) {
      alert("Insufficient demo balance! Please reset your demo funds in Connect Accounts.");
      return;
    }

    setIsExecuting(true);

    setTimeout(() => {
      // 1. If in demo mode, adjust balance
      if (isDemoMode) {
        adjustDemoBalance(-tradeAmount);
      }

      // 2. Automatically log to Trade Journal
      addJournalEntry({
        pairId: pair.id,
        marketTitle: pair.canonicalTitle,
        venue: "Polymarket",
        position: outcome,
        entryPrice: sharePrice,
        sizeUsd: tradeAmount,
        status: "OPEN",
        pnlUsd: 0,
        thesis: `${isDemoMode ? "[Demo Order]" : "[Polymarket Live Order]"} Executed ${outcome} @ $${sharePrice.toFixed(2)} (${sharesReceived} contracts). Potential payout $${maxPayout.toFixed(2)}.`,
      });

      setIsExecuting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        closeModal();
      }, 1400);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-xl bg-[#0B0C10] border border-[#1F232F] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F232F] bg-[#12141C]">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider ${
                isYes
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              }`}
            >
              BUY {outcome}
            </span>
            <div className="max-w-[320px] truncate">
              <h2 className="text-sm font-semibold text-white truncate">
                {pair.canonicalTitle}
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono">
                Polymarket CLOB • Resolves {pair.expiryDateFormatted}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Toggle: Order Slip vs Cross-Venue Intel */}
        <div className="flex border-b border-[#1F232F] bg-[#090A0E] px-4 pt-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("ORDER")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "ORDER"
                ? "border-[#00D688] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Order Execution Slip
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CROSS_VENUE")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "CROSS_VENUE"
                ? "border-[#00D688] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Kalshi Comparison</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-blue-500/20 text-blue-300">
              {spreadBps} bps
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === "ORDER" ? (
            <div className="space-y-4">
              {/* Current Price Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12141C] border border-[#1F232F]">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Execution Price:
                  </span>
                  <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1.5">
                    <span>${sharePrice.toFixed(2)}</span>
                    <span className="text-xs font-normal text-zinc-400">
                      ({Math.round(sharePrice * 100)}¢ / contract)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Execution Venue:
                  </span>
                  <div className="text-xs font-bold font-mono text-[#00FFA3] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3]" />
                    <span>Polymarket CTF</span>
                  </div>
                </div>
              </div>

              {/* Amount Presets */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-zinc-300">
                  Select Order Size (USD):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountPreset(amt)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                        selectedAmount === amt
                          ? "bg-[#00D688] text-black border-[#00D688] shadow-md shadow-[#00D688]/20"
                          : "bg-[#12141C] text-zinc-300 border-[#1F232F] hover:bg-white/5"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={customAmountStr}
                    onChange={handleCustomChange}
                    placeholder="Custom amount..."
                    className="w-full bg-[#090A0E] border border-[#1F232F] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00D688] font-mono"
                  />
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="rounded-xl bg-[#12141C] border border-[#1F232F] p-3.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Contracts to Receive:</span>
                  <span className="text-white font-bold">
                    {sharesReceived.toLocaleString()} Shares
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Max Payout ($1.00/contract):</span>
                  <span className="text-white font-bold">
                    ${maxPayout.toFixed(2)} USD
                  </span>
                </div>
                <div className="border-t border-[#1F232F] pt-2 flex justify-between text-zinc-300 font-semibold">
                  <span>Potential Net Profit:</span>
                  <span className="text-[#00FFA3]">
                    +${potentialProfit.toFixed(2)} (+{potentialRoiPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Execution Mode Notice */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span>
                  Mode:{" "}
                  <strong className={isDemoMode ? "text-amber-400" : "text-[#00FFA3]"}>
                    {isDemoMode ? "Demo Sandbox" : "Polymarket Live"}
                  </strong>
                </span>
                {isDemoMode && (
                  <span className="font-mono">
                    Balance: ${demoBalanceUsd.toFixed(2)} USD
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleExecuteTrade}
                disabled={isExecuting || tradeAmount <= 0}
                className={`w-full py-3 rounded-xl font-bold font-mono text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                  isSuccess
                    ? "bg-[#00D688] text-black"
                    : isYes
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                    : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Order Filled Successfully!</span>
                  </>
                ) : isExecuting ? (
                  <span>Submitting Order...</span>
                ) : (
                  <>
                    <span>
                      {isDemoMode ? "Place Demo Order" : "Place Order"} • ${tradeAmount}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Cross-Venue Tab */
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#12141C] border border-[#1F232F] space-y-3">
                <div className="text-zinc-400 text-[11px] flex items-center justify-between">
                  <span>VENUE PRICE COMPARISON</span>
                  <span className="text-[#00FFA3]">{spreadBps} bps spread</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-black/60 border border-blue-500/30">
                    <span className="text-[10px] text-zinc-400 block">Polymarket {outcome}:</span>
                    <span className="text-lg font-bold text-white">
                      ${sharePrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/30">
                    <span className="text-[10px] text-zinc-400 block">Kalshi {outcome}:</span>
                    <span className="text-lg font-bold text-white">
                      ${kalshiSharePrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white/5 border border-white/10 text-[11px] text-zinc-300 leading-relaxed">
                  {sharePrice < kalshiSharePrice ? (
                    <p>
                      💡 Polymarket offers a cheaper entry by{" "}
                      <span className="text-[#00FFA3] font-bold">
                        ${(kalshiSharePrice - sharePrice).toFixed(2)}
                      </span>
                      . Buying on Polymarket gives you a higher potential return.
                    </p>
                  ) : sharePrice > kalshiSharePrice ? (
                    <p>
                      💡 Kalshi is currently cheaper by{" "}
                      <span className="text-[#00FFA3] font-bold">
                        ${(sharePrice - kalshiSharePrice).toFixed(2)}
                      </span>
                      . Consider checking the Arbitrage Radar for cross-venue opportunities.
                    </p>
                  ) : (
                    <p>Prices are currently in sync across Polymarket and Kalshi.</p>
                  )}
                </div>
              </div>

              {/* Quick Link to Depth Ladder */}
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  setSelectedPairId(pair.id);
                }}
                className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <Layers className="h-3.5 w-3.5 text-blue-400" />
                <span>Open Full Split-Screen Depth Ladder</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
