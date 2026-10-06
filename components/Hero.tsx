"use client";

import React, { useState } from "react";
import HeroBackground from "./HeroBackground";
import Fluid3DTiltNav from "./Fluid3DTiltNav";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <section className="relative min-h-screen w-full overflow-hidden isolate flex flex-col justify-between bg-[#111113] text-white selection:bg-[#3b40d6] selection:text-white">
      {/* 
        LAYERED DOT-GRID HERO BACKGROUND 
        - Layer 1: .hero-grid (Base full-bleed low-contrast dots)
        - Layer 2: .hero-mask (Brighter blue/indigo dots inside centered logo mask)
        - Layer 3: .hero-motion (Canvas wave shimmer + cursor proximity)
        - Layer 4: Four .vignette-* divs (Smooth gradient edge fade)
      */}
      <HeroBackground
        bg="#111113"
        dotColor="rgba(210, 225, 255, 0.12)"
        accentDotColor="rgba(59, 64, 214, 0.55)"
        maskSize="min(72vw, 42rem)"
        maskUrl="/trayse-mask.svg"
        baseGridPitch={15}
        accentGridPitch={12}
        enableMotion={true}
      />

      {/* 
        LAYER 5: HERO CONTENT (position: relative; z-index: 10)
        All user-facing interactive elements sit cleanly above the background.
      */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        {/* TOP FLOATING NAVIGATION CAPSULE WITH 3D TILT & SURFACE GLARE */}
        <Fluid3DTiltNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* CENTER VIEWPORT SPACER: Allows the centered masked logo to command the space */}
        <div className="flex-1 min-h-[160px] pointer-events-none" />

        {/* BOTTOM SECTION: BRAND HEADLINE (LEFT) & FLOATING STRATEGY WIDGET (RIGHT) */}
        <footer className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pb-8 sm:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10">
          {/* Left Column: Brand Eyebrow, Main Headline, and Social Proof */}
          <div className="max-w-2xl text-left">
            {/* Brand Name Eyebrow in NewBlack Typeface (Title Case) */}
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-[-0.02em] mb-1.5 drop-shadow-sm">
              Trayse
            </h2>

            {/* Monumental Direction B Headline (NewBlack Display Bold) */}
            <h1 className="font-display font-bold text-[38px] sm:text-[52px] md:text-[62px] lg:text-[74px] text-white tracking-[-0.03em] leading-[0.98] mb-3.5 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
              Quantitative Intelligence <br className="hidden sm:inline" />
              for Prediction Markets
            </h1>

            {/* Explanatory Body Copy (Urbanist Regular) */}
            <p className="font-sans font-normal text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed tracking-[-0.015em]">
              To bridge institutional quantitative finance with modern prediction markets.
            </p>
          </div>

          {/* Right Column: Floating Strategy CTA Capsule */}
          <div className="flex md:justify-end w-full md:w-auto">
            <div className="w-full sm:w-auto bg-[#18191e]/85 backdrop-blur-md border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.4)] rounded-full pl-6 sm:pl-7 pr-2 py-2 flex items-center justify-between sm:justify-start gap-6 sm:gap-8 transition-all hover:bg-[#18191e]/95">
              {/* Copy (Urbanist Medium) */}
              <div className="font-sans text-[13px] sm:text-[14px] font-medium text-white leading-tight text-left">
                <div>Build and monitor</div>
                <div>your strategy</div>
              </div>

              {/* CTA Button (Urbanist SemiBold) */}
              <button
                onClick={() => {
                  window.location.href = "/terminal";
                }}
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
