"use client";

import * as React from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  Sparkle,
  Wallet,
  ShieldCheck,
  ArrowsLeftRight,
  Cpu,
  CurrencyDollar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Key,
  ChartLineUp,
  SlidersHorizontal,
  Flame,
  FileText,
  Lightbulb,
} from "@phosphor-icons/react";

interface PersonaOption {
  id: "ARBITRAGEUR" | "QUANT" | "ANALYST" | "HEDGER";
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
}

const PERSONAS: PersonaOption[] = [
  {
    id: "ARBITRAGEUR",
    title: "Statistical Arbitrageur",
    tagline: "Cross-Venue Delta-Neutral Locks",
    description:
      "Exploit mispricings between Polymarket and Kalshi with synthetic delta-neutral execution and yield-bearing USDG collateral.",
    icon: <ArrowsLeftRight className="w-5 h-5 text-[#00D688]" />,
    badge: "Most Popular",
  },
  {
    id: "QUANT",
    title: "Quantitative Trader",
    tagline: "Algorithmic & Systematic Trading",
    description:
      "Access multi-venue depth ladders, automated order routing, and quantitative execution tools.",
    icon: <Cpu className="w-5 h-5 text-sky-400" />,
    badge: "Systematic",
  },
  {
    id: "ANALYST",
    title: "Prediction Market Analyst",
    tagline: "Macro Skew & Bayesian Fair Value",
    description:
      "Analyze implied volatility skew, macroeconomic policy bets, election probability vectors, and historical resolution data.",
    icon: <ChartLineUp className="w-5 h-5 text-purple-400" />,
    badge: "Deep Research",
  },
  {
    id: "HEDGER",
    title: "Macro Equity Hedger",
    tagline: "Synthetic Hedging & Basis Trading",
    description:
      "Hedge real-world event risk against Robinhood tokenized equities and interest rate derivatives with tight session stop-losses.",
    icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
    badge: "Risk Offset",
  },
];

const STEPS = [
  { id: 0, label: "Persona", short: "01" },
  { id: 1, label: "Identity", short: "02" },
  { id: 2, label: "Guardrails", short: "03" },
  { id: 3, label: "Margin", short: "04" },
  { id: 4, label: "Workstation", short: "05" },
];

