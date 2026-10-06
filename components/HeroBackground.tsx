"use client";

import React, { useEffect, useRef } from "react";

export interface HeroBackgroundProps {
  /** Background color of the page/hero (default: #111113) */
  bg?: string;
  /** Color of base dot grid (default: rgba(210, 225, 255, 0.12)) */
  dotColor?: string;
  /** Color of accent dot pattern visible in mask (default: rgba(59, 64, 214, 0.55)) */
  accentDotColor?: string;
  /** CSS mask size expression (default: min(72vw, 42rem)) */
  maskSize?: string;
  /** Path to SVG mask (default: /trayse-mask.svg) */
  maskUrl?: string;
  /** Base dot grid pitch (default: 15px) */
  baseGridPitch?: number;
  /** Accent dot grid pitch (default: 12px) */
  accentGridPitch?: number;
  /** Enable subtle canvas animation layer (default: true) */
  enableMotion?: boolean;
}

export default function HeroBackground({
  bg = "#111113",
  dotColor = "rgba(210, 225, 255, 0.12)",
  accentDotColor = "rgba(59, 64, 214, 0.55)",
  maskSize = "min(72vw, 42rem)",
  maskUrl = "/trayse-mask.svg",
  baseGridPitch = 15,
  accentGridPitch = 12,
  enableMotion = true,
}: HeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enableMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // Mouse coordinates relative to hero container
    const mousePos = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.targetX = e.clientX - rect.left;
      mousePos.targetY = e.clientY - rect.top;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Handle canvas sizing & High-DPI
    const resize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Pause when hero is scrolled out of viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Pause when tab is hidden
    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Frame rendering loop
    let lastTime = performance.now();
    const fpsLimit = 45; // Capped for ultra-low power consumption
    const fpsInterval = 1000 / fpsLimit;

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Smooth mouse easing
      mousePos.x += (mousePos.targetX - mousePos.x) * 0.12;
      mousePos.y += (mousePos.targetY - mousePos.y) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // If reduced motion is requested, render a clean static shimmer frame and stop
      const time = prefersReducedMotion ? 0 : currentTime * 0.0008;

      // Draw active shimmering dots aligned with the 12px accent grid
      const pitch = accentGridPitch;
      const startX = Math.floor((width % pitch) / 2);
      const startY = Math.floor((height % pitch) / 2);

      // Center region focus (approximate mask bounds to save render cycles)
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.max(width, height) * 0.45;

      for (let x = startX; x < width; x += pitch) {
        for (let y = startY; y < height; y += pitch) {
          const dxCenter = x - centerX;
          const dyCenter = y - centerY;
          const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
          if (distCenter > maxRadius) continue;

          // Slow organic sine wave across diagonal (period ~7.8s)
          const wave = Math.sin(time * 0.9 + (x * 0.012 + y * 0.016));

          // Mouse proximity boost
          const distMouse = Math.hypot(x - mousePos.x, y - mousePos.y);
          const mouseBoost =
            distMouse < 140 ? Math.pow(1 - distMouse / 140, 2) * 0.38 : 0;

          // Subtle opacity wave: sits on top of CSS base dots
          const shimmer = Math.max(0, 0.05 + 0.18 * ((wave + 1) / 2) + mouseBoost);

          if (shimmer > 0.03) {
            ctx.fillStyle = `rgba(90, 105, 255, ${shimmer.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (prefersReducedMotion) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
    };
  }, [enableMotion, accentGridPitch]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
      style={
        {
          "--bg": bg,
          "--dot": dotColor,
          "--dot-accent": accentDotColor,
          "--mask-size": maskSize,
          "--mask-url": `url('${maskUrl}')`,
        } as React.CSSProperties
      }
    >
      {/* 1. Base Dot Grid: Covering full hero, very low contrast */}
      <div
        className="hero-grid"
        style={{
          backgroundSize: `${baseGridPitch}px ${baseGridPitch}px`,
        }}
      />

      {/* 2. Masked Layer: Saturated blue/indigo dot grid inside centered logo mask */}
      <div
        className="hero-mask"
        style={{
          backgroundSize: `${accentGridPitch}px ${accentGridPitch}px`,
        }}
      />

      {/* 3. Motion Layer (Optional Canvas Shimmer) */}
      {enableMotion && (
        <canvas
          ref={canvasRef}
          className="hero-motion absolute inset-0 pointer-events-none"
        />
      )}

      {/* 4. Four Vignettes: Edge gradients fading smoothly to --bg */}
      <div className="vignette vignette-top" />
      <div className="vignette vignette-bottom" />
      <div className="vignette vignette-left" />
      <div className="vignette vignette-right" />
    </div>
  );
}
