"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code,
  Terminal,
  Copy,
  Check,
  FileText,
  BookOpen,
  Key,
  ShieldAlert,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  Zap,
  ShieldCheck,
} from "lucide-react";

type CodeLang = "typescript" | "python" | "rust" | "curl";

interface CodeSnippetData {
  filename: string;
  rawCode: string;
  previewResult: string;
}

const CODE_SNIPPETS: Record<CodeLang, CodeSnippetData> = {
  typescript: {
    filename: "arbitrage-bot.ts",
    rawCode: `import { TrayseClient, Venue } from "@trayse/sdk";

// Initialize non-custodial client with scoped session key
const trayse = new TrayseClient({
  network: "mainnet-beta",
  sessionKey: process.env.TRAYSE_SESSION_KEY,
  maxDailyLossUsd: 5000,
});

// Stream normalized odds across Polymarket and Kalshi
trayse.markets.subscribe({
  category: "Macro",
  minSpreadBps: 150,
  onOpportunity: async (spread) => {
    console.log(\`[ARBITRAGE] \${spread.marketTitle}\`);
    console.log(\`Buy PM Yes: \${spread.legA.price}¢ | Buy KS No: \${spread.legB.price}¢\`);
    console.log(\`Synthetic Lock: +\${spread.netEdgeBps} bps\`);

    // Execute atomic hedge via Solana Session Key
    const tx = await trayse.execution.executeSyntheticHedge({
      pairId: spread.pairId,
      sizeUsd: 1500,
      maxSlippageBps: 25,
      executionTimeoutMs: 350,
    });
    console.log(\`Executed Solana Batch: \${tx.signature}\`);
  },
});`,
    previewResult: `{\n  "status": "STREAMING",\n  "activePairs": 142,\n  "venues": ["Polymarket", "Kalshi", "Solana"],\n  "averageLatencyMs": 24.2,\n  "detectedArbBps": 440\n}`,
  },
  python: {
    filename: "quant_nowcast.py",
    rawCode: `import asyncio
from trayse import AsyncTrayseClient

async def run_quant_model():
    client = AsyncTrayseClient(api_key=os.getenv("TRAYSE_API_KEY"))
    
    # Ingest verified high-frequency CPI nowcasts
    nowcast_edge = await client.quant.evaluate_edge(
        model_id="quant-model-macro-nowcast",
        market_slug="fomc-interest-rate-decision",
    )
    
    if nowcast_edge.statistical_edge_bps > 200:
        print(f"Edge Detected: +{nowcast_edge.statistical_edge_bps} bps (z={nowcast_edge.z_score})")
        print(f"Kelly Stake: {nowcast_edge.kelly_stake_percent}%")
        
        # Route non-custodial smart order
        receipt = await client.orders.place_smart_order(
            outcome="BUY_YES",
            price_cents=nowcast_edge.market_odds,
            amount_usd=5000.0,
        )
        print(f"Fill confirmed on Solana: {receipt.tx_hash}")

asyncio.run(run_quant_model())`,
    previewResult: `{\n  "model": "BLS_Macro_Nowcast_v4",\n  "statisticalEdgeBps": 650,\n  "zScore": 2.14,\n  "kellyStakePercent": 4.2,\n  "sharpeRatio": 2.41,\n  "targetAllocationUsd": 5000.0,\n  "orderSide": "BUY_YES"\n}`,
  },
  rust: {
    filename: "high_frequency_arb.rs",
    rawCode: `use trayse_sdk::prelude::*;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = TrayseEngine::builder()
        .with_session_key(std::env::var("SESSION_KEY")?)
        .with_cluster(Cluster::Mainnet)
        .build()
        .await?;

    let mut stream = client.subscribe_synthetic_spreads(120).await?;

    while let Some(spread) = stream.next().await {
        println!("Edge: +{} bps on {}", spread.net_bps, spread.title);
        // Execute atomic synthetic arbitrage with safety bounds
        client.execute_synthetic_arb(SyntheticArbOrder {
            pair_id: spread.pair_id,
            notional_usd: dec!(25_000),
            min_net_spread_bps: 120,
            max_leg_slippage_bps: 15,
            execution_timeout_ms: 350,
        }).await?;
    }
    Ok(())
}`,
    previewResult: `{\n  "engine": "Rust-Core-v1",\n  "clockSlot": 284910244,\n  "executionWindow": "382ms",\n  "status": "SYNTHETIC_HEDGE_SETTLED"\n}`,
  },
  curl: {
    filename: "terminal-curl.sh",
    rawCode: `curl -X GET "https://api.trayse.io/v1/markets/arbitrage" \\
  -H "Authorization: Bearer ty_live_94f83e..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "Macro",
    "minVolumeUsd": 50000,
    "maxSpreadBps": 600
  }'`,
    previewResult: `{\n  "ok": true,\n  "data": [\n    {\n      "pairId": "pm_ks_cpi_2026",\n      "title": "US CPI YoY Rate",\n      "spreadBps": 440,\n      "annualizedIrr": "114.7%"\n    }\n  ]\n}`,
  },
};