export function OnboardingModal() {
  const {
    activeModal,
    closeModal,
    hasOnboarded,
    setOnboarded,
    traderPersona,
    setTraderPersona,
    isDemoMode,
    toggleDemoMode,
    sessionKey,
    authorizeSessionKey,
  } = useTerminalStore();

  const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedWallet, setSelectedWallet] = React.useState<string>("phantom");
  const [walletConnected, setWalletConnected] = React.useState(true);

  // Guardrail state
  const [maxPosition, setMaxPosition] = React.useState(250);
  const [maxSlippage, setMaxSlippage] = React.useState(1.0);
  const [dailyLoss, setDailyLoss] = React.useState(1000);
  const [expiryHours, setExpiryHours] = React.useState(24);

  // Selected environment
  const [selectedEnv, setSelectedEnv] = React.useState<"PAPER" | "LIVE">(
    isDemoMode ? "PAPER" : "LIVE"
  );

  // Ensure modal only opens if triggered or if first launch
  const isOpen = activeModal === "ONBOARDING";

  if (!isOpen) return null;

  const handleComplete = () => {
    // Authorize session key parameters
    authorizeSessionKey(
      maxPosition,
      Math.round(maxSlippage * 100),
      dailyLoss,
      expiryHours
    );

    // Set demo mode according to selection
    toggleDemoMode(selectedEnv === "PAPER");

    // Mark as onboarded in store & localStorage
    setOnboarded(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("trayse_terminal_onboarded_v1", "true");
    }

    closeModal();
  };

  const handleSkip = () => {
    setOnboarded(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("trayse_terminal_onboarded_v1", "true");
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1E2638] bg-[#121722] text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative my-auto">
        {/* Subtle accent highlight beam */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D688] to-transparent" />

        {/* TOP BAR: BRANDING, STEPPER, DISMISS */}
        <div className="flex items-center justify-between border-b border-[#1E2638] px-5 py-3.5 bg-[#0F131C]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#182030] border border-[#242E44] flex items-center justify-center">
              <Sparkle className="w-4 h-4 text-[#00D688]" weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-tight text-white">
                  Trayse Terminal
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#00D688]/15 border border-[#00D688]/30 text-[#00D688]">
                  ONBOARDING
                </span>
              </div>
              <p className="text-[11px] font-sans text-zinc-400">
                Institutional Quantitative Setup Wizard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Indicators */}
            <div className="hidden sm:flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    currentStep === s.id
                      ? "bg-[#00D688]/15 text-[#00D688] border border-[#00D688]/30 font-semibold"
                      : currentStep > s.id
                      ? "text-zinc-400 bg-white/5 border border-white/5"
                      : "text-zinc-600 border border-transparent"
                  }`}
                >
                  <span>{s.short}</span>
                  <span className="hidden md:inline">{s.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSkip}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors font-sans"
              title="Skip and use defaults"
            >
              Skip
            </button>

            <button
              onClick={handleSkip}
              className="rounded p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="p-5 sm:p-6 min-h-[380px] flex flex-col justify-between">
          {/* STEP 0: TRADER PERSONA */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div>
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  Select Your Quantitative Focus
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-sans">
                  Tailors default market filters, order book depth ladders, and
                  arbitrage threshold alerts to your workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {PERSONAS.map((p) => {
                  const isSelected = traderPersona === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setTraderPersona(p.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left group ${
                        isSelected
                          ? "bg-[#182030] border-[#00D688] shadow-[0_0_20px_rgba(0,214,136,0.12)]"
                          : "bg-[#182030]/60 border-[#1E2638] hover:border-[#242E44] hover:bg-[#182030]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg border ${
                              isSelected
                                ? "bg-[#00D688]/15 border-[#00D688]/30"
                                : "bg-[#121722] border-[#242E44]"
                            }`}
                          >
                            {p.icon}
                          </div>
                          <div>
                            <div className="font-display font-semibold text-xs text-white">
                              {p.title}
                            </div>
                            <div className="text-[10px] font-mono text-[#00D688]">
                              {p.tagline}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle
                            className="w-4 h-4 text-[#00D688] shrink-0"
                            weight="fill"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans mt-2.5 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/5">
                        <span>Profile Archetype</span>
                        <span className="text-zinc-300 px-1.5 py-0.2 rounded bg-white/5">
                          {p.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1: IDENTITY & WALLET SIGNUP */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div>
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  Connect Solana Web3 Trading Identity
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-sans">
                  Non-custodial account abstraction. Your private keys never leave
                  your device; orders are signed via delegated Swig session keys.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Phantom */}
                <div
                  onClick={() => {
                    setSelectedWallet("phantom");
                    setWalletConnected(true);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedWallet === "phantom"
                      ? "bg-[#182030] border-[#00D688]"
                      : "bg-[#182030]/60 border-[#1E2638] hover:border-[#242E44] hover:bg-[#182030]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#AB9FF2]/15 border border-[#AB9FF2]/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-[#AB9FF2]" />
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-white">
                        Phantom Wallet
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        Solana SVM Native
                      </div>
                    </div>
                  </div>
                  {selectedWallet === "phantom" && (
                    <CheckCircle
                      className="w-4 h-4 text-[#00D688]"
                      weight="fill"
                    />
                  )}
                </div>

                {/* Backpack */}
                <div
                  onClick={() => {
                    setSelectedWallet("backpack");
                    setWalletConnected(true);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedWallet === "backpack"
                      ? "bg-[#182030] border-[#00D688]"
                      : "bg-[#182030]/60 border-[#1E2638] hover:border-[#242E44] hover:bg-[#182030]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-white">
                        Backpack
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        xNFT & Hardware Support
                      </div>
                    </div>
                  </div>
                  {selectedWallet === "backpack" && (
                    <CheckCircle
                      className="w-4 h-4 text-[#00D688]"
                      weight="fill"
                    />
                  )}
                </div>

                {/* Solflare */}
                <div
                  onClick={() => {
                    setSelectedWallet("solflare");
                    setWalletConnected(true);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedWallet === "solflare"
                      ? "bg-[#182030] border-[#00D688]"
                      : "bg-[#182030]/60 border-[#1E2638] hover:border-[#242E44] hover:bg-[#182030]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-white">
                        Solflare
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        Institutional Ledger Support
                      </div>
                    </div>
                  </div>
                  {selectedWallet === "solflare" && (
                    <CheckCircle
                      className="w-4 h-4 text-[#00D688]"
                      weight="fill"
                    />
                  )}
                </div>

                {/* Instant Simulated Dev Wallet */}
                <div
                  onClick={() => {
                    setSelectedWallet("demo");
                    setWalletConnected(true);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedWallet === "demo"
                      ? "bg-[#182030] border-[#00D688]"
                      : "bg-[#182030]/60 border-[#1E2638] hover:border-[#242E44] hover:bg-[#182030]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#00D688]/15 border border-[#00D688]/30 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-[#00D688]" />
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-white">
                        Instant Demo Key
                      </div>
                      <div className="text-[10px] font-mono text-[#00D688]">
                        1-Click Test Drive (Pre-funded)
                      </div>
                    </div>
                  </div>
                  {selectedWallet === "demo" && (
                    <CheckCircle
                      className="w-4 h-4 text-[#00D688]"
                      weight="fill"
                    />
                  )}
                </div>
              </div>

              {/* Status Capsule */}
              <div className="p-3.5 rounded-xl bg-[#0F131C] border border-[#1E2638] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D688] animate-pulse" />
                  <span className="text-zinc-400">Identity Bound:</span>
                  <span className="text-zinc-200 font-semibold">
                    7xKP8h...9d2F
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>Network:</span>
                  <span className="text-sky-400">Mainnet Connected</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SWIG SMART SESSION KEYS & RISK GUARDRAILS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div>
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  Swig Algorithmic Session Guardrails
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-sans">
                  Execute sub-12ms trades without manual popup clicks. Enforces
                  hard cryptographic maximums directly on-chain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Max Single Position */}
                <div className="p-3.5 rounded-xl bg-[#182030] border border-[#242E44] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-zinc-300">
                      Max Single Position
                    </span>
                    <span className="font-mono text-[#00D688] font-bold">
                      ${maxPosition} USD
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[100, 250, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMaxPosition(amt)}
                        className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                          maxPosition === amt
                            ? "bg-[#00D688]/20 border-[#00D688] text-[#00D688] font-bold"
                            : "bg-[#0F131C] border-[#242E44] text-zinc-400 hover:text-white"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Slippage Protection */}
                <div className="p-3.5 rounded-xl bg-[#182030] border border-[#242E44] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-zinc-300">
                      Slippage Protection
                    </span>
                    <span className="font-mono text-sky-400 font-bold">
                      {maxSlippage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[0.5, 1.0, 2.0].map((slip) => (
                      <button
                        key={slip}
                        type="button"
                        onClick={() => setMaxSlippage(slip)}
                        className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                          maxSlippage === slip
                            ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold"
                            : "bg-[#0F131C] border-[#242E44] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {slip}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Drawdown Breaker */}
                <div className="p-3.5 rounded-xl bg-[#182030] border border-[#242E44] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-zinc-300">
                      Daily Loss Circuit Breaker
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      ${dailyLoss}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[500, 1000, 2500].map((loss) => (
                      <button
                        key={loss}
                        type="button"
                        onClick={() => setDailyLoss(loss)}
                        className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                          dailyLoss === loss
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                            : "bg-[#0F131C] border-[#242E44] text-zinc-400 hover:text-white"
                        }`}
                      >
                        ${loss}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Duration */}
                <div className="p-3.5 rounded-xl bg-[#182030] border border-[#242E44] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-zinc-300">
                      Session Expiry
                    </span>
                    <span className="font-mono text-purple-400 font-bold">
                      {expiryHours} Hours
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[8, 24, 168].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setExpiryHours(h)}
                        className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                          expiryHours === h
                            ? "bg-purple-500/20 border-purple-400 text-purple-300 font-bold"
                            : "bg-[#0F131C] border-[#242E44] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {h === 168 ? "7 Days" : `${h}h`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#00D688]/10 border border-[#00D688]/20 flex items-center gap-2.5 text-xs text-[#00D688] font-sans">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  All guardrails are stored non-custodially and can be adjusted
                  or revoked instantly in the header menu.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: MARGIN COLLATERAL & ENVIRONMENT */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div>
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  Trading Mode & Margin Capital
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-sans">
                  Choose between simulated risk-free paper trading or real Solana
                  SVM execution with yield-bearing USDG margin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Paper Trading Card */}
                <div
                  onClick={() => setSelectedEnv("PAPER")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedEnv === "PAPER"
                      ? "bg-[#182030] border-[#00D688] shadow-[0_0_20px_rgba(0,214,136,0.12)]"
                      : "bg-[#182030]/60 border-[#1E2638] hover:border-[#242E44] hover:bg-[#182030]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 border border-purple-500/30 text-purple-300">
                        RECOMMENDED
                      </span>
                      {selectedEnv === "PAPER" && (
                        <CheckCircle
                          className="w-4 h-4 text-[#00D688]"
                          weight="fill"
                        />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-sm text-white">
                      Paper Trading Sandbox
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans mt-1">
                      Risk-free algorithmic testing environment with real-time
                      Polymarket and Kalshi order book feeds.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                    <span className="text-zinc-500">Starting Balance:</span>
                    <span className="text-[#00D688] font-bold">
                      $10,000.00 Sim USDG
                    </span>
                  </div>
                </div>

                {/* Live SVM Mainnet Card */}
                <div
                  onClick={() => setSelectedEnv("LIVE")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedEnv === "LIVE"
                      ? "bg-[#182030] border-[#00D688] shadow-[0_0_20px_rgba(0,214,136,0.12)]"
                      : "bg-[#182030]/60 border-[#1E2638] hover:border-[#242E44] hover:bg-[#182030]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00D688]/15 border border-[#00D688]/30 text-[#00D688]">
                        INSTITUTIONAL
                      </span>
                      {selectedEnv === "LIVE" && (
                        <CheckCircle
                          className="w-4 h-4 text-[#00D688]"
                          weight="fill"
                        />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-sm text-white">
                      Live Solana Mainnet
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans mt-1">
                      Execute real cross-venue arbitrage with margin collateral
                      held in yield-bearing USDG (5.2% APY).
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                    <span className="text-zinc-500">Margin Collateral Yield:</span>
                    <span className="text-sky-400 font-bold">5.2% Real APY</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0F131C] border border-[#1E2638] flex items-center justify-between text-xs font-sans text-zinc-400">
                <span>You can switch between Paper and Live mode at any time in the top header.</span>
              </div>
            </div>
          )}

          {/* STEP 4: WORKSTATION CHEAT SHEET & LAUNCH */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div>
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  Workstation Architecture Ready
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-sans">
                  Here is a 10-second summary of your 4-pane quantitative trading
                  desk:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-[#182030] border border-[#242E44] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold font-display">
                    <span className="w-4 h-4 rounded bg-[#00D688]/20 text-[#00D688] flex items-center justify-center font-mono text-[10px]">
                      1
                    </span>
                    <span>Normalized Watchlist (Left)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Compare real-time odds, 24h spreads, and arbitrage basis
                    between Polymarket and Kalshi in cents (¢).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#182030] border border-[#242E44] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold font-display">
                    <span className="w-4 h-4 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-mono text-[10px]">
                      2
                    </span>
                    <span>Market Intelligence (Center-Top)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    View probability time series, Bayesian fair-value odds, and
                    macro news sentiment correlation vectors.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#182030] border border-[#242E44] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold font-display">
                    <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[10px]">
                      3
                    </span>
                    <span>Order Book Depth (Center-Bottom)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Depth ladder with cumulative volume visual bars, mid-market
                    spread, and real-time bid/ask liquidity.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#182030] border border-[#242E44] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold font-display">
                    <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono text-[10px]">
                      4
                    </span>
                    <span>Smart Execution Ticket (Right)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Lock synthetic arbitrage spreads in one tactile click, backed
                    by Swig session keys and USDG margin yield.
                  </p>
                </div>
              </div>

              {/* Hotkey hint */}
              <div className="p-3 rounded-xl bg-[#0F131C] border border-[#1E2638] flex items-center justify-between text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Pro Tip: Press</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[#182030] border border-[#242E44] text-zinc-200 text-[10px]">
                    Cmd + K
                  </kbd>
                  <span>anywhere to launch the Command Palette</span>
                </div>
                <span className="text-[#00D688]">Live Feeds Active</span>
              </div>
            </div>
          )}

          {/* BOTTOM NAVIGATION ACTIONS */}
          <div className="flex items-center justify-between border-t border-[#1E2638] pt-4 mt-6">
            <div>
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#182030] border border-[#242E44] hover:bg-[#242E44] text-zinc-300 text-xs font-sans transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : (
                <div className="text-[11px] font-mono text-zinc-500">
                  Step 1 of 5
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-sans font-semibold text-xs transition-colors shadow-sm"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#00D688] hover:bg-[#00FFA3] text-black font-sans font-bold text-xs transition-all shadow-[0_0_25px_rgba(0,214,136,0.3)] hover:scale-[1.02]"
                >
                  <Sparkle className="w-4 h-4" weight="fill" />
                  Enter Trayse Terminal
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
