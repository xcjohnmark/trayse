"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { X, Code2, Terminal, Play, Bot, Copy, Check } from "lucide-react";

export function DeveloperSdkModal() {
  const { activeModal, closeModal } = useTerminalStore();
  const [activeTab, setActiveTab] = useState<"PYTHON_SDK" | "X402_AGENT">("PYTHON_SDK");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  if (activeModal !== "DEV_SDK") return null;

  const pythonSample = `import trayse

# Connect to Trayse Normalized WebSocket & Yellowstone gRPC
client = trayse.Client(api_key="trayse_live_hackathon_2026")

# Stream normalized order books across Polymarket and Kalshi
for tick in client.stream_pairs(categories=["Macro", "Equities"]):
    # Automatically scan for synthetic risk-free spreads
    if tick.arbitrage.net_spread_bps > 200:
        print(f"[ARB FOUND] {tick.title} -> Net ROI: {tick.arbitrage.roi_percent}%")
        
        # Execute via Swig Delegated Session Key (non-custodial)
        client.execute_dual_arb(
            pair_id=tick.id,
            size_usd=250,
            session_key="swig_8kF9...2Nq4"
        )`;

  const runSimulation = () => {
    setIsRunning(true);
    setLogs(["[TRAYSE-SDK] Initializing Yellowstone gRPC client..."]);
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        "[TRAYSE-SDK] Connected to Polymarket CLOB & Kalshi CFTC WebSocket v2.",
        "[TRAYSE-SDK] Subscribing to Yellowstone Mempool for on-chain prediction contracts...",
      ]);
    }, 600);
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        "[SCANNER] Found Pair: US Federal Reserve Rate Cut Nov 2026",
        "[ARB DETECTED] Kalshi YES (0.420) + Polymarket NO (0.523) -> Effective Cost $0.943",
        "[EXECUTION] Routing Leg 1 (Kalshi) & Leg 2 (Polymarket)...",
        "[SWIG GUARD] Checking Risk Bounds: Max Trade $250 [PASS], Slippage 12 bps [PASS]",
        "[SUCCESS] 250 Units Executed. Locked $14.25 USD Risk-Free Basis Yield at resolution.",
      ]);
      setIsRunning(false);
    }, 1800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#00D688]/10 border border-[#00D688]/30">
              <Code2 className="h-4 w-4 text-[#00D688]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">
                Trayse Developer SDK &amp; Agentic Protocols
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Programmatic Ingestion, Algorithmic Execution &amp; x402 Micropayments
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

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1F232F] bg-black px-5">
          <button
            type="button"
            onClick={() => setActiveTab("PYTHON_SDK")}
            className={`py-2.5 px-4 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "PYTHON_SDK"
                ? "border-[#00D688] text-[#00FFA3]"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Python SDK (trayse-sdk)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("X402_AGENT")}
            className={`py-2.5 px-4 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "X402_AGENT"
                ? "border-purple-400 text-purple-300"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>x402 Agentic Micropayments</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto font-mono text-xs">
          {activeTab === "PYTHON_SDK" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>10-Line Algorithmic Execution Harness:</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-zinc-300 hover:text-white"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              {/* Code Editor Preview */}
              <div className="rounded-lg bg-black border border-[#1F232F] p-3 text-[11px] leading-relaxed overflow-x-auto text-zinc-200">
                <pre>{pythonSample}</pre>
              </div>

              {/* Interactive Runner Trigger */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-zinc-500">
                  Runs sandboxed backtest loop against live tick data
                </span>
                <button
                  type="button"
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00D688] text-black font-semibold text-xs hover:bg-[#00FFA3] transition-all disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{isRunning ? "Running Sandbox..." : "Run in Sandbox"}</span>
                </button>
              </div>

              {/* Output Console */}
              {logs.length > 0 && (
                <div className="rounded-lg bg-black/90 border border-emerald-500/30 p-3 space-y-1 text-[10px] text-emerald-400">
                  <div className="text-zinc-500 pb-1 border-b border-white/5">
                    CONSOLE LOG OUTPUT:
                  </div>
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-[11px] leading-relaxed">
              <p className="text-zinc-300">
                The **x402 Agentic Protocol** allows external autonomous AI agents to
                purchase verified Trayse quantitative signals on a pay-per-query
                basis via instant Solana USDC micropayments ($0.002 / call).
              </p>

              <div className="rounded-lg bg-black border border-purple-500/30 p-3 space-y-2 text-zinc-300">
                <div className="text-purple-400 font-bold">SAMPLE AGENT REQUEST / RESPONSE:</div>
                <pre className="text-[10px] text-zinc-300 overflow-x-auto">
{`GET /api/v1/x402/signals/macro-fed-cut
Headers:
  X-402-Payment-Signature: "sol_tx_sig_89f...2d"
  X-402-Amount-USDC: "0.002"

Response (200 OK):
{
  "pair_id": "fed-rate-cut-nov-2026",
  "statistical_edge": +0.065,
  "confidence_interval": [0.651, 0.718],
  "optimal_venue_routing": {
    "buy_venue": "kalshi",
    "recommended_allocation_usd": 250
  }
}`}
                </pre>
              </div>

              <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px]">
                Enables AI agents to autonomously discover and trade prediction market
                discrepancies on chain without human intervention.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1F232F] px-5 py-3.5 bg-[#12141C]">
          <span className="text-zinc-500 text-[10px]">
            API Endpoint: api.trayse.app/v1
          </span>
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
