"use client";

import React, { useEffect } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { QuantStrategyHub } from "../QuantStrategyHub";
import { X, Brain } from "lucide-react";

export function QuantStudioModal() {
  const { activeModal, closeModal } = useTerminalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  if (activeModal !== "QUANT_STUDIO") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl rounded-2xl bg-[#0B0C10] border border-[#1F232F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F232F] bg-[#12141C]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Quant Strategy Studio
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  4 ALGORITHMIC MODELS ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Institutional predictive edge, backtested Sharpe ratios, and Kelly-optimized allocation stakes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          <QuantStrategyHub />
        </div>
      </div>
    </div>
  );
}