interface ResearchDossier {
  id: string;
  title: string;
  badge: string;
  abstractText: string;
  formulaComponent: React.ReactNode;
  sharpe: string;
  maxDrawdown: string;
  annualizedAlpha: string;
  pdfFilename: string;
}

const RESEARCH_DOSSIERS: ResearchDossier[] = [
  {
    id: "arb-bounds",
    title: "Synthetic Arbitrage Bounds Across Fragmented Prediction AMMs & CLOBs",
    badge: "Market Microstructure",
    abstractText:
      "A mathematical proof establishing theoretical risk-free bounds between continuous-time prediction market limit order books and binary event contracts under settlement delay discounting.",
    formulaComponent: (
      <div className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-[#00FFA3]">
        <span>Π</span>
        <span className="text-[10px] -translate-y-1">net</span>
        <span>=</span>
        <span className="text-xl">∑</span>
        <span className="text-xs -translate-y-1">i</span>
        <span>[ 1.00 − (P</span>
        <span className="text-[10px] translate-y-1">A,YES</span>
        <span>+ P</span>
        <span className="text-[10px] translate-y-1">B,NO</span>
        <span>) − ∑ φ</span>
        <span className="text-[10px] translate-y-1">fee</span>
        <span>] · Q</span>
        <span className="text-[10px] translate-y-1">i</span>
        <span>− C</span>
        <span className="text-[10px] translate-y-1">tx</span>
      </div>
    ),
    sharpe: "3.42",
    maxDrawdown: "0.4%",
    annualizedAlpha: "+14.8%",
    pdfFilename: "trayse-wp-synthetic-arbitrage-2026.pdf",
  },
  {
    id: "kelly-binary",
    title: "Modified Kelly Criterion for Liquidity-Bounded Binary Payouts",
    badge: "Capital Allocation",
    abstractText:
      "Derivation of optimal capital commitment sizing when prediction market liquidity features severe slip cascades and discrete resolution date discount factors.",
    formulaComponent: (
      <div className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-[#00FFA3]">
        <span>f* =</span>
        <span className="border-b border-[#00FFA3] px-1">
          p − m
        </span>
        <span className="text-xs">/</span>
        <span>(1 − m)(1 + 2κ · Depth</span>
        <span className="text-[10px] -translate-y-1.5">−1</span>
        <span>)</span>
      </div>
    ),
    sharpe: "2.89",
    maxDrawdown: "1.8%",
    annualizedAlpha: "+22.4%",
    pdfFilename: "trayse-wp-kelly-binary-allocation.pdf",
  },
  {
    id: "weather-ensemble",
    title: "High-Resolution Atmospheric Ensemble Models in Binary Weather Derivatives",
    badge: "Quant Physical Models",
    abstractText:
      "Empirical analysis demonstrating a 700 bps pricing edge in NOAA HRRR radar integration over crowd sentiment on temperature strike contracts.",
    formulaComponent: (
      <div className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-[#00FFA3]">
        <span>P(T ≤ θ) = Φ((θ − μ</span>
        <span className="text-[10px] translate-y-1">HRRR</span>
        <span>) / σ</span>
        <span className="text-[10px] translate-y-1">ECMWF</span>
        <span>) =</span>
        <span className="text-xl">∫</span>
        <span className="text-[10px] -translate-y-2">θ</span>
        <span>(2πσ</span>
        <span className="text-[10px] -translate-y-1.5">2</span>
        <span>)</span>
        <span className="text-[10px] -translate-y-1.5">−½</span>
        <span>e</span>
        <span className="text-[10px] -translate-y-2">−(x−μ)² / 2σ²</span>
        <span>dx</span>
      </div>
    ),
    sharpe: "3.12",
    maxDrawdown: "1.1%",
    annualizedAlpha: "+18.2%",
    pdfFilename: "trayse-wp-atmospheric-prediction-models.pdf",
  },
];

export default function ResourceSection() {
  const [activeLang, setActiveLang] = useState<CodeLang>("typescript");
  const [isCopied, setIsCopied] = useState(false);
  const [expandedDossier, setExpandedDossier] = useState<string | null>("arb-bounds");
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const currentSnippet = CODE_SNIPPETS[activeLang];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentSnippet.rawCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section
      id="resources"
      className="relative w-full bg-[#111113] text-white pt-28 pb-32 overflow-hidden isolate"
    >
      {/* Background Blueprint Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* Top Hairline Separator with Ambient Ray */}
      <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[2px] bg-[#3b40d6] blur-[2px]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-16 border-b border-white/[0.08]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#3b40d6] animate-pulse" />
              <span className="font-display font-bold text-xs uppercase tracking-[0.2em] text-[#00D688]">
                02 / QUANT STUDIO & DEVELOPER INFRASTRUCTURE
              </span>
            </div>

            <h2 className="font-headline font-bold text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[1.04] text-white tracking-[-0.03em] mb-4">
              <span className="block">Built for Quantitative Rigor.</span>
              <span className="block text-zinc-300">Zero Black Boxes. Pure Mathematical Alpha.</span>
            </h2>

            <p className="font-sans font-normal text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Whether you are deploying low-latency Python execution bots, verifying cross-venue synthetic spreads, or integrating institutional feeds via TypeScript, Trayse provides the complete programmatic foundation.
            </p>
          </div>

          <div className="bg-[#18191e]/90 border border-white/10 rounded-2xl px-5 py-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-6 mb-1">
              <span className="font-sans text-xs text-zinc-400 font-medium">SDK Performance</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#00D688]/15 text-[#00FFA3] border border-[#00D688]/30">
                STABLE v1.4
              </span>
            </div>
            <div className="flex items-baseline gap-2 font-mono tabular-nums text-xl font-bold text-white">
              <span>24.2ms</span>
              <span className="text-xs text-zinc-400 font-normal font-sans">avg WebSocket tick delivery</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE 1: INTERACTIVE DEVELOPER SDK WORKBENCH
            (Institutional RPC header with clean line numbers & syntax layout)
            ========================================================================= */}
        <div className="mt-14 bg-[#14151a] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FFA3]">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-white">
                  Trayse Programmatic Engine (<span className="font-mono text-zinc-300 text-sm">trayse-sdk</span>)
                </h3>
                <span className="font-sans text-xs text-zinc-400">
                  Client libraries with automatic nonce management, session keys, and sub-second streaming.
                </span>
              </div>
            </div>

            {/* Language Selector Tabs */}
            <div className="flex items-center bg-[#1a1c24] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              {(["typescript", "python", "rust", "curl"] as CodeLang[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`font-sans text-xs px-3.5 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    activeLang === lang
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {lang === "curl" ? "cURL" : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Window with Institutional RPC Header */}
          <div className="mt-6 bg-[#0a0b0e] border border-white/[0.08] rounded-2xl overflow-hidden font-mono text-xs shadow-inner">
            {/* High-Craft Institutional Header */}
            <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-[#111318] border-b border-white/[0.06] text-[11px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D688] animate-pulse" />
                  <span className="text-zinc-400 font-mono">ENDPOINT:</span>
                  <span className="text-zinc-200 font-mono">wss://clob.trayse.io/v1/stream</span>
                </div>
                <span className="text-zinc-600 hidden sm:inline">|</span>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-zinc-400 font-mono">FILE:</span>
                  <span className="text-[#00FFA3] font-mono">{currentSnippet.filename}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className={`font-sans text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    showJsonPreview
                      ? "bg-[#00D688]/20 text-[#00FFA3] border border-[#00D688]/40"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {showJsonPreview ? "Hide Response" : "View Live JSON Output"}
                </button>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-[11px] font-sans px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-[#00FFA3]" />
                      <span className="text-[#00FFA3]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body with Gutter & Live JSON Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
              <div
                className={`${
                  showJsonPreview ? "lg:col-span-8" : "lg:col-span-12"
                } p-5 overflow-x-auto text-zinc-300 leading-relaxed max-h-[400px] terminal-scroll`}
              >
                <div className="flex font-mono text-xs leading-6">
                  {/* Line numbers gutter */}
                  <div className="pr-4 select-none text-zinc-600 text-right border-r border-white/[0.06] font-mono">
                    {currentSnippet.rawCode.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* Code body */}
                  <pre className="pl-4 text-zinc-200 font-mono flex-1 whitespace-pre overflow-x-auto">
                    {currentSnippet.rawCode}
                  </pre>
                </div>
              </div>

              {showJsonPreview && (
                <div className="lg:col-span-4 p-5 bg-[#060709] text-[#00FFA3] overflow-x-auto max-h-[400px] terminal-scroll">
                  <div className="text-[11px] text-zinc-500 mb-2 font-sans font-medium uppercase tracking-wider">
                    Simulated Telemetry Response
                  </div>
                  <pre className="text-[11px] leading-relaxed font-mono">
                    {currentSnippet.previewResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE 2: TYPESET MATHEMATICAL RESEARCH DOSSIERS
            ========================================================================= */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-display font-semibold text-xs text-zinc-400 uppercase tracking-wider block mb-1">
                Institutional Whitepapers
              </span>
              <h3 className="font-headline font-bold text-2xl sm:text-3xl text-white">
                Quantitative Research Dossiers
              </h3>
            </div>
            <span className="font-sans text-xs text-zinc-400">
              Peer-reviewed mathematical models and historical backtesting data.
            </span>
          </div>

          <div className="space-y-4">
            {RESEARCH_DOSSIERS.map((dossier) => {
              const isExpanded = expandedDossier === dossier.id;

              return (
                <div
                  key={dossier.id}
                  className="bg-[#16171c]/90 border border-white/10 hover:border-white/20 transition-all rounded-2xl p-6 backdrop-blur-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="font-display font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-[#00FFA3] border border-white/10">
                          {dossier.badge}
                        </span>
                        <span className="font-mono text-xs text-zinc-400">
                          {dossier.pdfFilename}
                        </span>
                      </div>
                      <h4 className="font-sans font-bold text-lg text-white">
                        {dossier.title}
                      </h4>
                    </div>

                    {/* Performance Metrics Row */}
                    <div className="flex items-center gap-6 font-mono tabular-nums text-xs shrink-0 py-2 sm:py-0 border-y sm:border-y-0 border-white/[0.06]">
                      <div>
                        <span className="block text-[10px] text-zinc-400 font-sans">Sharpe Ratio</span>
                        <span className="text-white font-bold">{dossier.sharpe}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-400 font-sans">Max Drawdown</span>
                        <span className="text-rose-400 font-bold">{dossier.maxDrawdown}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-400 font-sans">Annualized Alpha</span>
                        <span className="text-[#00FFA3] font-bold">{dossier.annualizedAlpha}</span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedDossier(isExpanded ? null : dossier.id)
                      }
                      className="font-sans text-xs flex items-center gap-1.5 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all self-start lg:self-center cursor-pointer"
                    >
                      <span>{isExpanded ? "Collapse" : "Read Abstract"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expandable Mathematical Abstract */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-white/[0.08] font-sans text-xs text-zinc-300 space-y-4">
                      <p className="leading-relaxed text-sm text-zinc-300">
                        {dossier.abstractText}
                      </p>

                      <div className="bg-[#0e1014] border border-white/[0.08] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-zinc-400 font-sans uppercase tracking-widest block mb-2">
                            Mathematical Formulation:
                          </span>
                          {dossier.formulaComponent}
                        </div>

                        <Link
                          href="/terminal"
                          className="font-sans font-medium text-xs bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <span>Backtest on Live Data</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            FEATURE 3: CRYPTOGRAPHIC SESSION KEYS SECURITY BLUEPRINT
            (Bespoke Architectural Pipeline Canvas replacing 4-box slop)
            ========================================================================= */}
        <div className="mt-16 bg-gradient-to-br from-[#16171c] to-[#111216] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <span className="font-display font-semibold text-xs text-zinc-400 uppercase tracking-wider block mb-1">
              Cryptographic Security
            </span>
            <h3 className="font-headline font-bold text-2xl sm:text-3xl text-white mb-2">
              Delegated Session Key Architecture
            </h3>
            <p className="font-sans text-sm sm:text-base text-zinc-400 leading-relaxed">
              Automated execution without giving up custody of your private keys. Scoped smart-wallet delegation guardrails run non-custodially on Solana.
            </p>
          </div>

          {/* BESPOKE SECURITY ENCLAVE PIPELINE CANVAS */}
          <div className="p-6 bg-[#0c0e12] border border-white/10 rounded-2xl relative overflow-hidden font-mono">
            <div className="flex flex-col md:flex-row items-stretch gap-4 relative z-10">
              {/* Zone 1: User Custody Hub */}
              <div className="flex-1 bg-[#14161F] border border-indigo-500/30 rounded-xl p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                      ZONE 01 / COLD VAULT
                    </span>
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <h5 className="font-sans font-bold text-white text-base">
                    User Self-Custody Hub
                  </h5>
                  <p className="font-sans text-xs text-zinc-400 mt-2 leading-relaxed">
                    Principal assets remain in native Phantom/Backpack wallet. Seed phrases and private keys never leave client custody.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-indigo-300 font-sans">
                  Status: 100% Non-Custodial
                </div>
              </div>

              {/* Cryptographic Bridge Vector */}
              <div className="flex md:flex-col items-center justify-center py-2 md:py-0 px-2 text-zinc-500">
                <div className="h-px md:h-10 w-10 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-indigo-500 via-[#00D688] to-emerald-500" />
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 my-1 font-mono text-zinc-400">
                  DELEGATE
                </span>
                <div className="h-px md:h-10 w-10 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-indigo-500 via-[#00D688] to-emerald-500" />
              </div>

              {/* Zone 2: Ephemeral Policy Enclave */}
              <div className="flex-1 bg-[#11181F] border border-[#00D688]/30 rounded-xl p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#00FFA3] uppercase tracking-widest">
                      ZONE 02 / ENCLAVE
                    </span>
                    <Key className="w-3.5 h-3.5 text-[#00FFA3]" />
                  </div>
                  <h5 className="font-sans font-bold text-white text-base">
                    Bounded Session Enclave
                  </h5>
                  <p className="font-sans text-xs text-zinc-400 mt-2 leading-relaxed">
                    Locally generated key with immutable hard limits: max $5,000 daily loss, 25 bps slippage collar, and auto 24h expiration.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-sans">
                  <span className="text-zinc-400">Withdraw Authority:</span>
                  <span className="text-rose-400 font-bold uppercase text-[10px]">
                    Cryptographically Blocked
                  </span>
                </div>
              </div>

              {/* Execution Vector */}
              <div className="flex md:flex-col items-center justify-center py-2 md:py-0 px-2 text-zinc-500">
                <div className="h-px md:h-10 w-10 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-[#00D688] to-[#00FFA3]" />
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 my-1 font-mono text-zinc-400">
                  ATOMIC
                </span>
                <div className="h-px md:h-10 w-10 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-[#00D688] to-[#00FFA3]" />
              </div>

              {/* Zone 3: Atomic Market Routing */}
              <div className="flex-1 bg-[#101F18] border border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      ZONE 03 / EXECUTION
                    </span>
                    <Zap className="w-3.5 h-3.5 text-[#00FFA3]" />
                  </div>
                  <h5 className="font-sans font-bold text-white text-base">
                    Parallel Market Settlement
                  </h5>
                  <p className="font-sans text-xs text-zinc-300 mt-2 leading-relaxed">
                    Dispatches EIP-712 order hashes to Polymarket CLOB and RSA-PSS signatures to Kalshi with atomic bilateral fail-safe rollback.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-sans">
                  <span className="text-zinc-400">Avg Confirmation:</span>
                  <span className="text-[#00FFA3] font-mono font-bold">382ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
