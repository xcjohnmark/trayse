"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { X, TrendingUp, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function RobinhoodHedgeModal() {
  const { activeModal, closeModal, modalContextPairId, marketPairs } = useTerminalStore();
  const [contractsCount, setContractsCount] = useState(1000);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (activeModal !== "ROBINHOOD_HEDGE") return null;

  const pair =
    (modalContextPairId ? marketPairs.find((p) => p.id === modalContextPairId) : null) ||
    marketPairs[0];

  if (!pair) return null;

  const ticker = pair.correlatedEquityTicker || "$NVDA-RH";
  const delta = 0.52; // contract delta
  const sharesHedge = Number(((contractsCount * delta) / 100).toFixed(1)); // Hedge Ratio = (Contracts * Delta) / 100
  const stockPriceUsd = ticker === "$NVDA-RH" ? 141.2 : 589.4;

  const handleExecuteHedge = () => {
    setTxHash("0x8f2d...c391 on Robinhood Chain L2");
    setTimeout(() => {
      setTxHash(null);
      closeModal();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-[#1E2638] bg-[#121722] text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E2638] px-5 py-3.5 bg-[#0F131C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30">
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                  ROBINHOOD CHAIN L2 • DELTA-NEUTRAL BASIS HEDGE
                </span>
              </div>
              <h3 className="font-semibold text-sm text-white mt-1">
                {ticker} Tokenized Equity (Arbitrum Nitro L2)
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs font-mono overflow-y-auto">
          {/* Target Event Info */}
          <div className="p-3.5 rounded-lg bg-[#182030] border border-[#242E44] space-y-1.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
              LINKED PREDICTION MARKET UNDERLYING
            </div>
            <div className="text-white font-semibold text-sm font-sans">
              {pair.canonicalTitle}
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 pt-1.5 border-t border-white/5">
              <span>Tokenized Asset:</span>
              <span className="text-amber-400 font-bold">{ticker}</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Tokenized Equity Price:</span>
              <span className="text-white font-bold">${stockPriceUsd.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Hedging Mathematics Breakdown */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Number of Prediction YES Contracts:</span>
                <span className="text-[#00FFA3] font-bold">
                  {contractsCount.toLocaleString()} Contracts
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={contractsCount}
                onChange={(e) => setContractsCount(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>100 Contracts</span>
                <span>5,000 Contracts</span>
              </div>
            </div>

            {/* Mathematical Formulas Card */}
            <div className="p-3.5 rounded-lg bg-[#182030] border border-[#242E44] space-y-2.5">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#242E44]">
                <span className="text-zinc-400">Delta of Prediction Contract:</span>
                <span className="text-purple-300 font-bold">Δ = +{delta.toFixed(2)}</span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="text-zinc-400">Required Equity Hedge Calculation:</div>
                <div className="p-2 rounded bg-[#0F131C] border border-[#242E44] text-[#00FFA3] font-bold">
                  Hedge Ratio = (Contracts × Delta) / 100 = {sharesHedge} Shares of {ticker}
                </div>
              </div>

              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                Action: SHORT {sharesHedge} {ticker} @ ${stockPriceUsd.toFixed(2)} on Robinhood Chain L2
              </div>

              <div className="text-[10px] text-zinc-400 pt-1 border-t border-[#242E44]">
                Net Basis Profit: Locks in prediction spread while neutralizing stock price movement.
              </div>
            </div>

            {/* EIP-7702 Gasless Smart Account Card */}
            <div className="p-3 rounded-lg bg-[#0F131C] border border-[#00D688]/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#00FFA3]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 font-bold">
                    EIP-7702 SPONSORED TRANSACTION
                  </span>
                </div>
                <span className="text-xs font-bold text-[#00FFA3] font-mono">
                  $0.00 GAS
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Gas Fee: $0.00 (Sponsored by Robinhood Sequencer Paymaster)
              </div>
            </div>
          </div>

          {/* Transaction Hash Confirmation Toast */}
          {txHash && (
            <div className="p-3 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/40 text-[#00FFA3] text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <div>
                <div className="font-bold">Transaction Confirmed!</div>
                <div className="text-[11px] text-zinc-300">{txHash}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#1E2638] px-5 py-3.5 bg-[#0F131C]">
          <span className="text-zinc-500 text-[10px] font-mono">
            Nitro Rollup Finality: ~250ms
          </span>
          <button
            type="button"
            onClick={handleExecuteHedge}
            disabled={!!txHash}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Execute Basis Hedge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
