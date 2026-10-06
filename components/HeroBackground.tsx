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
  /** Base dot grid pitch (default: 16px) */
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
  dotColor = "rgba(210, 225, 255, 0.12)",
  accentDotColor = "rgba(59, 64, 214, 0.55)",
  maskSize = "min(72vw, 42rem)",
  maskUrl = "/trayse-mask.svg",
  baseGridPitch = 16,
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

    const ctx = canvas.getContext("2d");
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

    // Pointer move listener across window/hero
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

      // 3D CLOTH DEFORMATION:
      // Membrane sinks under cursor weight with gentle tilt
      const maxTilt = 4.5; // degrees
      springs.current.rotX.target = -normY * maxTilt;
      springs.current.rotY.target = normX * maxTilt;
      springs.current.scale.target = 1.018;
      springs.current.depthZ.target = 16;
      springs.current.isHovering = true;

      // RIPPLE GENERATION:
      // Spawn expanding blue-neon shockwaves as cursor glides
      const now = performance.now();
      const distFromLast = Math.hypot(
        clientX - mouseRef.current.lastSpawnX,
        clientY - mouseRef.current.lastSpawnY
      );

      if (distFromLast > 32 || now - mouseRef.current.lastSpawnTime > 160) {
        if (ripples.current.length < 12) {
          ripples.current.push({
            x: clientX,
            y: clientY,
            radius: 4,
            maxRadius: Math.min(rect.width, rect.height) * 0.55,
            speed: 190, // px per second
            intensity: 0.95,
            decay: 1.15, // decay per second
          });
        }
        mouseRef.current.lastSpawnX = clientX;
        mouseRef.current.lastSpawnY = clientY;
        mouseRef.current.lastSpawnTime = now;
      }
    };

    // Click/pointerdown creates an energetic shockwave pulse
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      ripples.current.push({
        x: clientX,
        y: clientY,
        radius: 2,
        maxRadius: Math.max(rect.width, rect.height) * 0.7,
        speed: 260,
        intensity: 1.6,
        decay: 0.95,
      });

      // Extra momentary push into the cloth
      springs.current.rotX.vel += 8;
      springs.current.scale.vel -= 0.02;
    };

    const handlePointerLeave = () => {
      springs.current.isHovering = false;
      // Spring returns to 0 with under-damped organic wobble settle
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

    // Visibility and intersection observer
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

    // Physics & Ripple Simulation Loop
    const render = (currentTime: number) => {
      springs.current.rafId = requestAnimationFrame(render);
      if (!isVisible) return;

      const sp = springs.current;
      if (!sp.lastTime) sp.lastTime = currentTime;
      const dt = Math.min((currentTime - sp.lastTime) / 1000, 0.032);
      sp.lastTime = currentTime;

      // 1. UPDATE 3D MEMBRANE SPRING PHYSICS
      // Stiff while hovering, under-damped harmonic wobble when returning
      const kTilt = sp.isHovering ? 140 : 80;
      const cTilt = sp.isHovering ? 20 : 8; // c=8 produces luxurious 2-cycle wobble

      stepSpring(sp.rotX, kTilt, cTilt, dt);
      stepSpring(sp.rotY, kTilt, cTilt, dt);
      stepSpring(sp.scale, 120, 14, dt);
      stepSpring(sp.depthZ, 120, 14, dt);

      // Smooth mouse easing
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.18;
      m.y += (m.targetY - m.y) * 0.18;

      // Apply 3D tilt & deformation transform to the membrane container
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

        if (rip.intensity < 0.03 || rip.radius > rip.maxRadius) {
          activeRipples.splice(i, 1);
        }
      }

      ctx.clearRect(0, 0, width, height);

      if (prefersReducedMotion) return;

      // 3. RENDER FLUID BLUE-NEON RIPPLE WAVES ACROSS THE GRID
      const pitch = baseGridPitch;
      const startX = Math.floor((width % pitch) / 2);
      const startY = Math.floor((height % pitch) / 2);

      const numRipples = activeRipples.length;
      const mouseActive = m.x > -500;

      for (let x = startX; x < width; x += pitch) {
        for (let y = startY; y < height; y += pitch) {
          // Direct cursor proximity neon aura
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

          // Accumulate ripple wave fronts passing through this dot
          let waveSum = 0;
          for (let rIdx = 0; rIdx < numRipples; rIdx++) {
            const rip = activeRipples[rIdx];
            const dx = x - rip.x;
            const dy = y - rip.y;
            const dist = Math.hypot(dx, dy);
            const diff = Math.abs(dist - rip.radius);

            // Wave band width: 28px
            if (diff < 28) {
              const waveForm =
                Math.cos((diff / 28) * (Math.PI / 2)) * rip.intensity;
              waveSum += waveForm;

              if (dist > 1) {
                const normFact = (waveForm / 28) * 4;
                normalX += (dx / dist) * normFact;
                normalY += (dy / dist) * normFact;
              }
            }
          }

          const totalStimulation = Math.min(1.2, proximity * 0.5 + waveSum * 0.85);

          // Only render active dots where neon ripple is present
          if (totalStimulation > 0.04) {
            // Physical membrane displacement along ripple normal
            const dispX = x + normalX * 4.5;
            const dispY = y + normalY * 4.5;

            // Dot radius expands dynamically at wave crest
            const radius = 1.3 + totalStimulation * 1.5;

            // Blue-neon palette interpolation:
            // Soft cyan-blue (wave flank) -> Electric neon cyan (wave crest)
            const alpha = Math.min(1.0, 0.15 + totalStimulation * 0.85);

            if (totalStimulation > 0.45) {
              // Electric Neon Cyan crest
              ctx.shadowColor = "rgba(0, 240, 255, 0.85)";
              ctx.shadowBlur = 8;
              ctx.fillStyle = `rgba(0, 240, 255, ${alpha.toFixed(3)})`;
            } else if (totalStimulation > 0.2) {
              // Glowing Royal Blue
              ctx.shadowColor = "rgba(43, 102, 255, 0.6)";
              ctx.shadowBlur = 4;
              ctx.fillStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
            } else {
              // Deep Indigo/Cyan ambient
              ctx.shadowBlur = 0;
              ctx.fillStyle = `rgba(99, 102, 241, ${alpha.toFixed(3)})`;
            }

            ctx.beginPath();
            ctx.arc(dispX, dispY, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Reset shadow blur for clean frame boundaries
      ctx.shadowBlur = 0;
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
