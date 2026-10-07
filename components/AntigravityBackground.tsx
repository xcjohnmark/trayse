"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * GOOGLE ANTIGRAVITY HOVER EFFECT ENGINE
 * 
 * Based on technical inspection of antigravity.google:
 * - Engine: High-performance particle physics canvas (.main-particles-container)
 * - Custom Cursor: Multi-instance .custom-cursor with spring-eased scale/opacity transitions
 * - Interaction: Dynamic particle repulsion ("antigravity field"), harmonic spring return,
 *   subtle connecting filaments, and zone-aware cursor badges.
 */

export type CursorMode = "default" | "explore" | "inspect" | "action" | "none";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  phase: number;
  phaseSpeed: number;
  mass: number;
}

export interface AntigravityBackgroundProps {
  /** Background fill color (default: #111113) */
  bg?: string;
  /** Primary particle accent color (default: rgba(99, 132, 255, 0.75)) */
  particleColor?: string;
  /** Mint energy particle color (default: rgba(0, 214, 136, 0.85)) */
  accentColor?: string;
  /** Filaments line color (default: rgba(99, 132, 255, 0.12)) */
  filamentColor?: string;
  /** Radius of the antigravity repulsion field around cursor (px) */
  repulsionRadius?: number;
  /** Repulsion strength multiplier */
  repulsionForce?: number;
  /** Restoring spring tension (0.01 - 0.08) */
  springTension?: number;
  /** Velocity damping (0.85 - 0.96) */
  damping?: number;
  /** Maximum distance between particles to draw connecting filaments (px) */
  connectionDistance?: number;
  /** Enable dynamic custom cursor follower (default: true) */
  enableCustomCursor?: boolean;
}

