"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { INITIAL_MARKET_PAIRS } from "@/lib/mock/market-data";
import { X, TrendingUp, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function RobinhoodHedgeModal() {
  const { activeModal, closeModal, modalContextPairId } = useTerminalStore();
  const [contractsCount, setContractsCount] = useState(500);
  const [isExecuted, setIsExecuted] = useState(false);

  if (activeModal !== "ROBINHOOD_HEDGE") return null;

  const pair =
    INITIAL_MARKET_PAIRS.find((p) => p.id === modalContextPairId) ||
    INITIAL_MARKET_PAIRS[1]; // default NVDA pair

  const ticker = pair.correlatedEquityTicker || "$NVDA-RH";
  const delta = 0.52; // contract delta
  const sharesHedge = Math.round((contractsCount * delta) / 10); // hedge shares
  const stockPriceUsd = ticker === "$NVDA-RH" ? 141.2 : 589.4;

  const handleExecuteHedge = () => {
    setIsExecuted(true);
    setTimeout(() => {
      setIsExecuted(false);
      closeModal();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500/10 border border-amber-500/30">
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                  ROBINHOOD CHAIN L2
                </span>
                <span className="text-zinc-500 text-xs">•</span>
                <span className="text-xs text-zinc-300 font-mono">Arbitrum Nitro</span>
              </div>
              <h3 className="font-semibold text-sm text-white mt-0.5">
                Tokenized Equity Delta-Neutral Hedge
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#12141C] border border-[#1F232F] text-[11px] text-zinc-300 leading-relaxed">
            <span className="text-amber-400 font-semibold">Macro &amp; Equity Correlation: </span>
            This trade links your prediction market contract to Robinhood Chain&apos;s
            on-chain tokenized stock feed (
            <span className="text-white font-bold">{ticker}</span>). By taking an
            offsetting equity position, directional price risk is neutralized while
            harvesting the event mispricing spread.
          </div>

          {/* Target Event Info */}
          <div className="p-3 rounded-lg bg-black border border-[#1F232F] space-y-2">
            <div className="text-[10px] text-zinc-500">CORRELATED EVENT</div>
            <div className="text-white font-semibold text-sm">
              {pair.canonicalTitle}
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
              <span>Tokenized Asset:</span>
              <span className="text-amber-400 font-bold">{ticker}</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Current Stock Price:</span>
              <span className="text-white font-bold">${stockPriceUsd.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Mathematical Hedge Calculator */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between pb-1">
                <span className="text-zinc-400">Prediction Position Size:</span>
                <span className="text-[#00FFA3] font-bold">
                  {contractsCount} YES Contracts
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="100"
                value={contractsCount}
                onChange={(e) => setContractsCount(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Calculated Hedge Position */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#12141C] border border-[#1F232F]">
              <div>
                <div className="text-[10px] text-zinc-500">REQUIRED HEDGE RATIO</div>
                <div className="text-amber-300 font-bold text-sm mt-0.5">
                  SHORT {sharesHedge} Shares
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Δ = {delta.toFixed(2)} sensitivity
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">NET CAPITAL AT RISK</div>
                <div className="text-white font-bold text-sm mt-0.5">
                  ${(sharesHedge * stockPriceUsd).toLocaleString()} USD
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">
                  Delta-Neutral Basis Locked
                </div>
              </div>
            </div>

            {/* EIP-7702 Gasless Smart Account Card */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#00D688]" />
                <div>
                  <div className="text-[11px] font-bold text-white">
                    EIP-7702 Gasless Smart Account
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Gas sponsored by Robinhood Sequencer Paymaster
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00D688] font-mono">
                $0.00 GAS
              </span>
            </div>
          </div>

          {isExecuted && (
            <div className="p-2.5 rounded bg-[#00D688]/15 border border-[#00D688]/40 text-[#00FFA3] text-[11px] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Basis Hedge Submitted: TX 0x8f2d...c391 on Robinhood Chain L2!
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <span className="text-zinc-500 text-[10px]">
            Nitro Rollup Finality: ~250ms
          </span>
          <button
            type="button"
            onClick={handleExecuteHedge}
            disabled={isExecuted}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-amber-400 text-black font-semibold text-xs font-mono hover:bg-amber-300 transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)] disabled:opacity-50"
          >
            <span>Execute Basis Hedge (Gasless)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
