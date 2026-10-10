"use client";

import React, { useState } from "react";
import { OddsFormat } from "@/lib/types/terminal";
import { convertOdds } from "@/lib/market/normalization";
import { Check, ArrowRight, Loader2 } from "lucide-react";

interface MarketOrderSlipProps {
  marketTitle: string;
  submarketTitle?: string;
  currentYesPrice: number;
  currentNoPrice: number;
  oddsFormat: OddsFormat;
  venue: "polymarket" | "kalshi";
  userBalanceUsd: number;
  onExecuteTrade: (params: {
    outcome: "YES" | "NO";
    orderType: "MARKET" | "LIMIT";
    action: "BUY" | "SELL";
    amountUsd: number;
    limitPrice?: number;
    slippage: number;
  }) => void;
}

export function MarketOrderSlip({
  marketTitle,
  submarketTitle,
  currentYesPrice,
  currentNoPrice,
  oddsFormat,
  venue,
  userBalanceUsd,
  onExecuteTrade,
}: MarketOrderSlipProps) {
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO">("YES");
  const [amountUsd, setAmountUsd] = useState<number>(100);
  const [limitPriceCents, setLimitPriceCents] = useState<number>(
    Math.round((selectedOutcome === "YES" ? currentYesPrice : currentNoPrice) * 100)
  );
  const [slippage, setSlippage] = useState<number>(1.0); // 1.0%
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executedSuccess, setExecutedSuccess] = useState<boolean>(false);

  const activePrice = selectedOutcome === "YES" ? currentYesPrice : currentNoPrice;
  const executionPrice = orderType === "LIMIT" ? limitPriceCents / 100 : activePrice;

  // Financial calculations
  const estimatedContracts = Math.floor(amountUsd / Math.max(0.01, executionPrice));
  const potentialPayout = estimatedContracts * 1.0;
  const potentialProfit = Math.max(0, potentialPayout - amountUsd);
  const returnMultiplier = (1 / Math.max(0.01, executionPrice)).toFixed(2);
  const roiPct = Math.round(((1 / Math.max(0.01, executionPrice)) - 1) * 100);

  const handleQuickAdd = (delta: number) => {
    setAmountUsd((prev) => Math.min(10000, Math.max(5, prev + delta)));
  };

  const handleSubmit = () => {
    if (amountUsd <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onExecuteTrade({
        outcome: selectedOutcome,
        orderType,
        action,
        amountUsd,
        limitPrice: orderType === "LIMIT" ? limitPriceCents / 100 : undefined,
        slippage,
      });
      setIsSubmitting(false);
      setExecutedSuccess(true);
      setTimeout(() => setExecutedSuccess(false), 2500);
    }, 350);
  };

  return (
    <div className="flex flex-col h-full bg-[#121722] rounded-xl border border-[#1E2638] p-4 space-y-4 font-mono select-none shadow-xl shadow-black/20">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
        <div className="space-y-0.5 min-w-0">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Order Slip
          </span>
          <span className="text-[11px] text-[#94A3B8] truncate block">
            {submarketTitle || marketTitle}
          </span>
        </div>

        {/* Action Toggle (BUY / SELL) */}
        <div className="flex items-center p-0.5 rounded bg-[#182030] border border-[#242E44] text-xs">
          <button
            type="button"
            onClick={() => setAction("BUY")}
            className={`px-3 py-1 rounded transition-all font-bold ${
              action === "BUY"
                ? "bg-white text-black shadow-sm"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setAction("SELL")}
            className={`px-3 py-1 rounded transition-all font-bold ${
              action === "SELL"
                ? "bg-white text-black shadow-sm"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* 2. Order Type Toggle (Market vs Limit) */}
      <div className="grid grid-cols-2 gap-1.5 p-0.5 rounded-lg bg-[#0F131C] border border-[#1E2638] text-xs text-center">
        <button
          type="button"
          onClick={() => setOrderType("MARKET")}
          className={`py-1.5 rounded-md transition-all font-semibold ${
            orderType === "MARKET"
              ? "bg-[#182030] text-white border border-[#242E44]"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          Market Order
        </button>
        <button
          type="button"
          onClick={() => setOrderType("LIMIT")}
          className={`py-1.5 rounded-md transition-all font-semibold ${
            orderType === "LIMIT"
              ? "bg-[#182030] text-white border border-[#242E44]"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          Limit Order
        </button>
      </div>

      {/* 3. Outcome Buttons (YES vs NO) */}
      <div className="grid grid-cols-2 gap-2">
        {/* BUY YES */}
        <button
          type="button"
          onClick={() => {
            setSelectedOutcome("YES");
            setLimitPriceCents(Math.round(currentYesPrice * 100));
          }}
          className={`py-3 px-3 rounded-xl border text-center transition-all ${
            selectedOutcome === "YES"
              ? "bg-[#00D688]/15 border-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.15)] text-white"
              : "bg-[#182030] border-[#242E44] text-[#94A3B8] hover:border-[#2E3C57]"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#00FFA3]">
            YES
          </div>
          <div className="text-base font-extrabold text-white mt-0.5 tabular-nums">
            {convertOdds(currentYesPrice, oddsFormat)}
          </div>
        </button>

        {/* BUY NO */}
        <button
          type="button"
          onClick={() => {
            setSelectedOutcome("NO");
            setLimitPriceCents(Math.round(currentNoPrice * 100));
          }}
          className={`py-3 px-3 rounded-xl border text-center transition-all ${
            selectedOutcome === "NO"
              ? "bg-[#F43F5E]/15 border-[#F43F5E] shadow-[0_0_15px_rgba(244,63,94,0.15)] text-white"
              : "bg-[#182030] border-[#242E44] text-[#94A3B8] hover:border-[#2E3C57]"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#F43F5E]">
            NO
          </div>
          <div className="text-base font-extrabold text-white mt-0.5 tabular-nums">
            {convertOdds(currentNoPrice, oddsFormat)}
          </div>
        </button>
      </div>

      {/* 4. Limit Price Input (if Limit order) */}
      {orderType === "LIMIT" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Limit Price</span>
            <span>Current: {Math.round(activePrice * 100)}¢</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={limitPriceCents}
              onChange={(e) => setLimitPriceCents(Number(e.target.value))}
              min={1}
              max={99}
              step={0.5}
              className="w-full bg-[#0F131C] border border-[#242E44] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#38BDF8] tabular-nums"
            />
            <span className="absolute right-3 top-2 text-[#94A3B8] text-xs">¢</span>
          </div>
        </div>
      )}

      {/* 5. USD Amount Input & Quick Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Order Amount</span>
          <span className="text-[#94A3B8]">
            Balance: <span className="text-white font-semibold">${userBalanceUsd.toFixed(2)}</span>
          </span>
        </div>

        <div className="relative">
          <input
            type="number"
            value={amountUsd}
            onChange={(e) => setAmountUsd(Math.max(0, Number(e.target.value)))}
            min={1}
            max={userBalanceUsd}
            className="w-full bg-[#0F131C] border border-[#242E44] rounded-lg pl-6 pr-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-[#38BDF8] tabular-nums"
          />
          <span className="absolute left-3 top-2 text-[#94A3B8] text-sm">$</span>
        </div>

        {/* Quick Amount Pills */}
        <div className="grid grid-cols-5 gap-1.5 pt-0.5">
          {action === "BUY" ? (
            <>
              <button
                type="button"
                onClick={() => handleQuickAdd(10)}
                className="py-1 rounded bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-xs text-[#CBD5E1] font-medium"
              >
                +$10
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(50)}
                className="py-1 rounded bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-xs text-[#CBD5E1] font-medium"
              >
                +$50
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(100)}
                className="py-1 rounded bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-xs text-[#CBD5E1] font-medium"
              >
                +$100
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(250)}
                className="py-1 rounded bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-xs text-[#CBD5E1] font-medium"
              >
                +$250
              </button>
              <button
                type="button"
                onClick={() => setAmountUsd(Math.min(userBalanceUsd, 1000))}
                className="py-1 rounded bg-[#242E44] hover:bg-[#2E3C57] border border-[#3B82F6]/40 text-xs text-white font-bold"
              >
                Max
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAmountUsd(Math.round(userBalanceUsd * 0.25))}
                className="py-1 rounded bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-xs text-[#CBD5E1] font-medium"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => setAmountUsd(Math.round(userBalanceUsd * 0.5))}
                className="py-1 rounded bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-xs text-[#CBD5E1] font-medium"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setAmountUsd(Math.round(userBalanceUsd * 0.75))}
                className="py-1 rounded bg-[#182030] hover:bg-[#202B3E] border border-[#242E44] text-xs text-[#CBD5E1] font-medium"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setAmountUsd(userBalanceUsd)}
                className="col-span-2 py-1 rounded bg-[#242E44] hover:bg-[#2E3C57] border border-[#3B82F6]/40 text-xs text-white font-bold"
              >
                100%
              </button>
            </>
          )}
        </div>
      </div>

      {/* 6. Slippage Tolerance Selector */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1E2638]">
        <span className="text-[#94A3B8]">Slippage Tolerance</span>
        <div className="flex items-center gap-1">
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlippage(s)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                slippage === s
                  ? "bg-white/20 text-white"
                  : "text-[#64748B] hover:text-white"
              }`}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* 7. Payoff & Return Breakdown */}
      <div className="rounded-lg bg-[#0F131C] border border-[#1E2638] p-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[#94A3B8]">
          <span>Est. Shares</span>
          <span className="text-white font-semibold tabular-nums">
            {estimatedContracts.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#94A3B8]">
          <span>Resolution Payout</span>
          <span className="text-[#00FFA3] font-semibold tabular-nums">
            ${potentialPayout.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#94A3B8]">
          <span>Potential Profit</span>
          <span className="text-[#00FFA3] font-bold tabular-nums">
            +${potentialProfit.toFixed(2)} ({roiPct > 0 ? `+${roiPct}%` : "0%"})
          </span>
        </div>

        <div className="flex items-center justify-between text-[#94A3B8] pt-1 border-t border-[#1E2638]">
          <span>Return Multiple</span>
          <span className="text-white font-bold tabular-nums">
            {returnMultiplier}x
          </span>
        </div>
      </div>

      {/* 8. Big Tactile CTA Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || amountUsd <= 0}
        className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] ${
          executedSuccess
            ? "bg-[#00D688] text-black shadow-[#00FFA3]/25"
            : selectedOutcome === "YES"
            ? "bg-[#00FFA3] hover:bg-[#00D688] text-black shadow-[#00FFA3]/20"
            : "bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-[#F43F5E]/20"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Executing...</span>
          </>
        ) : executedSuccess ? (
          <>
            <Check className="w-4 h-4" />
            <span>Order Executed!</span>
          </>
        ) : (
          <>
            <span>
              {action} {selectedOutcome} • ${amountUsd.toFixed(2)}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
