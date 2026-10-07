"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { INITIAL_MARKET_PAIRS } from "@/lib/mock/market-data";
import { X, Share2, Check, Zap, ArrowUpRight } from "lucide-react";

export function DialectBlinkModal() {
  const { activeModal, closeModal, modalContextPairId } = useTerminalStore();
  const [copied, setCopied] = useState(false);
  const [txConfirmed, setTxConfirmed] = useState(false);

  if (activeModal !== "DIALECT_BLINK") return null;

  const pair =
    INITIAL_MARKET_PAIRS.find((p) => p.id === modalContextPairId) ||
    INITIAL_MARKET_PAIRS[0];

  const blinkUrl = `https://trayse.app/api/actions/arb?pairId=${pair.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(blinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteMockBlink = () => {
    setTxConfirmed(true);
    setTimeout(() => setTxConfirmed(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-purple-500/10 border border-purple-500/30">
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
            className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            This generates an interactive **Solana Action (Blink)**. When shared on
            Twitter/X or Dialect-compatible clients, this link unfurls into an
            interactive card allowing any follower to execute this arbitrage opportunity with 1 click.
          </p>

          {/* Interactive Twitter/X Card Preview */}
          <div className="rounded-xl border border-[#1F232F] bg-black p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1F232F] pb-2">
              <div className="h-6 w-6 rounded-full bg-[#12141C] flex items-center justify-center font-bold text-[10px] text-[#00FFA3] border border-[#00D688]/30">
                T
              </div>
              <div className="text-[11px]">
                <span className="font-bold text-white">Trayse Terminal</span>
                <span className="text-zinc-500 ml-1">@trayse_terminal</span>
              </div>
            </div>

            {/* Unfurled Blink Card */}
            <div className="rounded-lg border border-[#00D688]/30 bg-[#12141C] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D688]/20 text-[#00FFA3]">
                  ACTIONABLE ARBITRAGE
                </span>
                <span className="text-[10px] text-zinc-400">
                  {pair.expiryDateFormatted}
                </span>
              </div>

              <div className="font-semibold text-sm text-white">
                {pair.canonicalTitle}
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 rounded bg-black/60 border border-white/5 text-[11px]">
                <div>
                  <span className="text-zinc-500">Effective Cost:</span>
                  <div className="text-white font-bold">$0.943 USD</div>
                </div>
                <div>
                  <span className="text-zinc-500">Net Basis ROI:</span>
                  <div className="text-[#00FFA3] font-bold">+6.04% ROI</div>
                </div>
              </div>

              {/* Action Buttons in the Blink */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExecuteMockBlink}
                  className="py-1.5 rounded bg-[#00D688] text-black font-bold text-[10px] hover:bg-[#00FFA3] transition-all"
                >
                  Arb $100
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMockBlink}
                  className="py-1.5 rounded bg-[#1A1D28] text-white border border-[#1F232F] text-[10px] hover:bg-zinc-800"
                >
                  Arb $500
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMockBlink}
                  className="py-1.5 rounded bg-[#1A1D28] text-white border border-[#1F232F] text-[10px] hover:bg-zinc-800"
                >
                  Arb $1,000
                </button>
              </div>

              {txConfirmed && (
                <div className="p-2 rounded bg-[#00D688]/15 border border-[#00D688]/40 text-[#00FFA3] text-[10px] flex items-center gap-1.5 animate-in fade-in">
                  <Check className="h-3 w-3" />
                  <span>
                    Simulated Action Confirmed: Sig 5aK9...8Lq on Solana SVM
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Link & Copy Button */}
          <div className="space-y-1">
            <span className="text-zinc-400 text-[10px]">DIALECT ACTION URL:</span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={blinkUrl}
                className="flex-1 rounded bg-[#12141C] border border-[#1F232F] px-3 py-1.5 text-zinc-300 font-mono text-[11px] select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#12141C] border border-[#1F232F] hover:bg-white/10 text-white font-mono text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <span className="text-zinc-500 text-[10px]">
            Compliant with Solana Actions Specification v1.4
          </span>
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
