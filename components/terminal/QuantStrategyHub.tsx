"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { QUANT_STRATEGY_MODELS } from "@/lib/mock/market-data";
import { QuantStrategyModel } from "@/lib/types/terminal";
import {
  Brain,
  TrendingUp,
  Cpu,
  Bot,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

// Simulated 12-point normalized backtest equity curves for each model
const BACKTEST_CURVES: { [modelId: string]: number[] } = {
  "quant-model-macro-nowcast": [100, 102.4, 101.8, 105.1, 108.3, 107.9, 112.5, 116.1, 119.8, 122.3, 124.9, 128.4],
  "quant-model-weathernext": [100, 103.5, 106.2, 105.4, 109.8, 114.2, 116.8, 121.3, 125.7, 128.2, 133.4, 137.9],
  "quant-model-earnings-vol": [100, 101.9, 104.1, 103.2, 107.5, 110.1, 113.8, 112.9, 117.2, 120.4, 121.8, 125.6],
  "quant-model-whale-flow": [100, 104.2, 108.1, 107.4, 112.9, 117.3, 122.1, 120.8, 126.5, 130.2, 134.8, 141.2],
};

const FORMULA_EXPLANATIONS: { [modelId: string]: string } = {
  "quant-model-macro-nowcast":
    "Dynamic Factor Kalman Filter: Integrates daily high-frequency CPI basket inputs, 5y5y forward breakeven inflation rates, and Federal Funds futures yields. Solves for the implied cumulative distribution function of FOMC terminal rates.",
  "quant-model-weathernext":
    "Physics Numerical Weather Prediction (NWP) Ensemble: Combines NOAA HRRR (3km resolution) with 50-member ECMWF ensemble tracks. Applies Monte Carlo hurricane landfall trajectory simulation to compute non-parametric probability distributions.",
  "quant-model-earnings-vol":
    "Volatility Smile Surface Arbitrage: Fits SVI (Stochastic Volatility Inspired) parametric surfaces across tokenized options ($NVDA-RH). Projects implied binary payoff density vs prediction market odds.",
  "quant-model-whale-flow":
    "Mempool Order Flow Toxicity (VPIN): Ingested via Yellowstone gRPC 8ms validator tape. Measures cumulative volume-synchronized probability of toxicity and aggressive taker accumulation ahead of macro announcements.",
};

export function QuantStrategyHub() {
  const { sessionKey, openModal } = useTerminalStore();
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [deployedBots, setDeployedBots] = useState<{ [id: string]: boolean }>({});

  const handleDeployBot = (model: QuantStrategyModel) => {
    if (!sessionKey.isAuthorized) {
      openModal("SESSION_KEYS");
      return;
    }

    setDeployedBots((prev) => ({ ...prev, [model.id]: true }));
    setTimeout(() => {
      setDeployedBots((prev) => ({ ...prev, [model.id]: false }));
    }, 4000);
  };

  const getSignalBadge = (strength: QuantStrategyModel["signalStrength"]) => {
    switch (strength) {
      case "STRONG":
        return "bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/30";
      case "MODERATE":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      default:
        return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
    }
  };

  return (
    <div className="space-y-3 font-sans select-none">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-[#0C0D12] border border-[#1F232F] p-3 rounded-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              QUANTITATIVE STRATEGY STUDIO
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-normal">
                4 ENSEMBLES ACTIVE
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Proprietary statistical models computing fair-value probability vs live CLOB odds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
            <span>SESSION KEY EXECUTION READY</span>
          </span>
        </div>
      </div>

      {/* 4 Multi-Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {QUANT_STRATEGY_MODELS.map((model) => {
          const isExpanded = expandedModelId === model.id;
          const isDeployed = deployedBots[model.id];
          const curve = BACKTEST_CURVES[model.id] || [100, 105, 110, 115, 120];
          const edgePercent = (model.statisticalEdge * 100).toFixed(1);

          // Render mini SVG sparkline
          const minVal = Math.min(...curve);
          const maxVal = Math.max(...curve);
          const range = maxVal - minVal || 1;
          const svgPoints = curve
            .map((val, idx) => {
              const x = (idx / (curve.length - 1)) * 140;
              const y = 35 - ((val - minVal) / range) * 30;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <div
              key={model.id}
              className="rounded-xl border border-[#1F232F] bg-[#090A0E] hover:border-[#2D3345] transition-all p-3.5 space-y-3 shadow-lg"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-semibold uppercase">
                      {model.category}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${getSignalBadge(
                        model.signalStrength
                      )}`}
                    >
                      {model.signalStrength} ALPHA
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-zinc-100 mt-1">
                    {model.name}
                  </h3>
                </div>

                {/* Statistical Edge Highlight */}
                <div className="text-right">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">
                    Stat Edge
                  </span>
                  <span className="text-sm font-mono font-bold text-[#00FFA3]">
                    +{edgePercent}% {model.edgeDirection.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Data Ingestion Source Strip */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-[#12141C] p-2 rounded border border-[#1F232F]">
                <Cpu className="h-3 w-3 text-purple-400 flex-shrink-0" />
                <span className="truncate">Feed: {model.dataSource}</span>
              </div>

              {/* Odds Comparison Visual */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#12141C] border border-purple-500/20 p-2 rounded">
                  <span className="text-[10px] text-zinc-500 block">MODEL PROBABILITY</span>
                  <span className="text-base font-bold text-purple-300">
                    {(model.modelProbability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="bg-[#12141C] border border-[#1F232F] p-2 rounded">
                  <span className="text-[10px] text-zinc-500 block">MARKET CONSENSUS</span>
                  <span className="text-base font-bold text-zinc-300">
                    {(model.marketProbability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Backtest & Kelly Stake Metrics Row */}
              <div className="flex items-center justify-between border-t border-b border-[#1F232F] py-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 block">WIN RATE / SHARPE</span>
                  <span className="font-bold text-zinc-200">
                    {model.historicalWinRate}% • SR {model.sharpeRatio}
                  </span>
                </div>

                {/* Sparkline curve */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-zinc-500">OUT-OF-SAMPLE ALPHA</span>
                  <svg width="140" height="35" className="overflow-visible">
                    <polyline
                      fill="none"
                      stroke="#00FFA3"
                      strokeWidth="2"
                      points={svgPoints}
                    />
                  </svg>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">KELLY STAKE</span>
                  <span className="font-bold text-[#00FFA3]">
                    {model.suggestedKellyStakePercent}% Allocation
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setExpandedModelId(isExpanded ? null : model.id)}
                  className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  <Info className="h-3 w-3" />
                  <span>{isExpanded ? "Hide Formula" : "Formula Details"}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeployBot(model)}
                  disabled={isDeployed}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    isDeployed
                      ? "bg-emerald-500 text-black"
                      : "bg-[#00FFA3] hover:bg-[#00D688] text-black shadow-md shadow-[#00FFA3]/10"
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>
                    {isDeployed
                      ? "Bot Delegated (Active)"
                      : sessionKey.isAuthorized
                      ? "Deploy Strategy Bot"
                      : "Authorize via Swig"}
                  </span>
                </button>
              </div>

              {/* Expandable Mathematical Formula Drawer */}
              {isExpanded && (
                <div className="rounded-lg bg-[#050608] border border-[#1F232F] p-2.5 text-[11px] font-mono text-zinc-400 space-y-1.5 animate-in fade-in duration-150">
                  <div className="text-zinc-300 font-semibold flex items-center gap-1">
                    <Activity className="h-3 w-3 text-[#00FFA3]" />
                    <span>Mathematical Specification:</span>
                  </div>
                  <p className="leading-relaxed text-zinc-400">
                    {FORMULA_EXPLANATIONS[model.id]}
                  </p>
                  <div className="text-[10px] text-zinc-500 pt-1 border-t border-[#1F232F]">
                    Autonomous trigger: Session key fires execution when statistical edge &gt; 3.0%.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