export default function AntigravityBackground({
  bg = "#111113",
  particleColor = "rgba(120, 145, 255, 0.65)",
  accentColor = "rgba(0, 214, 136, 0.8)",
  filamentColor = "rgba(90, 115, 240, 0.15)",
  repulsionRadius = 220,
  repulsionForce = 18,
  springTension = 0.038,
  damping = 0.91,
  connectionDistance = 85,
  enableCustomCursor = true,
}: AntigravityBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cursor tracking state
  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    isHovering: false,
    speed: 0,
    lastX: 0,
    lastY: 0,
  });

  // Custom cursor UI state
  const [cursorActive, setCursorActive] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [cursorLabel, setCursorLabel] = useState("Explore");
  const cursorElementRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check touch capabilities
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    }
  }, []);

  // Update cursor position smoothly via RAF
  useEffect(() => {
    if (!enableCustomCursor || isTouchDevice) return;

    let animId: number;
    let currX = mouseRef.current.x;
    let currY = mouseRef.current.y;

    const tick = () => {
      const mouse = mouseRef.current;
      // Smooth lerp toward mouse target position
      const factor = 0.22;
      currX += (mouse.x - currX) * factor;
      currY += (mouse.y - currY) * factor;

      if (cursorElementRef.current) {
        cursorElementRef.current.style.transform = `translate3d(${currX}px, ${currY}px, 0px) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [enableCustomCursor, isTouchDevice]);

  // Main Canvas Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Particle[] = [];

    // Initialize particle grid with subtle organic variation
    const initParticles = () => {
      const cols = Math.max(12, Math.floor(width / 68));
      const rows = Math.max(8, Math.floor(height / 68));
      const spacingX = width / cols;
      const spacingY = height / rows;

      particles = [];

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // Add organic offset to avoid rigid chessboard look
          const jitterX = (Math.random() - 0.5) * spacingX * 0.6;
          const jitterY = (Math.random() - 0.5) * spacingY * 0.6;
          const originX = i * spacingX + spacingX / 2 + jitterX;
          const originY = j * spacingY + spacingY / 2 + jitterY;

          // Central Trayse emblem bias: particles near center get emerald/mint highlight
          const centerDist = Math.hypot(originX - width / 2, originY - height / 2);
          const isCenterZone = centerDist < Math.min(width, height) * 0.26;
          const isAccent = isCenterZone ? Math.random() > 0.4 : Math.random() > 0.88;

          const baseRadius = isAccent ? 1.8 + Math.random() * 1.0 : 1.1 + Math.random() * 0.8;

          particles.push({
            x: originX,
            y: originY,
            originX,
            originY,
            vx: 0,
            vy: 0,
            radius: baseRadius,
            baseRadius,
            color: isAccent ? accentColor : particleColor,
            glowColor: isAccent ? "rgba(0, 214, 136, 0.4)" : "rgba(99, 132, 255, 0.3)",
            phase: Math.random() * Math.PI * 2,
            phaseSpeed: 0.015 + Math.random() * 0.02,
            mass: 0.8 + Math.random() * 0.6,
          });
        }
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      width = window.innerWidth;
      height = window.innerHeight;
      initParticles();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.033);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const isMouseActive = mouse.isHovering && mouse.x > 0 && mouse.y > 0;

      // 1. UPDATE PARTICLES PHYSICS
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Idle harmonic breathing
        p.phase += p.phaseSpeed;
        const driftX = Math.cos(p.phase) * 1.5;
        const driftY = Math.sin(p.phase * 0.8) * 1.5;
        const currentOriginX = p.originX + driftX;
        const currentOriginY = p.originY + driftY;

        // Antigravity cursor repulsion
        if (isMouseActive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < repulsionRadius && dist > 0.01) {
            // Cubic falloff for ultra-smooth antigravity repulsion wave
            const normDist = 1 - dist / repulsionRadius;
            const force = normDist * normDist * repulsionForce * 40 * (1 / p.mass);

            const nx = dx / dist;
            const ny = dy / dist;

            p.vx += nx * force * dt;
            p.vy += ny * force * dt;

            // Expand radius slightly during proximity excitation
            p.radius = p.baseRadius + normDist * 1.8;
          } else {
            p.radius += (p.baseRadius - p.radius) * 0.1;
          }
        } else {
          p.radius += (p.baseRadius - p.radius) * 0.1;
        }

        // Restoring spring force (Hooke's law: F = -k * displacement)
        const dispX = p.x - currentOriginX;
        const dispY = p.y - currentOriginY;
        const springFx = -dispX * springTension * 60;
        const springFy = -dispY * springTension * 60;

        p.vx += springFx * dt;
        p.vy += springFy * dt;

        // Velocity damping
        p.vx *= Math.pow(damping, dt * 60);
        p.vy *= Math.pow(damping, dt * 60);

        // Position integration
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
      }

      // 2. RENDER CONNECTING FILAMENTS
      const connDistSq = connectionDistance * connectionDistance;
      ctx.lineWidth = 0.75;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / connectionDistance) * 0.22;
            ctx.strokeStyle = `rgba(100, 135, 255, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 3. RENDER PARTICLES
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.radius), 0, Math.PI * 2);
        ctx.fill();

        // Subtle soft halo
        if (p.radius > 2.0) {
          ctx.fillStyle = p.glowColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    accentColor,
    connectionDistance,
    damping,
    filamentColor,
    particleColor,
    repulsionForce,
    repulsionRadius,
    springTension,
  ]);

  // Global Pointer Event Listeners for Zone Triggers and Coordinate Detection
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const mouse = mouseRef.current;
    const x = e.clientX;
    const y = e.clientY;

    mouse.x = x;
    mouse.y = y;
    mouse.isHovering = true;

    // Detect target element under cursor for intelligent label switching
    const target = e.target as HTMLElement | null;
    if (target) {
      const cursorZone = target.closest("[data-cursor]") as HTMLElement | null;
      const cursorModeAttr = target.closest("[data-cursor-mode]") as HTMLElement | null;
      const isInteractiveBtn = target.closest("button, a, [role='button']");

      if (cursorZone && cursorZone.dataset.cursor) {
        setCursorActive(true);
        setCursorLabel(cursorZone.dataset.cursor);
        setCursorMode(
          (cursorZone.dataset.cursorMode as CursorMode) || "explore"
        );
      } else if (isInteractiveBtn) {
        setCursorActive(true);
        setCursorLabel("Launch");
        setCursorMode("action");
      } else {
        // Coordinate zone logic: check if hovering central logo zone or general canvas
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const distFromCenter = Math.hypot(x - vw / 2, y - vh / 2);

        if (distFromCenter < 240) {
          setCursorActive(true);
          setCursorLabel("Trayse");
          setCursorMode("inspect");
        } else {
          setCursorActive(true);
          setCursorLabel("Explore");
          setCursorMode("default");
        }
      }
    }
  }, []);

  const handlePointerEnter = useCallback(() => {
    mouseRef.current.isHovering = true;
    setCursorActive(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    mouseRef.current.isHovering = false;
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;
    setCursorActive(false);
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="main-particles-container absolute inset-0 overflow-hidden select-none pointer-events-auto"
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {/* 
        LAYER 1: THREE/CANVAS PARTICLE SYSTEM 
        Pos: absolute inset-0, captures pointer events for dynamic antigravity repulsion
      */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />

      {/* 
        LAYER 2: VIGNETTE SHADOW BORDERS
        Ensures perfect cinematic fade into neighboring sections
      */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(17,17,19,0.85)_100%)]" />
      <div className="absolute top-0 inset-x-0 h-32 pointer-events-none bg-gradient-to-b from-[#111113] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-36 pointer-events-none bg-gradient-to-t from-[#111113] to-transparent" />

      {/* 
        LAYER 3: MULTI-INSTANCE CUSTOM CURSOR SYSTEM
        Follows hardware mouse via hardware-accelerated translate3d.
        Scales from 0 to 1 with cubic-bezier spring curve on active hover zones.
      */}
      {enableCustomCursor && !isTouchDevice && (
        <div
          ref={cursorElementRef}
          className="custom-cursor-wrapper fixed top-0 left-0 pointer-events-none z-50 will-change-transform"
          style={{ transform: "translate3d(-9999px, -9999px, 0px)" }}
        >
          {/* Instance 1: Default Floating Reticle */}
          <div
            className={`custom-cursor relative flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
              cursorActive ? "opacity-100 scale-100 is-active" : "opacity-0 scale-0"
            } ${
              cursorMode === "action"
                ? "bg-white text-black border-white shadow-[0_0_24px_rgba(255,255,255,0.4)]"
                : cursorMode === "inspect"
                ? "bg-[#090a0e]/85 text-[#00D688] border-[#00D688]/40 shadow-[0_0_24px_rgba(0,214,136,0.25)]"
                : "bg-[#18191e]/85 text-white border-white/20 shadow-[0_0_20px_rgba(59,64,214,0.3)]"
            }`}
          >
            {/* Visual Pulse Indicator Dot */}
            <span
              className={`w-1.5 h-1.5 rounded-full animate-ping ${
                cursorMode === "action"
                  ? "bg-black"
                  : cursorMode === "inspect"
                  ? "bg-[#00D688]"
                  : "bg-[#3b40d6]"
              }`}
            />
            {/* Contextual Action / Zone Label (Urbanist SemiBold) */}
            <span className="font-sans font-semibold text-[11px] tracking-wide uppercase select-none">
              {cursorLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
