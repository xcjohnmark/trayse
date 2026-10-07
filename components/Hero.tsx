"use client";

import React, { useState } from "react";
import HeroBackground from "./HeroBackground";
import AntigravityBackground from "./AntigravityBackground";
import Fluid3DTiltNav from "./Fluid3DTiltNav";

/**
 * BACKGROUND STYLE TOGGLE:
 * - "antigravity": Google Antigravity interactive canvas hover effect + multi-instance custom cursor system
 * - "legacy-masked-dots": Preserves the original cloth-masked dot grid ripple background (HeroBackground.tsx)
 * 
 * To switch back to the previous style at any time, simply change this constant to "legacy-masked-dots".
 */
const BACKGROUND_STYLE: "antigravity" | "legacy-masked-dots" = "legacy-masked-dots";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <section className="relative min-h-screen w-full overflow-hidden isolate flex flex-col justify-between bg-[#111113] text-white selection:bg-[#3b40d6] selection:text-white">
      {/* 
        BACKGROUND LAYER SELECTION
        Allows seamless testing and toggling between the new Google Antigravity hover engine
        and the legacy cloth-masked dot ripple background without deleting any code.
      */}
      {BACKGROUND_STYLE === "antigravity" ? (
        <AntigravityBackground
          bg="#111113"
          particleColor="rgba(120, 145, 255, 0.65)"
          accentColor="rgba(0, 214, 136, 0.85)"
          filamentColor="rgba(90, 115, 240, 0.16)"
          repulsionRadius={220}
          repulsionForce={18}
          enableCustomCursor={true}
        />
      ) : (
        <HeroBackground
          bg="#111113"
          dotColor="rgba(210, 225, 255, 0.08)"
          accentDotColor="rgba(59, 64, 214, 0.4)"
          maskSize="min(72vw, 50rem)"
          maskUrl="/trayse-mask.svg"
          baseGridPitch={15}
          accentGridPitch={12}
          enableMotion={true}
        />
      )}

      {/* 
        HERO FOREGROUND CONTENT (position: relative; z-index: 10)
        All user-facing interactive elements sit cleanly above the background.
      */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        {/* TOP FLOATING NAVIGATION CAPSULE WITH 3D TILT & SURFACE GLARE */}
        <Fluid3DTiltNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* CENTER VIEWPORT SPACER: Allows the centered particle field & logo mark to breathe */}
        <div
          className="flex-1 min-h-[160px] pointer-events-none"
          data-cursor="Trayse Engine"
          data-cursor-mode="inspect"
        />

        {/* BOTTOM SECTION: BRAND HEADLINE (LEFT) & FLOATING STRATEGY WIDGET (RIGHT) */}
        <footer className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pb-8 sm:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10">
          {/* Left Column: Brand Eyebrow, Main Headline, and Explanatory Copy */}
          <div className="max-w-3xl lg:max-w-4xl text-left">
            {/* Brand Name Eyebrow in NewBlack Typeface (Title Case) */}
            <h2
              className="font-display font-bold text-xl sm:text-2xl text-white tracking-[-0.02em] mb-1.5 drop-shadow-sm cursor-default"
              data-cursor="Trayse"
              data-cursor-mode="inspect"
            >
              Trayse
            </h2>

            {/* Monumental Headline in Raleway (Strictly 2 Lines) */}
            <h1
              className="font-headline font-bold text-[28px] sm:text-[42px] md:text-[52px] lg:text-[64px] xl:text-[72px] text-white tracking-[-0.03em] leading-[1.02] sm:leading-[0.98] mb-3.5 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)] cursor-default"
              data-cursor="Quantitative"
              data-cursor-mode="explore"
            >
              <span className="block">Quantitative Intelligence</span>
              <span className="block">for Prediction Markets</span>
            </h1>

            {/* Explanatory Body Copy in Urbanist Regular */}
            <p className="font-sans font-normal text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed tracking-[-0.015em] max-w-2xl">
              To bridge institutional quantitative finance with modern prediction markets.
            </p>
          </div>

          {/* Right Column: Floating Strategy CTA Capsule */}
          <div className="flex md:justify-end w-full md:w-auto">
            <div
              className="w-full sm:w-auto bg-[#18191e]/85 backdrop-blur-md border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.4)] rounded-full pl-6 sm:pl-7 pr-2 py-2 flex items-center justify-between sm:justify-start gap-6 sm:gap-8 transition-all hover:bg-[#18191e]/95"
              data-cursor="Strategy"
              data-cursor-mode="inspect"
            >
              {/* Copy in Urbanist Medium */}
              <div className="font-sans text-[13px] sm:text-[14px] font-medium text-white leading-tight text-left">
                <div>Build and monitor</div>
                <div>your strategy</div>
              </div>

              {/* CTA Button in Urbanist SemiBold */}
              <button
                onClick={() => {
                  window.location.href = "/terminal";
                }}
                data-cursor="Launch ↗"
                data-cursor-mode="action"
                className="font-sans font-semibold text-[13px] sm:text-[14px] bg-white text-black px-5 sm:px-7 py-3 rounded-full tracking-normal hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.25)] whitespace-nowrap"
              >
                Launch Terminal
              </button>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
