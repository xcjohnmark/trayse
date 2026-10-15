"use client";

import * as React from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  Sparkles,
  Wallet,
  ShieldCheck,
  ArrowLeftRight,
  Cpu,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

interface PersonaOption {
  id: "ARBITRAGEUR" | "QUANT" | "ANALYST" | "HEDGER";
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}

const PERSONAS: PersonaOption[] = [
  {
    id: "ARBITRAGEUR",
    title: "Statistical Arbitrageur",
    tagline: "Cross-Venue Delta-Neutral Locks",
    description:
      "Exploit mispricings between Polymarket and Kalshi with synthetic delta-neutral execution and yield-bearing USDG collateral.",
    icon: ArrowLeftRight,
    badge: "Most Popular",
  },
  {
    id: "QUANT",
    title: "Quantitative Trader",
    tagline: "Algorithmic & Systematic Trading",
    description:
      "Access multi-venue depth ladders, automated order routing, and quantitative execution tools.",
    icon: Cpu,
    badge: "Systematic",
  },
  {
    id: "ANALYST",
    title: "Prediction Market Analyst",
    tagline: "Macro Skew & Bayesian Fair Value",
    description:
      "Analyze implied volatility skew, macroeconomic policy bets, election probability vectors, and historical resolution data.",
    icon: TrendingUp,
    badge: "Deep Research",
  },
  {
    id: "HEDGER",
    title: "Macro Equity Hedger",
    tagline: "Synthetic Hedging & Basis Trading",
    description:
      "Hedge real-world event risk against Robinhood tokenized equities and interest rate derivatives with tight session stop-losses.",
    icon: ShieldCheck,
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
    authorizeSessionKey,
  } = useTerminalStore();

  const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedWallet, setSelectedWallet] = React.useState<string>("phantom");

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <div className="w-full max-w-2xl sm:max-w-3xl rounded-3xl border border-white/[0.08] bg-[#0C0D11] text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative my-auto">
        {/* Subtle top hairline highlight with centered ambient glow */}
        <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[2px] bg-[#00D688] blur-[2px] opacity-70" />
          </div>
        </div>

        {/* TOP BAR: BRANDING, STEPPER, DISMISS */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 sm:px-7 py-4 bg-[#0E0F14]/90 backdrop-blur-sm">
          {/* Brand & Monogram Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center font-display font-black text-base text-white shrink-0">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-sm tracking-tight text-white">
                  Trayse Terminal
                </span>
                <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-zinc-300">
                  ONBOARDING
                </span>
              </div>
              <p className="text-[11px] font-sans text-zinc-400">
                Institutional Quantitative Setup Wizard
              </p>
            </div>
          </div>

          {/* Stepper & Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Segmented Step Indicator (Falcon / ReUI Style) */}
            <div className="hidden sm:inline-flex items-center p-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
              {STEPS.map((s) => {
                const isActive = currentStep === s.id;
                const isCompleted = currentStep > s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStep(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all ${
                      isActive
                        ? "bg-white text-black font-semibold shadow-sm"
                        : isCompleted
                        ? "text-zinc-300 hover:text-white"
                        : "text-zinc-600 cursor-default"
                    }`}
                  >
                    <span className={isActive ? "font-bold" : "font-mono text-[10px]"}>
                      {s.short}
                    </span>
                    <span className="hidden md:inline font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-sans font-medium text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-full hover:bg-white/[0.05] transition-colors"
              title="Skip and use defaults"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleSkip}
              aria-label="Close modal"
              className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="p-6 sm:p-8 min-h-[420px] flex flex-col justify-between">
          {/* STEP 0: TRADER PERSONA */}
          {currentStep === 0 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="font-display font-medium text-xs tracking-wider uppercase text-[#E5A93C] mb-1.5 block">
                  STEP 01 / PROFILE ARCHETYPE
                </span>
                <h2
                  id="onboarding-modal-title"
                  className="font-headline font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight"
                >
                  Select Your Quantitative Focus
                </h2>
                <p className="font-sans font-normal text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Tailors default market filters, order book depth ladders, and arbitrage threshold alerts to your workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {PERSONAS.map((p) => {
                  const isSelected = traderPersona === p.id;
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setTraderPersona(p.id)}
                      className={`group relative p-5 rounded-2xl border transition-all flex flex-col justify-between text-left cursor-pointer ${
                        isSelected
                          ? "bg-white/[0.05] border-[#00D688]/60 ring-1 ring-[#00D688]/30 shadow-[0_0_24px_rgba(0,214,136,0.1)]"
                          : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-[#00D688]/15 border-[#00D688]/30 text-[#00FFA3]"
                                  : "bg-white/[0.04] border-white/[0.08] text-white group-hover:border-white/[0.15]"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-headline font-bold text-sm sm:text-base text-white tracking-tight">
                                {p.title}
                              </div>
                              <div className="font-sans font-medium text-xs text-[#00D688] mt-0.5">
                                {p.tagline}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#00D688]/20 border border-[#00D688]/50 flex items-center justify-center text-[#00FFA3] shrink-0 mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <p className="font-sans font-normal text-xs text-zinc-400 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-sans text-zinc-400">
                        <span>Profile Archetype</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-300 font-medium">
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
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="font-display font-medium text-xs tracking-wider uppercase text-[#E5A93C] mb-1.5 block">
                  STEP 02 / WEB3 IDENTITY
                </span>
                <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                  Connect Solana Web3 Trading Identity
                </h2>
                <p className="font-sans font-normal text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Non-custodial account abstraction. Your private keys never leave your device; orders are signed via delegated Swig session keys.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Phantom */}
                <div
                  onClick={() => setSelectedWallet("phantom")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                    selectedWallet === "phantom"
                      ? "bg-white/[0.05] border-[#00D688]/60 ring-1 ring-[#00D688]/30 shadow-[0_0_24px_rgba(0,214,136,0.1)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#AB9FF2]/15 border border-[#AB9FF2]/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-[#AB9FF2]" />
                    </div>
                    <div>
                      <div className="font-headline font-bold text-sm text-white tracking-tight">
                        Phantom Wallet
                      </div>
                      <div className="font-sans text-xs text-zinc-400 mt-0.5">
                        Solana SVM Native
                      </div>
                    </div>
                  </div>
                  {selectedWallet === "phantom" && (
                    <div className="w-5 h-5 rounded-full bg-[#00D688]/20 border border-[#00D688]/50 flex items-center justify-center text-[#00FFA3]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Backpack */}
                <div
                  onClick={() => setSelectedWallet("backpack")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                    selectedWallet === "backpack"
                      ? "bg-white/[0.05] border-[#00D688]/60 ring-1 ring-[#00D688]/30 shadow-[0_0_24px_rgba(0,214,136,0.1)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <div className="font-headline font-bold text-sm text-white tracking-tight">
                        Backpack
                      </div>
                      <div className="font-sans text-xs text-zinc-400 mt-0.5">
                        xNFT & Hardware Support
                      </div>
                    </div>
                  </div>
                  {selectedWallet === "backpack" && (
                    <div className="w-5 h-5 rounded-full bg-[#00D688]/20 border border-[#00D688]/50 flex items-center justify-center text-[#00FFA3]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Solflare */}
                <div
                  onClick={() => setSelectedWallet("solflare")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                    selectedWallet === "solflare"
                      ? "bg-white/[0.05] border-[#00D688]/60 ring-1 ring-[#00D688]/30 shadow-[0_0_24px_rgba(0,214,136,0.1)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-headline font-bold text-sm text-white tracking-tight">
                        Solflare
                      </div>
                      <div className="font-sans text-xs text-zinc-400 mt-0.5">
                        Institutional Ledger Support
                      </div>
                    </div>
                  </div>
                  {selectedWallet === "solflare" && (
                    <div className="w-5 h-5 rounded-full bg-[#00D688]/20 border border-[#00D688]/50 flex items-center justify-center text-[#00FFA3]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Instant Simulated Dev Wallet */}
                <div
                  onClick={() => setSelectedWallet("demo")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                    selectedWallet === "demo"
                      ? "bg-white/[0.05] border-[#00D688]/60 ring-1 ring-[#00D688]/30 shadow-[0_0_24px_rgba(0,214,136,0.1)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00D688]/15 border border-[#00D688]/30 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-[#00FFA3]" />
                    </div>
                    <div>
                      <div className="font-headline font-bold text-sm text-white tracking-tight">
                        Instant Demo Key
                      </div>
                      <div className="font-sans text-xs text-[#00D688] mt-0.5">
                        1-Click Test Drive (Pre-funded)
                      </div>
                    </div>
                  </div>
                  {selectedWallet === "demo" && (
                    <div className="w-5 h-5 rounded-full bg-[#00D688]/20 border border-[#00D688]/50 flex items-center justify-center text-[#00FFA3]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Capsule */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#00D688] animate-pulse" />
                  <span className="text-zinc-400 font-sans">Identity Bound:</span>
                  <span className="text-zinc-200 font-semibold font-mono">
                    7xKP8h...9d2F
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-sans">
                  <span>Network:</span>
                  <span className="text-sky-400 font-medium font-mono">Mainnet Connected</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SWIG SMART SESSION KEYS & RISK GUARDRAILS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="font-display font-medium text-xs tracking-wider uppercase text-[#E5A93C] mb-1.5 block">
                  STEP 03 / SESSION GUARDRAILS
                </span>
                <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                  Swig Algorithmic Session Guardrails
                </h2>
                <p className="font-sans font-normal text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Execute sub-12ms trades without manual popup clicks. Enforces hard cryptographic maximums directly on-chain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Max Single Position */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-zinc-300 font-medium">
                      Max Single Position
                    </span>
                    <span className="font-mono text-[#00D688] font-bold text-sm">
                      ${maxPosition} USD
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[100, 250, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMaxPosition(amt)}
                        className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
                          maxPosition === amt
                            ? "bg-white text-black font-bold shadow-sm"
                            : "bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Slippage Protection */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-zinc-300 font-medium">
                      Slippage Protection
                    </span>
                    <span className="font-mono text-sky-400 font-bold text-sm">
                      {maxSlippage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0.5, 1.0, 2.0].map((slip) => (
                      <button
                        key={slip}
                        type="button"
                        onClick={() => setMaxSlippage(slip)}
                        className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
                          maxSlippage === slip
                            ? "bg-white text-black font-bold shadow-sm"
                            : "bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        {slip}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Drawdown Breaker */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-zinc-300 font-medium">
                      Daily Loss Circuit Breaker
                    </span>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      ${dailyLoss}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[500, 1000, 2500].map((loss) => (
                      <button
                        key={loss}
                        type="button"
                        onClick={() => setDailyLoss(loss)}
                        className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
                          dailyLoss === loss
                            ? "bg-white text-black font-bold shadow-sm"
                            : "bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        ${loss}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Duration */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans text-zinc-300 font-medium">
                      Session Expiry
                    </span>
                    <span className="font-mono text-purple-400 font-bold text-sm">
                      {expiryHours} Hours
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[8, 24, 168].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setExpiryHours(h)}
                        className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
                          expiryHours === h
                            ? "bg-white text-black font-bold shadow-sm"
                            : "bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        {h === 168 ? "7 Days" : `${h}h`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-3 text-xs text-zinc-300 font-sans">
                <ShieldCheck className="w-4 h-4 text-[#00D688] shrink-0" />
                <span>
                  All guardrails are stored non-custodially and can be adjusted or revoked instantly in the header menu.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: MARGIN COLLATERAL & ENVIRONMENT */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="font-display font-medium text-xs tracking-wider uppercase text-[#E5A93C] mb-1.5 block">
                  STEP 04 / MARGIN & EXECUTION
                </span>
                <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                  Trading Mode & Margin Capital
                </h2>
                <p className="font-sans font-normal text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Choose between simulated risk-free paper trading or real Solana SVM execution with yield-bearing USDG margin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Paper Trading Card */}
                <div
                  onClick={() => setSelectedEnv("PAPER")}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                    selectedEnv === "PAPER"
                      ? "bg-white/[0.05] border-[#00D688]/60 ring-1 ring-[#00D688]/30 shadow-[0_0_24px_rgba(0,214,136,0.1)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300">
                        RECOMMENDED
                      </span>
                      {selectedEnv === "PAPER" && (
                        <div className="w-5 h-5 rounded-full bg-[#00D688]/20 border border-[#00D688]/50 flex items-center justify-center text-[#00FFA3]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-headline font-bold text-base text-white tracking-tight">
                      Paper Trading Sandbox
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans mt-1.5 leading-relaxed">
                      Risk-free algorithmic testing environment with real-time Polymarket and Kalshi order book feeds.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs">
                    <span className="text-zinc-500 font-sans">Starting Balance:</span>
                    <span className="text-[#00D688] font-bold">
                      $10,000.00 Sim USDG
                    </span>
                  </div>
                </div>

                {/* Live SVM Mainnet Card */}
                <div
                  onClick={() => setSelectedEnv("LIVE")}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                    selectedEnv === "LIVE"
                      ? "bg-white/[0.05] border-[#00D688]/60 ring-1 ring-[#00D688]/30 shadow-[0_0_24px_rgba(0,214,136,0.1)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#00D688]/15 border border-[#00D688]/30 text-[#00FFA3]">
                        INSTITUTIONAL
                      </span>
                      {selectedEnv === "LIVE" && (
                        <div className="w-5 h-5 rounded-full bg-[#00D688]/20 border border-[#00D688]/50 flex items-center justify-center text-[#00FFA3]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-headline font-bold text-base text-white tracking-tight">
                      Live Solana Mainnet
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans mt-1.5 leading-relaxed">
                      Execute real cross-venue arbitrage with margin collateral held in yield-bearing USDG (5.2% APY).
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs">
                    <span className="text-zinc-500 font-sans">Margin Collateral Yield:</span>
                    <span className="text-sky-400 font-bold">5.2% Real APY</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between text-xs font-sans text-zinc-400">
                <span>You can switch between Paper and Live mode at any time in the top header.</span>
              </div>
            </div>
          )}

          {/* STEP 4: WORKSTATION CHEAT SHEET & LAUNCH */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="font-display font-medium text-xs tracking-wider uppercase text-[#E5A93C] mb-1.5 block">
                  STEP 05 / ARCHITECTURE SUMMARY
                </span>
                <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                  Workstation Architecture Ready
                </h2>
                <p className="font-sans font-normal text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Here is a 10-second summary of your 4-pane quantitative trading desk:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Pane 1 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-headline font-black text-xl text-[#E5A93C]">
                      01
                    </span>
                    <h3 className="font-headline font-bold text-sm text-white tracking-tight">
                      Normalized Watchlist (Left)
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Compare real-time odds, 24h spreads, and arbitrage basis between Polymarket and Kalshi in cents (¢).
                  </p>
                </div>

                {/* Pane 2 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-headline font-black text-xl text-[#E5A93C]">
                      02
                    </span>
                    <h3 className="font-headline font-bold text-sm text-white tracking-tight">
                      Market Intelligence (Center-Top)
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    View probability time series, Bayesian fair-value odds, and macro news sentiment correlation vectors.
                  </p>
                </div>

                {/* Pane 3 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-headline font-black text-xl text-[#E5A93C]">
                      03
                    </span>
                    <h3 className="font-headline font-bold text-sm text-white tracking-tight">
                      Order Book Depth (Center-Bottom)
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Depth ladder with cumulative volume visual bars, mid-market spread, and real-time bid/ask liquidity.
                  </p>
                </div>

                {/* Pane 4 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-headline font-black text-xl text-[#E5A93C]">
                      04
                    </span>
                    <h3 className="font-headline font-bold text-sm text-white tracking-tight">
                      Smart Execution Ticket (Right)
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Lock synthetic arbitrage spreads in one tactile click, backed by Swig session keys and USDG margin yield.
                  </p>
                </div>
              </div>

              {/* Hotkey hint */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between text-xs font-sans text-zinc-400">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Pro Tip: Press</span>
                  <kbd className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-zinc-200 font-mono text-[11px]">
                    Cmd + K
                  </kbd>
                  <span>anywhere to launch the Command Palette</span>
                </div>
                <span className="text-[#00D688] font-mono text-[11px] font-medium">
                  Live Feeds Active
                </span>
              </div>
            </div>
          )}

          {/* BOTTOM NAVIGATION ACTIONS */}
          <div className="flex items-center justify-between border-t border-white/[0.08] pt-6 mt-6">
            <div>
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white text-zinc-300 text-xs font-sans font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : (
                <div className="text-xs font-mono text-zinc-500">
                  Step 1 of 5
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-sans font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="group inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Enter Trayse Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
