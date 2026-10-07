"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { Shield, ShieldAlert, Key, CheckCircle2, X } from "lucide-react";

export function SessionKeyModal() {
  const { activeModal, closeModal, sessionKey, authorizeSessionKey, revokeSessionKey } =
    useTerminalStore();

  const [maxPosition, setMaxPosition] = useState(sessionKey.maxPositionUsd || 250);
  const [maxSlippage, setMaxSlippage] = useState(sessionKey.maxSlippageBps / 100 || 2.0);
  const [dailyLoss, setDailyLoss] = useState(sessionKey.dailyLossLimitUsd || 1000);
  const [expiryHours, setExpiryHours] = useState(24);
  const [isSaved, setIsSaved] = useState(false);

  if (activeModal !== "SESSION_KEYS") return null;

  const handleAuthorize = () => {
    authorizeSessionKey(maxPosition, Math.round(maxSlippage * 100), dailyLoss, expiryHours);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      closeModal();
    }, 1000);
  };

  const handleRevoke = () => {
    revokeSessionKey();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#00D688]/10 border border-[#00D688]/30">
              <Shield className="h-4 w-4 text-[#00D688]" />
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
            className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#12141C] border border-[#1F232F] text-[11px] text-zinc-300 leading-relaxed">
            <span className="text-[#00FFA3] font-semibold">How it works: </span>
            A delegated session keypair signs transactions on your behalf without
            exposing your wallet&apos;s private key. If any trade violates your
            pre-defined mathematical limits below, execution is rejected instantly on-chain.
          </div>

          {/* Current Key Status */}
          <div className="flex items-center justify-between p-2.5 rounded bg-black border border-[#1F232F]">
            <div>
              <div className="text-[10px] text-zinc-500">DELEGATED KEY</div>
              <div className="text-zinc-200 font-semibold">{sessionKey.publicKey}</div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sessionKey.isAuthorized
                  ? "bg-[#00D688]/20 text-[#00FFA3] border border-[#00D688]/40"
                  : "bg-red-500/20 text-red-300 border border-red-500/40"
              }`}
            >
              {sessionKey.isAuthorized ? "ACTIVE" : "REVOKED"}
            </span>
          </div>

          {/* Risk Limit Controls */}
          <div className="space-y-3 pt-1">
            {/* 1. Max Position */}
            <div>
              <div className="flex justify-between pb-1">
                <span className="text-zinc-400">Max Trade Allocation:</span>
                <span className="text-[#00D688] font-bold">${maxPosition} USD</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={maxPosition}
                onChange={(e) => setMaxPosition(Number(e.target.value))}
                className="w-full accent-[#00D688]"
              />
            </div>

            {/* 2. Max Slippage */}
            <div>
              <div className="flex justify-between pb-1">
                <span className="text-zinc-400">Max Slippage Bound:</span>
                <span className="text-amber-400 font-bold">{maxSlippage.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={maxSlippage}
                onChange={(e) => setMaxSlippage(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* 3. Daily Loss Stop */}
            <div>
              <div className="flex justify-between pb-1">
                <span className="text-zinc-400">Daily Cumulative Loss Limit:</span>
                <span className="text-rose-400 font-bold">${dailyLoss} USD</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="50"
                value={dailyLoss}
                onChange={(e) => setDailyLoss(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
            </div>

            {/* 4. Expiry Duration */}
            <div>
              <div className="flex justify-between pb-1 text-zinc-400">
                <span>Session Duration / Auto-Expiry:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[6, 24, 168].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setExpiryHours(hours)}
                    className={`py-1.5 rounded border text-xs font-mono transition-all ${
                      expiryHours === hours
                        ? "bg-[#00D688]/15 border-[#00D688]/40 text-[#00FFA3]"
                        : "bg-[#12141C] border-[#1F232F] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {hours === 168 ? "7 Days" : `${hours} Hours`}
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
              className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-500/20"
            >
              Revoke Session
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleAuthorize}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#00D688] text-black font-semibold text-xs font-mono hover:bg-[#00FFA3] transition-all shadow-[0_0_12px_rgba(0,214,136,0.3)]"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Authorized!</span>
              </>
            ) : (
              <span>Authorize &amp; Sign Delegation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
