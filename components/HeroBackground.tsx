"use client";

import React, { useEffect, useRef } from "react";

export interface HeroBackgroundProps {
  /** Background color of the page/hero (default: #111113) */
  bg?: string;
  /** Color of base dot grid (default: rgba(210, 225, 255, 0.08)) */
  dotColor?: string;
  /** Color of accent dot pattern visible in mask (default: rgba(59, 64, 214, 0.4)) */
  accentDotColor?: string;
  /** CSS mask size expression (default: min(72vw, 50rem)) */
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

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  intensity: number;
  decay: number;
}

interface SpringState {
  pos: number;
  vel: number;
  target: number;
}

export default function HeroBackground({
  bg = "#111113",
  dotColor = "rgba(210, 225, 255, 0.08)",
  accentDotColor = "rgba(59, 64, 214, 0.4)",
  maskSize = "min(72vw, 50rem)",
  maskUrl = "/trayse-mask.svg",
  baseGridPitch = 15,
  accentGridPitch = 12,
  enableMotion = true,
}: HeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const membraneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background 3D Cloth Membrane Spring State
  const springs = useRef({
    rotX: { pos: 0, vel: 0, target: 0 } as SpringState,
    rotY: { pos: 0, vel: 0, target: 0 } as SpringState,
    scale: { pos: 1, vel: 0, target: 1 } as SpringState,
    depthZ: { pos: 0, vel: 0, target: 0 } as SpringState,
    isHovering: false,
    lastTime: 0,
    rafId: 0,
  });

  // Cursor tracking & active ripples state
  const mouseRef = useRef({
    x: -2000,
    y: -2000,
    targetX: -2000,
    targetY: -2000,
    lastSpawnX: -2000,
    lastSpawnY: -2000,
    lastSpawnTime: 0,
  });

  const ripples = useRef<Ripple[]>([]);

  useEffect(() => {
    if (!enableMotion) return;
    const canvas = canvasRef.current;
    const membrane = membraneRef.current;
    if (!canvas || !membrane) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let isRunning = true;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // Numerical spring integrator
    const stepSpring = (
      s: SpringState,
      k: number,
      c: number,
      dt: number
    ) => {
      const force = -k * (s.pos - s.target) - c * s.vel;
      s.vel += force * dt;
      s.pos += s.vel * dt;
    };

    // Pointer move listener across window/hero with snappy response
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouseRef.current.targetX = clientX;
      mouseRef.current.targetY = clientY;

      // Normalized coordinates from center (-1 to +1)
      const normX = (clientX / rect.width) * 2 - 1;
      const normY = (clientY / rect.height) * 2 - 1;

      // Snappy 3D tilt tracking
      const maxTilt = 4.0;
      springs.current.rotX.target = -normY * maxTilt;
      springs.current.rotY.target = normX * maxTilt;
      springs.current.scale.target = 1.015;
      springs.current.depthZ.target = 14;
      springs.current.isHovering = true;

      // RIPPLE GENERATION: Snappy, natural wave spawning
      const now = performance.now();
      const distFromLast = Math.hypot(
        clientX - mouseRef.current.lastSpawnX,
        clientY - mouseRef.current.lastSpawnY
      );

      // Spawn every 28px or 80ms for fluid, continuous ripples
      if (distFromLast > 28 || now - mouseRef.current.lastSpawnTime > 80) {
        if (ripples.current.length < 10) {
          ripples.current.push({
            x: clientX,
            y: clientY,
            radius: 8,
            maxRadius: Math.min(rect.width, rect.height) * 0.45,
            speed: 280, // Normal, snappy, natural fluid wave propagation (px/sec)
            intensity: 1.0,
            decay: 1.25, // Dissipates cleanly in ~1 second
          });
        }
        mouseRef.current.lastSpawnX = clientX;
        mouseRef.current.lastSpawnY = clientY;
        mouseRef.current.lastSpawnTime = now;
      }
    };

    // Click/pointerdown creates an energetic shockwave
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      ripples.current.push({
        x: clientX,
        y: clientY,
        radius: 12,
        maxRadius: Math.min(rect.width, rect.height) * 0.65,
        speed: 380, // Fast energetic impulse
        intensity: 1.5,
        decay: 1.2,
      });

      springs.current.rotX.vel += 6;
      springs.current.scale.vel -= 0.015;
    };

    const handlePointerLeave = () => {
      springs.current.isHovering = false;
      springs.current.rotX.target = 0;
      springs.current.rotY.target = 0;
      springs.current.scale.target = 1.0;
      springs.current.depthZ.target = 0;

      mouseRef.current.targetX = -2000;
      mouseRef.current.targetY = -2000;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave);

    // Canvas resize handling with HiDPI
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

    // Intersection observer to pause rendering when out of viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // High-performance 60-120 FPS Physics & Render Loop
    const render = (currentTime: number) => {
      springs.current.rafId = requestAnimationFrame(render);
      if (!isVisible) return;

      const sp = springs.current;
      if (!sp.lastTime) sp.lastTime = currentTime;
      const dt = Math.min((currentTime - sp.lastTime) / 1000, 0.032);
      sp.lastTime = currentTime;

      // 1. UPDATE 3D MEMBRANE PHYSICS (Snappy, responsive spring)
      const kTilt = sp.isHovering ? 220 : 150;
      const cTilt = sp.isHovering ? 22 : 13;

      stepSpring(sp.rotX, kTilt, cTilt, dt);
      stepSpring(sp.rotY, kTilt, cTilt, dt);
      stepSpring(sp.scale, 160, 16, dt);
      stepSpring(sp.depthZ, 160, 16, dt);

      // Fast, instantaneous mouse tracking (no sluggish lagging)
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.45;
      m.y += (m.targetY - m.y) * 0.45;

      // Apply membrane 3D transform
      if (membrane) {
        membrane.style.transform = `perspective(1200px) rotateX(${sp.rotX.pos.toFixed(
          2
        )}deg) rotateY(${sp.rotY.pos.toFixed(
          2
        )}deg) scale3d(${sp.scale.pos.toFixed(3)}, ${sp.scale.pos.toFixed(
          3
        )}, 1)`;
      }

      // 2. UPDATE ACTIVE RIPPLES
      const activeRipples = ripples.current;
      for (let i = activeRipples.length - 1; i >= 0; i--) {
        const rip = activeRipples[i];
        rip.radius += rip.speed * dt;
        rip.intensity *= Math.exp(-rip.decay * dt);

        if (rip.intensity < 0.02 || rip.radius > rip.maxRadius) {
          activeRipples.splice(i, 1);
        }
      }

      ctx.clearRect(0, 0, width, height);

      if (prefersReducedMotion) return;

      const numRipples = activeRipples.length;
      const mouseActive = m.x > -500;

      // Early exit if completely idle
      if (!mouseActive && numRipples === 0) return;

      // 3. SPATIAL BOUNDING BOX OPTIMIZATION
      // Slashes iteration count from 9,000+ points down to only the active ripple zone
      const pitch = baseGridPitch;
      const startX = Math.floor((width % pitch) / 2);
      const startY = Math.floor((height % pitch) / 2);

      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;

      if (mouseActive) {
        const cursorReach = 180;
        minX = Math.min(minX, m.x - cursorReach);
        maxX = Math.max(maxX, m.x + cursorReach);
        minY = Math.min(minY, m.y - cursorReach);
        maxY = Math.max(maxY, m.y + cursorReach);
      }

      for (let rIdx = 0; rIdx < numRipples; rIdx++) {
        const rip = activeRipples[rIdx];
        minX = Math.min(minX, rip.x - rip.radius - 8);
        maxX = Math.max(maxX, rip.x + rip.radius + 8);
        minY = Math.min(minY, rip.y - rip.radius - 8);
        maxY = Math.max(maxY, rip.y + rip.radius + 8);
      }

      // Clamp bounding box to screen grid
      const gridMinX = Math.max(startX, Math.floor(minX / pitch) * pitch + startX);
      const gridMaxX = Math.min(width, Math.ceil(maxX / pitch) * pitch + startX);
      const gridMinY = Math.max(startY, Math.floor(minY / pitch) * pitch + startY);
      const gridMaxY = Math.min(height, Math.ceil(maxY / pitch) * pitch + startY);

      // Batch rendering buckets to avoid costly per-dot canvas state switches
      const cyanArcs: { x: number; y: number; r: number }[] = [];
      const blueArcs: { x: number; y: number; r: number }[] = [];
      const indigoArcs: { x: number; y: number; r: number }[] = [];

      for (let x = gridMinX; x <= gridMaxX; x += pitch) {
        for (let y = gridMinY; y <= gridMaxY; y += pitch) {
          let proximity = 0;
          let normalX = 0;
          let normalY = 0;

          if (mouseActive) {
            const dx = x - m.x;
            const dy = y - m.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 180) {
              proximity = Math.pow(1 - dist / 180, 2);
              if (dist > 1) {
                normalX = (dx / dist) * proximity;
                normalY = (dy / dist) * proximity;
              }
            }
          }

          let waveSum = 0;
          for (let rIdx = 0; rIdx < numRipples; rIdx++) {
            const rip = activeRipples[rIdx];
            const dx = x - rip.x;
            const dy = y - rip.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= rip.radius) {
              const normDist = dist / rip.radius;
              const fillWave = Math.pow(Math.cos(normDist * (Math.PI / 2)), 0.8) * rip.intensity;
              waveSum += fillWave;

              if (dist > 1) {
                const normFact = fillWave * 0.35;
                normalX += (dx / dist) * normFact;
                normalY += (dy / dist) * normFact;
              }
            }
          }

          const totalStimulation = Math.min(1.2, proximity * 0.55 + waveSum * 0.9);

          if (totalStimulation > 0.04) {
            const dispX = x + normalX * 4.0;
            const dispY = y + normalY * 4.0;
            const radius = 1.3 + totalStimulation * 1.5;

            if (totalStimulation > 0.45) {
              cyanArcs.push({ x: dispX, y: dispY, r: radius });
            } else if (totalStimulation > 0.2) {
              blueArcs.push({ x: dispX, y: dispY, r: radius });
            } else {
              indigoArcs.push({ x: dispX, y: dispY, r: radius });
            }
          }
        }
      }

      // 4. GPU-ACCELERATED BATCH DRAW CALLS (Single draw call per color tier)
      if (indigoArcs.length > 0) {
        ctx.fillStyle = "rgba(99, 102, 241, 0.45)";
        ctx.beginPath();
        for (let i = 0; i < indigoArcs.length; i++) {
          const a = indigoArcs[i];
          ctx.moveTo(a.x + a.r, a.y);
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      if (blueArcs.length > 0) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
        ctx.beginPath();
        for (let i = 0; i < blueArcs.length; i++) {
          const a = blueArcs[i];
          ctx.moveTo(a.x + a.r, a.y);
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      if (cyanArcs.length > 0) {
        ctx.fillStyle = "rgba(0, 240, 255, 0.95)";
        ctx.beginPath();
        for (let i = 0; i < cyanArcs.length; i++) {
          const a = cyanArcs[i];
          ctx.moveTo(a.x + a.r, a.y);
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    springs.current.rafId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(springs.current.rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
    };
  }, [enableMotion, baseGridPitch]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden [perspective:1200px]"
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
      {/* 
        SUSPENDED CLOTH MEMBRANE CONTAINER 
        Deforms and tilts smoothly in 3D with spring inertia as cursor moves
      */}
      <div
        ref={membraneRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Layer 1: Base low-contrast full-bleed grid */}
        <div
          className="hero-grid"
          style={{
            backgroundSize: `${baseGridPitch}px ${baseGridPitch}px`,
          }}
        />

        {/* 
          Layer 2: Masked saturated blue/indigo dot grid inside centered logo mark
          Elevated along Z-axis for stereoscopic cloth depth 
        */}
        <div
          className="hero-mask"
          style={{
            backgroundSize: `${accentGridPitch}px ${accentGridPitch}px`,
            transform: "translateZ(14px)",
          }}
        />

        {/* 
          Layer 3: Fluid Blue-Neon Ripple Canvas
          Propagates concentric neon shockwaves and cursor-following caustics
        */}
        {enableMotion && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: "translateZ(18px)",
            }}
          />
        )}
      </div>

      {/* Layer 4: Four Edge Vignettes (fading smoothly into page background) */}
      <div className="vignette vignette-top" />
      <div className="vignette vignette-bottom" />
      <div className="vignette vignette-left" />
      <div className="vignette vignette-right" />
    </div>
  );
}
