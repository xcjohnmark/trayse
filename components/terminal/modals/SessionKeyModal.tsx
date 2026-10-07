"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { Shield, CheckCircle2, X, AlertTriangle, Key } from "lucide-react";

export function SessionKeyModal() {
  const { activeModal, closeModal, sessionKey, authorizeSessionKey, revokeSessionKey } =
    useTerminalStore();

  const [maxPosition, setMaxPosition] = useState(sessionKey.maxPositionUsd || 250);
  const [maxSlippage, setMaxSlippage] = useState(
    sessionKey.maxSlippageBps ? sessionKey.maxSlippageBps / 100 : 2.0
  );
  const [dailyLoss, setDailyLoss] = useState(sessionKey.dailyLossLimitUsd || 500);
  const [expiryHours, setExpiryHours] = useState(24);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (activeModal !== "SESSION_KEYS") return null;

  const handleAuthorize = () => {
    const slippageBps = Math.round(maxSlippage * 100);
    authorizeSessionKey(maxPosition, slippageBps, dailyLoss, expiryHours);

    const expiryLabel = expiryHours === 168 ? "7d" : `${expiryHours}h`;
    setToastMessage(`Session Key Active: Bound to $${maxPosition} max trade, ${expiryLabel} expiry`);

    setTimeout(() => {
      setToastMessage(null);
      closeModal();
    }, 2000);
  };

  const handleRevoke = () => {
    revokeSessionKey();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D688]/10 border border-[#00D688]/30">
              <Shield className="h-4 w-4 text-[#00FFA3]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">
                Swig Delegated Session Key Guardrails
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Non-Custodial Algorithmic Execution on Solana SVM
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/40 text-[#00FFA3] animate-in fade-in duration-150">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Explanatory Note */}
          <div className="p-3 rounded-lg bg-[#12141C] border border-[#1F232F] text-[11px] text-zinc-300 leading-relaxed">
            <span className="text-[#00FFA3] font-semibold">Security Model: </span>
            Session key signs on Solana via Swig without exposing your master wallet private key.
            Bot execution automatically revokes if any risk limit is breached.
          </div>

          {/* Current Key Status */}
          <div className="flex items-center justify-between p-2.5 rounded bg-black border border-[#1F232F]">
            <div>
              <div className="text-[10px] text-zinc-500">DELEGATED SWIG KEYPAIR</div>
              <div className="text-zinc-200 font-semibold flex items-center gap-1.5 mt-0.5">
                <Key className="h-3 w-3 text-purple-400" />
                <span>{sessionKey.publicKey}</span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sessionKey.isAuthorized
                  ? "bg-[#00D688]/20 text-[#00FFA3] border border-[#00D688]/40"
                  : "bg-red-500/20 text-red-300 border border-red-500/40"
              }`}
            >
              {sessionKey.isAuthorized ? "GUARDED & ACTIVE" : "REVOKED"}
            </span>
          </div>

          {/* Risk Limit Controls */}
          <div className="space-y-3.5 pt-1">
            {/* 1. Max Position Size: Slider $50 - $1,000 (default: $250) */}
            <div>
              <div className="flex justify-between pb-1 text-xs">
                <span className="text-zinc-400">Max Position Size:</span>
                <span className="text-[#00FFA3] font-bold">${maxPosition} USD</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={maxPosition}
                onChange={(e) => setMaxPosition(Number(e.target.value))}
                className="w-full accent-[#00FFA3] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
                <span>$50 Min</span>
                <span>$1,000 Max</span>
              </div>
            </div>

            {/* 2. Max Slippage Guard: Slider 0.5% - 5.0% (default: 2.0% / 200 bps) */}
            <div>
              <div className="flex justify-between pb-1 text-xs">
                <span className="text-zinc-400">Max Slippage Guard:</span>
                <span className="text-amber-400 font-bold">
                  {maxSlippage.toFixed(1)}% ({Math.round(maxSlippage * 100)} bps)
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={maxSlippage}
                onChange={(e) => setMaxSlippage(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
                <span>0.5% (50 bps)</span>
                <span>5.0% (500 bps)</span>
              </div>
            </div>

            {/* 3. Daily Cumulative Loss Stop: Slider $100 - $2,500 (default: $500) */}
            <div>
              <div className="flex justify-between pb-1 text-xs">
                <span className="text-zinc-400">Daily Cumulative Loss Stop:</span>
                <span className="text-rose-400 font-bold">${dailyLoss} USD</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={dailyLoss}
                onChange={(e) => setDailyLoss(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
                <span>$100 Min</span>
                <span>$2,500 Max</span>
              </div>
            </div>

            {/* 4. Session Key Duration / Expiry: [ 6 Hours | 24 Hours | 7 Days ] */}
            <div>
              <div className="flex justify-between pb-1.5 text-zinc-400 text-xs">
                <span>Session Key Duration / Expiry:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { hours: 6, label: "6 Hours" },
                  { hours: 24, label: "24 Hours" },
                  { hours: 168, label: "7 Days" },
                ].map(({ hours, label }) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setExpiryHours(hours)}
                    className={`py-2 rounded-lg border text-xs font-mono font-semibold transition-all ${
                      expiryHours === hours
                        ? "bg-[#00D688]/15 border-[#00FFA3] text-[#00FFA3]"
                        : "bg-[#12141C] border-[#1F232F] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          {sessionKey.isAuthorized ? (
            <button
              type="button"
              onClick={handleRevoke}
              className="px-3.5 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold hover:bg-red-500/20 transition-colors"
            >
              Revoke Session Key Immediately
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleAuthorize}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00D688] text-black font-bold text-xs font-mono hover:bg-[#00FFA3] transition-all shadow-[0_0_15px_rgba(0,214,136,0.3)]"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Authorize &amp; Sign Session Key</span>
          </button>
        </div>
      </div>
    </div>
  );
}
