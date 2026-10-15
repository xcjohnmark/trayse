"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Activity, Terminal } from "lucide-react";

export default function FooterSection() {
  const currentYear = 2026;
  const [clobLatency, setClobLatency] = useState(18);
  const [slotTime, setSlotTime] = useState(388);

  // Subtle live telemetry micro-jitter simulating continuous WebSocket heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setClobLatency(17 + Math.floor(Math.random() * 4)); // 17-20ms
      setSlotTime(380 + Math.floor(Math.random() * 16)); // 380-396ms
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative w-full bg-[#0d0e11] text-white border-t border-white/[0.08] pt-20 pb-16 overflow-hidden">
      {/* Background Micro Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* TOP ROW: BRAND & LIVE INFRASTRUCTURE TELEMETRY */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-14 border-b border-white/[0.08]">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#23252c] flex items-center justify-center border border-white/15">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 60 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0" y="0" width="20" height="10" fill="currentColor" />
                  <rect x="0" y="20" width="20" height="10" fill="currentColor" />
                  <rect x="0" y="40" width="20" height="10" fill="currentColor" />
                  <rect x="20" y="10" width="20" height="10" fill="currentColor" />
                  <rect x="20" y="30" width="20" height="10" fill="currentColor" />
                  <rect x="40" y="0" width="20" height="10" fill="currentColor" />
                  <rect x="40" y="20" width="20" height="10" fill="currentColor" />
                  <rect x="40" y="40" width="20" height="10" fill="currentColor" />
                </svg>
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-[-0.02em]">
                Trayse
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Institutional quantitative intelligence, normalized odds, and automated cross-venue execution across Polymarket, Kalshi, and Solana.
            </p>
          </div>

          {/* Institutional Telemetry Node with Live Jitter */}
          <div className="bg-[#14151a] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D688] animate-pulse" />
              <span className="text-zinc-400">Polymarket CLOB Tape:</span>
              <span className="text-white font-bold tabular-nums">{clobLatency}ms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D688]" />
              <span className="text-zinc-400">Kalshi Klear DCO:</span>
              <span className="text-white font-bold">DCM Synced</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00FFA3]" />
              <span className="text-zinc-400">Solana Slot:</span>
              <span className="text-[#00FFA3] font-bold tabular-nums">{slotTime}ms</span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: FOUR SITEMAP COLUMNS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-14 border-b border-white/[0.08] font-sans text-xs">
          {/* Column 1 */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase text-white tracking-wider mb-4">
              Platform
            </h5>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a href="#explore" className="hover:text-white transition-colors">
                  Arbitrage Scanner
                </a>
              </li>
              <li>
                <Link href="/terminal" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Institutional Terminal</span>
                  <ArrowUpRight className="w-3 h-3 text-[#00FFA3]" />
                </Link>
              </li>
              <li>
                <a href="#explore" className="hover:text-white transition-colors">
                  Quant Model Engine
                </a>
              </li>
              <li>
                <a href="#explore" className="hover:text-white transition-colors">
                  Whale Radar Feed
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase text-white tracking-wider mb-4">
              Developers
            </h5>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a href="#resources" className="hover:text-white transition-colors">
                  trayse-sdk (TypeScript)
                </a>
              </li>
              <li>
                <a href="#resources" className="hover:text-white transition-colors">
                  AsyncIO Python Client
                </a>
              </li>
              <li>
                <a href="#resources" className="hover:text-white transition-colors">
                  Rust Core Engine
                </a>
              </li>
              <li>
                <a href="#resources" className="hover:text-white transition-colors">
                  x402 Micropayments
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase text-white tracking-wider mb-4">
              Research
            </h5>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a href="#resources" className="hover:text-white transition-colors">
                  Synthetic Arbitrage Bounds
                </a>
              </li>
              <li>
                <a href="#resources" className="hover:text-white transition-colors">
                  Modified Kelly Allocation
                </a>
              </li>
              <li>
                <a href="#resources" className="hover:text-white transition-colors">
                  Atmospheric Ensemble Models
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Audit & Security Proofs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h5 className="font-display font-bold text-xs uppercase text-white tracking-wider mb-4">
              Regulatory
            </h5>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Non-Custodial Architecture
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  CFTC Client Partitioning
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Session Key Guardrails
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Terms & Risk Disclosures
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM ROW: LEGAL DISCLAIMER & COPYRIGHT */}
        <div className="pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-sans text-xs text-zinc-400">
          <p className="max-w-3xl leading-relaxed text-zinc-400">
            Trayse is an institutional non-custodial analytics, modeling, and trade routing interface. Binary event contracts and prediction market instruments involve financial risk. US participants access Kalshi directly through CFTC-regulated endpoints under Rule 1.55 risk disclosures. Trayse does not act as a custodian, counterparty, or broker-dealer.
          </p>

          <div className="flex items-center gap-4 shrink-0 font-mono text-[11px] text-zinc-400">
            <span>© {currentYear} Trayse Quant Labs</span>
            <span>·</span>
            <span className="text-[#00FFA3]">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
