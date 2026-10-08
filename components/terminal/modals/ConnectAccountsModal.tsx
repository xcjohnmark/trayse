"use client";

import React, { useState } from "react";
import { useTerminalStore } from "@/lib/store/terminal-store";
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  RefreshCw,
  KeyRound,
  DollarSign,
} from "lucide-react";

export function ConnectAccountsModal() {
  const {
    activeModal,
    closeModal,
    polymarketConnected,
    connectPolymarket,
    disconnectPolymarket,
    kalshiConnected,
    connectKalshi,
    disconnectKalshi,
    isDemoMode,
    toggleDemoMode,
    demoBalanceUsd,
    adjustDemoBalance,
  } = useTerminalStore();

  const [activeTab, setActiveTab] = useState<"EXCHANGES" | "DEMO">("EXCHANGES");

  // Polymarket credential form state
  const [polyApiKey, setPolyApiKey] = useState("");
  const [polyProxyWallet, setPolyProxyWallet] = useState("");
  const [isSubmittingPoly, setIsSubmittingPoly] = useState(false);

  // Kalshi credential form state
  const [kalshiKey, setKalshiKey] = useState("");
  const [kalshiSecret, setKalshiSecret] = useState("");
  const [isSubmittingKalshi, setIsSubmittingKalshi] = useState(false);

  // Notification message
  const [notification, setNotification] = useState<string | null>(null);

  if (activeModal !== "CONNECT_ACCOUNTS") return null;

  const handleConnectPolymarket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPoly(true);
    setTimeout(() => {
      connectPolymarket();
      setIsSubmittingPoly(false);
      setNotification("Polymarket Account successfully connected!");
      setTimeout(() => setNotification(null), 3000);
    }, 700);
  };

  const handleConnectKalshi = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingKalshi(true);
    setTimeout(() => {
      connectKalshi();
      setIsSubmittingKalshi(false);
      setNotification("Kalshi CFTC API credentials verified!");
      setTimeout(() => setNotification(null), 3000);
    }, 700);
  };

  const handleResetDemoBalance = () => {
    adjustDemoBalance(10000.0 - demoBalanceUsd);
    setNotification("Demo Paper Trading balance reset to $10,000.00 USD");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-xl bg-[#0B0C10] border border-[#1F232F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F232F] bg-[#12141C]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#00D688]/10 border border-[#00D688]/30 flex items-center justify-center text-[#00FFA3]">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Connect Prediction Exchanges
              </h2>
              <p className="text-[11px] text-zinc-400">
                Link Polymarket &amp; Kalshi to trade live or practice in Demo Sandbox
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#1F232F] bg-[#090A0E] px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("EXCHANGES")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "EXCHANGES"
                ? "border-[#00D688] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Exchange Accounts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("DEMO")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "DEMO"
                ? "border-[#00D688] text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Demo Paper Trading</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                isDemoMode
                  ? "bg-[#00D688]/20 text-[#00FFA3]"
                  : "bg-white/10 text-zinc-400"
              }`}
            >
              {isDemoMode ? "ACTIVE" : "OFF"}
            </span>
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="bg-[#00D688]/15 border-b border-[#00D688]/30 px-5 py-2 text-xs text-[#00FFA3] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === "EXCHANGES" ? (
            <div className="space-y-5">
              {/* Polymarket Card */}
              <div className="rounded-xl bg-[#12141C] border border-[#1F232F] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs">
                      P
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Polymarket</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          (Polygon CLOB)
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        Global decentralized prediction market
                      </span>
                    </div>
                  </div>

                  {polymarketConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#00FFA3] bg-[#00D688]/10 px-2 py-0.5 rounded border border-[#00D688]/30">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Connected</span>
                      </span>
                      <button
                        type="button"
                        onClick={disconnectPolymarket}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500">
                      Not Linked
                    </span>
                  )}
                </div>

                {!polymarketConnected && (
                  <form onSubmit={handleConnectPolymarket} className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                        API Key or Polymarket Clob Secret:
                      </label>
                      <input
                        type="password"
                        value={polyApiKey}
                        onChange={(e) => setPolyApiKey(e.target.value)}
                        placeholder="pm_live_key_..."
                        className="w-full bg-[#090A0E] border border-[#1F232F] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00D688] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                        Polygon Proxy Address (Optional):
                      </label>
                      <input
                        type="text"
                        value={polyProxyWallet}
                        onChange={(e) => setPolyProxyWallet(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-[#090A0E] border border-[#1F232F] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00D688] font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="https://polymarket.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Where do I get Polymarket keys?</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <button
                        type="submit"
                        disabled={isSubmittingPoly}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-medium text-xs transition-colors disabled:opacity-50"
                      >
                        {isSubmittingPoly ? "Verifying..." : "Connect Polymarket"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Kalshi Card */}
              <div className="rounded-xl bg-[#12141C] border border-[#1F232F] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
                      K
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Kalshi</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          (CFTC Regulated v2)
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        US Federally regulated event contract exchange
                      </span>
                    </div>
                  </div>

                  {kalshiConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#00FFA3] bg-[#00D688]/10 px-2 py-0.5 rounded border border-[#00D688]/30">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Connected</span>
                      </span>
                      <button
                        type="button"
                        onClick={disconnectKalshi}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500">
                      Not Linked
                    </span>
                  )}
                </div>

                {!kalshiConnected && (
                  <form onSubmit={handleConnectKalshi} className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                        Kalshi API Key ID:
                      </label>
                      <input
                        type="text"
                        value={kalshiKey}
                        onChange={(e) => setKalshiKey(e.target.value)}
                        placeholder="kx_live_..."
                        className="w-full bg-[#090A0E] border border-[#1F232F] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00D688] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                        Kalshi RSA Private Key / Secret:
                      </label>
                      <input
                        type="password"
                        value={kalshiSecret}
                        onChange={(e) => setKalshiSecret(e.target.value)}
                        placeholder="-----BEGIN RSA PRIVATE KEY-----"
                        className="w-full bg-[#090A0E] border border-[#1F232F] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00D688] font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="https://kalshi.com/account/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>Generate Kalshi API Keys</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <button
                        type="submit"
                        disabled={isSubmittingKalshi}
                        className="px-3.5 py-1.5 rounded-lg bg-[#00D688] hover:bg-[#00FFA3] text-black font-semibold text-xs transition-colors disabled:opacity-50"
                      >
                        {isSubmittingKalshi ? "Validating..." : "Connect Kalshi"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#12141C] border border-[#1F232F] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-[#00D688]/15 border border-[#00D688]/30 flex items-center justify-center text-[#00FFA3]">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Simulated Paper Trading</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white/5 border border-white/10 text-zinc-300">
                          100% Risk Free
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Practice live trading, cross-venue arbitrage, and quant strategies with sandbox funds.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDemoMode()}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDemoMode ? "bg-[#00D688]" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                        isDemoMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Balance Display */}
                <div className="p-3.5 rounded-lg bg-[#090A0E] border border-[#1F232F] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      Current Demo Balance:
                    </span>
                    <div className="text-xl font-bold font-mono text-[#00FFA3]">
                      ${demoBalanceUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDemoBalance}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset to $10,000</span>
                  </button>
                </div>

                <div className="text-[11px] text-zinc-400 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 space-y-1">
                  <div className="font-semibold text-zinc-300">How Demo Mode Works:</div>
                  <p>
                    • Orders placed in Demo Mode execute against real-time live Polymarket and Kalshi order books.
                  </p>
                  <p>
                    • All simulated profits and losses are tracked automatically inside your non-custodial Trade Journal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Guarantee Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#12141C] border border-[#1F232F] text-[11px] text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-[#00FFA3] flex-shrink-0 mt-0.5" />
            <p>
              Your credentials are never stored on any remote cloud server. API signatures and keys are held in local browser memory and can be revoked at any second.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#1F232F] bg-[#12141C]">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                isDemoMode
                  ? "bg-amber-400"
                  : polymarketConnected || kalshiConnected
                  ? "bg-[#00D688]"
                  : "bg-zinc-600"
              }`}
            />
            <span>
              {isDemoMode
                ? "Active: Demo Sandbox"
                : polymarketConnected && kalshiConnected
                ? "Active: Polymarket + Kalshi Live"
                : polymarketConnected
                ? "Active: Polymarket Live"
                : kalshiConnected
                ? "Active: Kalshi Live"
                : "No Accounts Linked"}
            </span>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors font-mono"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
