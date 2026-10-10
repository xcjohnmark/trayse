"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { X, Code2, Terminal, Play, Bot, Copy, Check, Sparkles } from "lucide-react";

export function DeveloperSdkModal() {
  const { activeModal, closeModal } = useTerminalStore();
  const [activeTab, setActiveTab] = useState<"PYTHON_SDK" | "X402_AGENT">("PYTHON_SDK");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{ text: string; color: string }[]>([]);
  const [copied, setCopied] = useState(false);

  if (activeModal !== "DEV_SDK") return null;

  const pythonSample = `import trayse

client = trayse.Client(api_key="trayse_live_...")

# Stream normalized odds across Polymarket and Kalshi
for tick in client.stream_pairs(categories=["Macro", "Equities"]):
    if tick.arbitrage.net_spread_bps > 200:
        print(f"Arbitrage detected: {tick.title} -> {tick.arbitrage.roi_percent}%")
        client.execute_dual_arb(
            pair_id=tick.id,
            size_usd=500,
            session_key="swig_..."
        )`;

  const runSimulation = () => {
    setIsRunning(true);
    setLogs([{ text: "[TRAYSE-SDK] Initializing real-time stream client...", color: "text-zinc-400" }]);
    
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        { text: "[TRAYSE-SDK] Ingesting feeds: Polymarket [OK] | Kalshi [OK]", color: "text-cyan-400" },
        { text: "[TRAYSE-SDK] Scanning cross-venue order books across categories: ['Macro', 'Equities']", color: "text-zinc-400" },
      ]);
    }, 500);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        { text: "⚡ Arbitrage detected: US Federal Reserve Rate Cut in Nov 2026 -> +5.26% ROI (500 bps)", color: "text-amber-300 font-bold" },
        { text: "[EXECUTION] Leg 1: BUY YES on Polymarket @ $0.580 (Size: $250)", color: "text-purple-300" },
        { text: "[EXECUTION] Leg 2: BUY NO on Kalshi @ $0.360 (Size: $250)", color: "text-blue-300" },
        { text: "[SWIG GUARD] Verifying Swig Session Key guardrails: $500 max limit [PASS] | Slippage 15 bps [PASS]", color: "text-zinc-400" },
        { text: "✓ [SUCCESS] Dual arb executed in 12ms. Guaranteed $26.30 net basis return locked at resolution.", color: "text-[#00FFA3] font-bold" },
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-[#1E2638] bg-[#121722] text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E2638] px-5 py-3.5 bg-[#0F131C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D688]/10 border border-[#00D688]/30">
              <Code2 className="h-4 w-4 text-[#00FFA3]" />
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
            className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1E2638] bg-[#0B0E14] px-5">
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
            <span>x402 Agentic Micropayments Protocol</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto font-mono text-xs">
          {activeTab === "PYTHON_SDK" ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Python SDK Quickstart (`pip install trayse-sdk`):</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-zinc-300 hover:text-white bg-[#182030] border border-[#242E44] px-2.5 py-1 rounded"
                >
                  {copied ? <Check className="h-3 w-3 text-[#00FFA3]" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              {/* Syntax-Highlighted Code Editor */}
              <div className="rounded-lg bg-[#0A0D14] border border-[#1E2638] p-3.5 text-[11px] leading-relaxed overflow-x-auto text-zinc-200">
                <pre className="font-mono">
                  <span className="text-purple-400">import</span> trayse{"\n\n"}
                  client = trayse.<span className="text-blue-400">Client</span>(api_key=<span className="text-emerald-300">&quot;trayse_live_...&quot;</span>){"\n\n"}
                  <span className="text-zinc-500"># Stream normalized odds across Polymarket and Kalshi</span>{"\n"}
                  <span className="text-purple-400">for</span> tick <span className="text-purple-400">in</span> client.<span className="text-blue-400">stream_pairs</span>(categories=[<span className="text-emerald-300">&quot;Macro&quot;</span>, <span className="text-emerald-300">&quot;Equities&quot;</span>]):{"\n"}
                  {"    "}<span className="text-purple-400">if</span> tick.arbitrage.net_spread_bps &gt; <span className="text-amber-300">200</span>:{"\n"}
                  {"        "}<span className="text-blue-300">print</span>(<span className="text-emerald-300">f&quot;Arbitrage detected: &#123;tick.title&#125; -&gt; &#123;tick.arbitrage.roi_percent&#125;%&quot;</span>){"\n"}
                  {"        "}client.<span className="text-blue-400">execute_dual_arb</span>({"\n"}
                  {"            "}pair_id=tick.id,{"\n"}
                  {"            "}size_usd=<span className="text-amber-300">500</span>,{"\n"}
                  {"            "}session_key=<span className="text-emerald-300">&quot;swig_...&quot;</span>{"\n"}
                  {"        "})
                </pre>
              </div>

              {/* Interactive Runner Trigger */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-zinc-500">
                  Sandboxed algorithmic loop against live order books
                </span>
                <button
                  type="button"
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00D688] text-black font-mono font-bold text-xs hover:bg-[#00FFA3] transition-all disabled:opacity-50 shadow-md shadow-[#00FFA3]/10"
                >
                  <Play className="h-3.5 w-3.5 fill-black" />
                  <span>{isRunning ? "Simulating Harness..." : "Run Sample Script in Sandbox"}</span>
                </button>
              </div>

              {/* Terminal Output Console */}
              {logs.length > 0 && (
                <div className="rounded-lg bg-[#0A0D14] border border-[#1E2638] p-3.5 space-y-1.5 text-[11px] font-mono shadow-inner animate-in fade-in duration-150">
                  <div className="text-zinc-500 pb-1.5 border-b border-[#1E2638] flex items-center justify-between">
                    <span>SANDBOX TERMINAL CONSOLE:</span>
                    <span className="text-[#00FFA3] text-[10px]">● LIVE TAPE</span>
                  </div>
                  {logs.map((log, i) => (
                    <div key={i} className={log.color}>
                      {log.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3.5 text-xs font-mono leading-relaxed">
              <div className="p-3.5 rounded-lg bg-[#182030] border border-[#242E44] text-zinc-300 space-y-1.5">
                <div className="text-purple-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Autonomous AI Agent Micro-Monetization:</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  The **x402 Protocol** enables autonomous AI agents to query Trayse normalized
                  order flow, mispricings, and quant predictions on a pay-per-query basis paying
                  in USDC via Solana micropayments (<span className="text-[#00FFA3] font-bold">$0.002 / query</span>).
                </p>
              </div>

              {/* JSON Request / Response Schema */}
              <div className="rounded-lg bg-[#0A0D14] border border-purple-500/40 p-3.5 space-y-2 text-zinc-300">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  HTTP / SOLANA ACTIONS REQUEST &amp; RESPONSE SCHEMA
                </div>
                <pre className="text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
{`GET /api/v1/x402/signals/macro-fed-cut
Headers:
  X-402-Payment-Signature: "sol_tx_sig_4xK9...9Lq2"
  X-402-Amount-USDC: "0.002"
  X-Client-Agent-ID: "solana-quant-agent-v1"

Response: 200 OK
{
  "protocol": "x402-solana-micropayment-v1",
  "pair_id": "fed-rate-cut-nov-2026",
  "statistical_edge": +0.065,
  "confidence_interval": [0.651, 0.718],
  "optimal_venue_routing": {
    "buy_venue": "kalshi",
    "contract_ticker": "FED-NOV26",
    "recommended_allocation_usd": 500,
    "synthetic_arbitrage_roi": "+5.26%"
  },
  "micro_payment": {
    "amount_usdc": 0.002,
    "status": "SETTLED_ON_SOLANA_SVM"
  }
}`}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]">
                No human account creation or credit card required. Autonomous agents programmatically
                sign Solana micro-transactions to access real-time prediction market alpha.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1E2638] px-5 py-3.5 bg-[#0F131C]">
          <span className="text-zinc-500 text-[10px] font-mono">
            API Gateway: api.trayse.app/v1 • Python Package: trayse-sdk v1.0.4
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
