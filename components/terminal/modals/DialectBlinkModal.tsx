"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { INITIAL_MARKET_PAIRS } from "@/lib/mock/market-data";
import { scanForArbitrage } from "@/lib/market/arbitrage-engine";
import { X, Share2, Check, Zap, CheckCircle2, ArrowRight } from "lucide-react";

export function DialectBlinkModal() {
  const { activeModal, closeModal, modalContextPairId } = useTerminalStore();
  const [copied, setCopied] = useState(false);
  const [customAmount, setCustomAmount] = useState("250");
  const [txConfirmedMsg, setTxConfirmedMsg] = useState<string | null>(null);

  if (activeModal !== "DIALECT_BLINK") return null;

  const pair =
    INITIAL_MARKET_PAIRS.find((p) => p.id === modalContextPairId) ||
    INITIAL_MARKET_PAIRS[0];

  // Retrieve calculated arbitrage details
  const arbs = scanForArbitrage([pair]);
  const arb = arbs[0];

  const effectiveCostStr = arb ? `$${arb.effectiveCost.toFixed(3)}` : "$0.962";
  const roiPercentStr = arb ? `+${arb.roiPercent.toFixed(2)}%` : "+3.95%";
  const spreadBps = arb ? arb.netSpreadBps : pair.divergenceBps;
  const buyYesVenue = arb?.buyVenueYes === "polymarket" ? "Polymarket" : "Kalshi";
  const buyNoVenue = arb?.buyVenueNo === "polymarket" ? "Polymarket" : "Kalshi";

  const blinkUrl = `https://trayse.app/api/actions/arb?pairId=${pair.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(blinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteMockBlink = (amount: string | number) => {
    setTxConfirmedMsg("Transaction Confirmed: Signature 4xK9...9Lq2 on Solana Mainnet");
    setTimeout(() => setTxConfirmedMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/30">
              <Share2 className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">
                Dialect Solana Action &amp; Blink Generator
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                1-Click Social Execution via Twitter/X &amp; Discord
              </p>
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
          {/* Simulated Twitter/X Container */}
          <div className="rounded-xl border border-[#1F232F] bg-black p-4 space-y-3">
            {/* Tweet Author Row */}
            <div className="flex items-center gap-2.5 border-b border-[#1F232F] pb-2.5">
              <div className="h-7 w-7 rounded-full bg-[#12141C] flex items-center justify-center font-bold text-xs text-[#00FFA3] border border-[#00D688]/40">
                T
              </div>
              <div className="leading-tight">
                <div className="font-bold text-white text-xs">Trayse Terminal</div>
                <div className="text-zinc-500 text-[10px]">@trayse_terminal</div>
              </div>
            </div>

            {/* Tweet Copy */}
            <p className="text-zinc-200 text-xs leading-relaxed font-sans">
              🚨 Live Synthetic Arbitrage Detected on Trayse! Buy {buyYesVenue} YES + {buyNoVenue} NO for guaranteed {roiPercentStr} basis return. Execute directly via Solana Action below 👇
            </p>

            {/* Unfurled Action Card */}
            <div className="bg-[#12141C] border border-[#1F232F] rounded-xl overflow-hidden space-y-3 shadow-xl">
              {/* Action Image Banner */}
              <div className="h-28 bg-gradient-to-r from-purple-900/60 via-slate-900 to-[#00D688]/30 p-3.5 flex flex-col justify-between border-b border-[#1F232F]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-[#00FFA3] border border-[#00FFA3]/30 font-bold flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    SOLANA ACTION
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-zinc-300">
                    DIVERGENCE: {spreadBps} BPS
                  </span>
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white truncate drop-shadow-md">
                    {pair.canonicalTitle}
                  </div>
                  <div className="text-[11px] font-mono text-[#00FFA3] font-bold drop-shadow-md mt-0.5">
                    Net Basis Yield: {roiPercentStr}
                  </div>
                </div>
              </div>

              {/* Action Card Text Details */}
              <div className="px-3.5 space-y-1">
                <h4 className="text-sm font-bold text-white font-sans">
                  Trayse Arbitrage: {pair.canonicalTitle}
                </h4>
                <p className="text-[11px] font-mono text-zinc-400">
                  Effective Cost: {effectiveCostStr} | Guaranteed Payout: $1.00 | Net ROI: {roiPercentStr}
                </p>
              </div>

              {/* Action Buttons & Custom Amount Input */}
              <div className="p-3.5 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExecuteMockBlink(100)}
                    className="py-2 rounded-lg bg-[#00D688] hover:bg-[#00FFA3] text-black font-mono font-bold text-xs transition-all shadow-md shadow-[#00FFA3]/10"
                  >
                    Execute Arb ($100)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteMockBlink(500)}
                    className="py-2 rounded-lg bg-[#1A1D28] hover:bg-[#25293A] text-white border border-[#1F232F] font-mono font-semibold text-xs transition-colors"
                  >
                    Execute Arb ($500)
                  </button>
                </div>

                {/* Custom Amount Input + Submit */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      min="10"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Custom Amount"
                      className="w-full bg-[#090A0E] border border-[#1F232F] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00D688]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecuteMockBlink(customAmount)}
                    className="px-4 py-1.5 rounded-lg bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-zinc-200 hover:text-white font-mono text-xs font-semibold transition-colors"
                  >
                    Submit
                  </button>
                </div>

                {/* Interactive Confirmation Box */}
                {txConfirmedMsg && (
                  <div className="p-2.5 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/40 text-[#00FFA3] text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{txConfirmedMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Copyable Action Link */}
          <div className="space-y-1.5 pt-1">
            <span className="text-zinc-400 text-[10px] font-mono uppercase">
              Solana Action Dialect URL:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={blinkUrl}
                className="flex-1 rounded-lg bg-[#12141C] border border-[#1F232F] px-3 py-2 text-zinc-300 font-mono text-xs select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161922] hover:bg-[#1E2230] border border-[#1F232F] text-white font-mono text-xs transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-purple-400" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <span className="text-zinc-500 text-[10px] font-mono">
            Compliant with Solana Actions Specification v1.4 • Dialect Blinks
          </span>
          <button
            type="button"
            onClick={closeModal}
            className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
